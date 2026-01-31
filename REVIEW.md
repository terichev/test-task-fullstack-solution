# Code Review

## Инструкция

Заполните этот файл, описав найденные проблемы. Для каждой проблемы укажите:
1. **Файл и строку** где находится проблема
2. **Описание** что именно не так
3. **Последствия** к чему может привести
4. **Решение** как исправить

---

## Backend

### Проблема 1: SQL Injection

**Файл:** `backend/app/api/items.py`, строка 45

**Описание:**
Пользовательский ввод `search` напрямую вставляется в SQL запрос через f-string:
```python
query = f"SELECT * FROM items WHERE name LIKE '%{search}%'"
```

**Последствия:**
Злоумышленник может выполнить произвольный SQL код. Например, передав `'; DROP TABLE items; --` можно удалить всю таблицу.

**Решение:**
```python
cursor = conn.execute(
    "SELECT * FROM items WHERE name LIKE ?",
    (f"%{search}%",)
)
```

### Проблема 2: Отсутствие валидации входных данных

**Файл:** `backend/app/api/items.py`, строка 57

**Описание:**
Эндпоинт `create_item` принимает `dict` без валидации вместо Pydantic схемы.

**Последствия:**
- Можно передать любые поля, включая вредоносные
- Нет проверки типов и ограничений
- Можно создать item с пустым именем или отрицательной ценой

**Решение:**
```python
from pydantic import BaseModel, Field

class ItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    price: Optional[float] = Field(None, ge=0)

@router.post("/")
async def create_item(data: ItemCreate):
    ...
```

### Проблема 3: Блокирующие вызовы в async функции

**Файл:** `backend/app/api/items.py`, строки 110, 114

**Описание:**
В async функции `enrich_item` используются блокирующие вызовы:
- `time.sleep(2)` - блокирует event loop
- `requests.get()` - синхронный HTTP клиент

**Последствия:**
Блокировка event loop приводит к тому, что сервер не может обрабатывать другие запросы во время ожидания. При нагрузке это приведет к деградации производительности.

**Решение:**
```python
import asyncio
import httpx

await asyncio.sleep(2)

async with httpx.AsyncClient() as client:
    response = await client.get(url, timeout=5.0)
```

---

## Frontend

### Проблема 4: XSS уязвимость

**Файл:** `frontend/src/components/ItemList.tsx`, строка 114

**Описание:**
Использование `dangerouslySetInnerHTML` для отображения description:
```tsx
dangerouslySetInnerHTML={{ __html: item.description }}
```

**Последствия:**
Злоумышленник может внедрить вредоносный JavaScript через поле description. Например: `<script>alert('XSS')</script>` или кража cookies.

**Решение:**
```tsx
{item.description && (
  <div style={styles.itemDescription}>{item.description}</div>
)}
```

### Проблема 5: Memory leak в useEffect

**Файл:** `frontend/src/components/ItemList.tsx`, строки 66-78

**Описание:**
В useEffect создаются interval и event listener, но отсутствует cleanup функция.

**Последствия:**
При размонтировании компонента interval продолжит работать, а event listener останется привязан. Это приводит к утечкам памяти и потенциальным ошибкам.

**Решение:**
```tsx
useEffect(() => {
  fetchItems()
  const interval = setInterval(fetchItems, 5000)
  const handleUpdate = () => fetchItems()
  window.addEventListener('items-updated', handleUpdate)

  return () => {
    clearInterval(interval)
    window.removeEventListener('items-updated', handleUpdate)
  }
}, [])
```

### Проблема 6: Отсутствие типизации

**Файл:** `frontend/src/components/ItemList.tsx`, строки 61, 86, 101, 106, 153

**Описание:**
Везде используется тип `any` вместо явных типов TypeScript.

**Последствия:**
- Теряются преимущества TypeScript
- Компилятор не ловит ошибки типов
- Сложнее поддерживать код

**Решение:**
```tsx
interface Item {
  id: number
  name: string
  description: string | null
  price: number | null
}

const [items, setItems] = useState<Item[]>([])
const handleSubmit = (e: FormEvent<HTMLFormElement>) => { ... }
```

---

## Интеграция

### Проблема 7: Захардкоженный API URL

**Файл:** `frontend/src/components/ItemList.tsx`, строка 3

**Описание:**
API URL захардкожен как `http://localhost:8000/api/items`, хотя в docker-compose передается переменная `VITE_API_URL`.

**Последствия:**
При деплое в production приложение будет обращаться к localhost вместо реального API.

**Решение:**
```tsx
const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/items`
  : 'http://localhost:8000/api/items'
```

### Проблема 8: CORS разрешает все домены

**Файл:** `backend/app/main.py`, строка 15

**Описание:**
CORS настроен с `allow_origins=["*"]`, что разрешает запросы с любого домена.

**Последствия:**
Любой сайт может делать запросы к API от имени пользователя. Это открывает возможности для CSRF атак.

**Решение:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"],
)
```

---

## Дополнительные замечания

1. **Отсутствие обработки ошибок во frontend** - fetch запросы не обрабатывают ошибки сети и HTTP ошибки
2. **DELETE не проверяет существование** - `delete_item` возвращает успех даже если item не существует
3. **init_db() вызывается при импорте** - side effect при импорте модуля, лучше использовать lifespan
