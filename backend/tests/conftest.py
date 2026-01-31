import os
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

os.environ["DATABASE_URL"] = "sqlite:///./test_items.db"

from app.main import app
from app.api.items import init_db, DATABASE


@pytest.fixture(autouse=True)
def setup_test_db():
    """Setup and teardown test database"""
    import sqlite3

    conn = sqlite3.connect(DATABASE)
    conn.execute("DROP TABLE IF EXISTS items")
    conn.commit()
    conn.close()

    init_db()

    yield

    if os.path.exists(DATABASE):
        os.remove(DATABASE)


@pytest_asyncio.fixture
async def client():
    """Async test client"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
