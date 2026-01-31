import pytest


@pytest.mark.asyncio
async def test_create_item(client):
    """Test creating a new item"""
    response = await client.post(
        "/api/items/",
        json={"name": "Test Item", "description": "Test description", "price": 19.99}
    )

    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["message"] == "Item created"


@pytest.mark.asyncio
async def test_get_items(client):
    """Test getting list of items"""
    await client.post(
        "/api/items/",
        json={"name": "Item 1", "description": "Desc 1", "price": 10.0}
    )
    await client.post(
        "/api/items/",
        json={"name": "Item 2", "description": "Desc 2", "price": 20.0}
    )

    response = await client.get("/api/items/")

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 2


@pytest.mark.asyncio
async def test_get_item_not_found(client):
    """Test getting non-existent item returns 404"""
    response = await client.get("/api/items/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Item not found"


@pytest.mark.asyncio
async def test_delete_item(client):
    """Test deleting an item"""
    create_response = await client.post(
        "/api/items/",
        json={"name": "To Delete", "description": None, "price": None}
    )
    item_id = create_response.json()["id"]

    delete_response = await client.delete(f"/api/items/{item_id}")
    assert delete_response.status_code == 200

    get_response = await client.get(f"/api/items/{item_id}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_create_item_validation_error(client):
    """Test validation error for invalid item"""
    response = await client.post(
        "/api/items/",
        json={"name": "", "price": -10}
    )

    assert response.status_code == 422
