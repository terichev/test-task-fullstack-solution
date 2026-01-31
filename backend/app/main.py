from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.items import router as items_router

app = FastAPI(
    title="Items API",
    description="Simple API for managing items",
    version="0.1.0"
)

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(items_router, prefix="/api/items", tags=["items"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
