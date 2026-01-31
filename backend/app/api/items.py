"""
Items API - управление списком элементов
"""
import time
import sqlite3
import requests
from fastapi import APIRouter, HTTPException

router = APIRouter()

# In-memory database simulation
DATABASE = "items.db"


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


init_db()


@router.get("/")
async def get_items(search: str = None):
    """Получить список items с опциональным поиском"""
    conn = get_db()

    if search:
        # Поиск по имени
        query = f"SELECT * FROM items WHERE name LIKE '%{search}%'"
        cursor = conn.execute(query)
    else:
        cursor = conn.execute("SELECT * FROM items")

    items = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return {"items": items}


@router.post("/")
async def create_item(data: dict):
    """Создать новый item"""
    conn = get_db()

    cursor = conn.execute(
        "INSERT INTO items (name, description, price) VALUES (?, ?, ?)",
        (data.get("name"), data.get("description"), data.get("price"))
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

    # Симуляция вызова внешнего API (блокирующий вызов!)
    time.sleep(2)  # Имитация задержки

    # Синхронный HTTP запрос в async функции
    try:
        response = requests.get(
            f"https://api.example.com/enrich?name={row['name']}",
            timeout=5
        )
        enriched_data = response.json()
    except Exception:
        enriched_data = {"extra_info": "default"}

    conn.close()

    return {"item": dict(row), "enriched": enriched_data}
