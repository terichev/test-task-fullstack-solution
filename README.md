# Fullstack Code Review Challenge

## Легенда

Вы присоединились к команде разработки платформы прогнозов (prediction markets). Junior-разработчик написал простое приложение для управления списком items. Код работает, но требует ревью перед деплоем.

## Как начать

### 1. Создайте свой репозиторий

Нажмите кнопку **"Use this template"** → **"Create a new repository"**

- Название: любое (например, `test-task-solution`)
- Видимость: можно сделать **Private** (рекомендуется)
- Нажмите "Create repository"

### 2. Склонируйте свой репозиторий

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 3. Создайте ветку для решения

```bash
git checkout -b solution
```

## Задание

### 1. Code Review (REVIEW.md)

Проведите ревью кода в `backend/` и `frontend/`:
- Найдите минимум **8 проблем** (backend, frontend, интеграция)
- Опишите каждую проблему и её последствия
- Предложите решения

### 2. Исправление кода

- Исправьте все найденные проблемы
- Сохраните функциональность
- Код должен компилироваться без ошибок

### 3. Тесты

- Backend: минимум 2 теста (pytest)
- Frontend: минимум 1 тест (vitest)

## Запуск

```bash
docker-compose up --build
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- API документация: http://localhost:8000/docs

## Структура проекта

```
test-task-fullstack-template/
├── README.md
├── REVIEW.md           # Ваш code review
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── app/
│   │   ├── main.py
│   │   └── api/
│   │       └── items.py
│   └── tests/          # Добавьте тесты
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   └── components/
    │       └── ItemList.tsx
    └── tests/          # Добавьте тесты
```

## Как сдать

### 1. Закоммитьте изменения

```bash
git add .
git commit -m "Решение тестового задания"
git push -u origin solution
```

### 2. Создайте Pull Request в ВАШЕМ репозитории

- Перейдите в ваш репозиторий на GitHub
- Нажмите "Compare & pull request"
- Base: `main` ← Compare: `solution`
- Создайте PR с описанием изменений

### 3. Отправьте ссылку боту

После создания PR скопируйте ссылку и отправьте её боту в Telegram.

Пример ссылки: `https://github.com/YOUR_USERNAME/YOUR_REPO/pull/1`

## Ограничения

- **Время:** 3 часа с момента начала
- **Инструменты:** IDE, документация, Google, Stack Overflow

### ВАЖНО: Запрет на AI для Code Review

**REVIEW.md должен быть написан вами лично, без использования AI-ассистентов.**

Мы проверяем именно ваши навыки анализа кода. AI-сгенерированные ревью легко распознаются и приводят к автоматическому отклонению.

Для написания кода AI-инструменты допустимы, но будьте готовы объяснить решения.

## Критерии оценки

| Критерий | Вес |
|----------|-----|
| Качество code review | 40% |
| Корректность исправлений | 30% |
| Покрытие тестами | 20% |
| Чистота кода | 10% |

## Автоматическая проверка

После создания PR автоматически запустятся:
- Backend: pytest + ruff + mypy
- Frontend: vitest + eslint + tsc
- AI Code Review

Результаты появятся в комментариях к PR.

---

Удачи!
