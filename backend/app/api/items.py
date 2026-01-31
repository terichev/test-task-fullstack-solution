"""
Items API - управление списком элементов
"""
import asyncio
import sqlite3
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

DATABASE = "items.db"


class ItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    price: Optional[float] = Field(None, ge=0)


class ItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: Optional[float]


def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL
        )
    """)
    conn.commit()
    conn.close()


@router.get("/")
async def get_items(search: Optional[str] = None):
    """Получить список items с опциональным поиском"""
    conn = get_db()

    if search:
        cursor = conn.execute(
            "SELECT * FROM items WHERE name LIKE ?",
            (f"%{search}%",)
        )
    else:
        cursor = conn.execute("SELECT * FROM items")

    items = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return {"items": items}


@router.post("/", status_code=201)
async def create_item(data: ItemCreate):
    """Создать новый item"""
    conn = get_db()

    cursor = conn.execute(
        "INSERT INTO items (name, description, price) VALUES (?, ?, ?)",
        (data.name, data.description, data.price)
    )
    conn.commit()

    item_id = cursor.lastrowid
    conn.close()

    return {"id": item_id, "message": "Item created"}


@router.get("/{item_id}")
async def get_item(item_id: int):
    """Получить item по ID"""
    conn = get_db()
    cursor = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Item not found")

    return dict(row)


@router.delete("/{item_id}")
async def delete_item(item_id: int):
    """Удалить item"""
    conn = get_db()

    cursor = conn.execute("SELECT id FROM items WHERE id = ?", (item_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Item not found")

    conn.execute("DELETE FROM items WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()

    return {"message": "Item deleted"}


@router.post("/{item_id}/enrich")
async def enrich_item(item_id: int):
    """Обогатить item данными из внешнего API"""
    conn = get_db()
    cursor = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Item not found")

    await asyncio.sleep(2)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.example.com/enrich?name={row['name']}",
                timeout=5.0
            )
            enriched_data = response.json()
    except Exception:
        enriched_data = {"extra_info": "default"}

    conn.close()

    return {"item": dict(row), "enriched": enriched_data}
