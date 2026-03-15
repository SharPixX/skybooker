# Yandex Air

Fullstack airline booking app: поиск рейсов, выбор места в салоне, бронирование с pessimistic seat locking и Transactional Outbox.

## Preview

![Yandex Air home](docs/screenshots/home-demo.png)

![Yandex Air booking](docs/screenshots/booking-demo.png)

## Что можно делать

- Искать рейсы по городу, аэропорту, дате и классу обслуживания с пагинацией и сортировкой
- Сравнивать три тарифа — Light, Comfort, Business — с ценой и условиями на каждый рейс
- Выбирать место в интерактивной схеме салона Boeing 737-800 и Boeing 777-300
- Бронировать место с pessimistic lock — два пользователя не заберут одно и то же кресло
- Отслеживать статус брони: countdown-таймер, polling, confirm / cancel
- Управлять аккаунтом: регистрация, вход, смена пароля (инвалидирует все старые токены), история бронирований
- Запускать проект в двух режимах:
  - **demo** — без backend и PostgreSQL, на встроенных данных с локальным аккаунтом
  - **live** — с реальным API, Prisma, PostgreSQL и JWT-авторизацией

В demo-режиме приложение работает автономно: mock-рейсы, локальный аккаунт в localStorage, имитация бронирования через sessionStorage. В live-режиме данные идут из PostgreSQL через Prisma, auth через JWT, бронь через pessimistic locking.

## Стек

| Слой | Технологии |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router 7, Tailwind CSS 4, Axios, date-fns, Lucide icons |
| Backend | Node.js, Express 5, TypeScript, Prisma, PostgreSQL, JWT, Zod, bcrypt |
| Security | Helmet, CORS whitelist, express-rate-limit (3 уровня), Zod validation на всех endpoints |
| Тесты | Node.js test runner, supertest-ready архитектура |
| Архитектура | Monorepo (root + backend + frontend), Transactional Outbox, pessimistic locking |

## Что внутри

### Фронтенд

- **9 страниц:** главная, поиск рейсов, схема салона, бронирование, авторизация, профиль, about, help, legal
- **7 компонентов:** Header, Footer, BookingSearchPanel, CityInput (с autocomplete и debounce), DatePicker (custom calendar через portal), LidarPlaneModel, ParticlesBackground
- **Поисковая панель:** trip type toggle, city autocomplete с API, date picker, пассажиры, класс обслуживания, swap-кнопка
- **Схема салона:** два layout-а (737 / 777), фильтр по классу, seat status (available / locked / booked / selected), fare benefits sidebar
- **Бронирование:** countdown timer с progress bar, auto-polling каждые 3 секунды, confirm / cancel / copy booking ID
- **Профиль:** 4 таба (сводка, бронирования, пассажиры, настройки), смена имени, смена пароля с ротацией JWT
- **Demo mode:** explicit detection через `VITE_APP_MODE` или port fallback, полный booking flow на mock-данных
- **Design system:** CSS Custom Properties, Manrope + Instrument Serif, gradient backgrounds, рounding 24-34px

### Бэкенд

- **14 REST API endpoints:**

  | Метод | Путь | Описание |
  |---|---|---|
  | `GET` | `/api/health` | Проверка состояния сервера и БД |
  | `POST` | `/api/auth/register` | Регистрация с Zod validation |
  | `POST` | `/api/auth/login` | Вход, нормализация email, bcrypt |
  | `GET` | `/api/auth/me` | Профиль по JWT |
  | `PUT` | `/api/auth/profile` | Обновление имени |
  | `PUT` | `/api/auth/password` | Смена пароля + ротация токена |
  | `GET` | `/api/flights` | Поиск рейсов с фильтрами и пагинацией |
  | `GET` | `/api/flights/:id` | Рейс с полной картой мест |
  | `POST` | `/api/bookings` | Бронирование через pessimistic lock |
  | `POST` | `/api/bookings/:id/confirm` | Подтверждение брони |
  | `POST` | `/api/bookings/:id/cancel` | Отмена и возврат места |
  | `GET` | `/api/bookings` | Все бронирования текущего пользователя |
  | `GET` | `/api/bookings/:id` | Детали бронирования |
  | `GET` | `/api/cities` | Autocomplete по городам и аэропортам |

- **Rate limiting:** auth 5 req/min, cities 120 req/min, general 300 req/15min, booking mutations 10 req/min
- **Booking confirmation modes:** `manual` (confirm без платежного шлюза) и `disabled` (честный pending-state)
- **Outbox Worker:** polling + `FOR UPDATE SKIP LOCKED`, recovery stuck events, retry с backoff, batch claiming
- **Cleanup Worker:** автоматическое освобождение expired bookings каждые 60 секунд
- **Graceful shutdown:** `SIGTERM`/`SIGINT` → stop workers → close HTTP → disconnect Prisma

### Ключевые решения

#### Pessimistic Seat Locking

Бронирование места проходит через `SELECT ... FOR UPDATE` внутри транзакции. Два параллельных запроса на одно кресло не приведут к double booking — второй пользователь подождёт завершения первой транзакции и получит 409 Conflict.

```
1. BEGIN TRANSACTION
2. SELECT seat FOR UPDATE         — row-level lock
3. Check status = AVAILABLE
4. UPDATE seat → LOCKED
5. INSERT booking (PENDING)
6. INSERT outbox event            — Transactional Outbox
7. COMMIT
```

#### Transactional Outbox Pattern

Intent на оплату сохраняется в той же транзакции, что и бронь. Отдельный worker забирает events через `FOR UPDATE SKIP LOCKED`, отправляет в payment gateway и подтверждает бронь. Если gateway упал — event остаётся в очереди и будет retry (до 3 попыток). Гарантия: at-least-once delivery.

#### Session Stamp

JWT содержит `sessionStamp` — SHA-256 prefix от password hash. При смене пароля все ранее выданные токены автоматически становятся невалидными. Работает без Redis и blocklist'а.

#### Demo / Live Runtime Modes

Режим определяется явно, без тихих fallback'ов:
- `VITE_APP_MODE=demo` — mock-рейсы, localStorage-аккаунт, sessionStorage-бронирования
- `VITE_APP_MODE=live` + `VITE_API_BASE_URL` — реальный API, PostgreSQL, JWT

### Тесты

- **Auth service:** нормализация email, login с mixed-case, ротация session при смене пароля, trim имени
- **Booking service:** ownership check (403 при чужой брони), stable ordering, correct query params

### Архитектура

```
yandex-air/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma           # 6 моделей: Airport, Flight, Seat, User, Booking, OutboxEvent
│   └── src/
│       ├── index.ts                # Express app, rate limiters, graceful shutdown
│       ├── config/
│       │   └── bookingMode.ts      # manual | disabled confirmation
│       ├── controllers/
│       │   ├── authController.ts
│       │   ├── bookingController.ts
│       │   ├── cityController.ts
│       │   └── flightController.ts
│       ├── services/
│       │   ├── authService.ts      # register, login, JWT, sessionStamp
│       │   ├── bookingService.ts   # pessimistic lock, confirm, cancel, cleanup
│       │   └── outboxWorker.ts     # Transactional Outbox worker
│       ├── middleware/
│       │   ├── authenticate.ts     # JWT middleware
│       │   ├── errorHandler.ts     # AppError + global handler
│       │   └── validate.ts         # Generic Zod middleware
│       ├── schemas/
│       │   └── index.ts            # All Zod schemas + inferred types
│       ├── routes/
│       │   ├── auth.ts
│       │   ├── bookings.ts
│       │   ├── cities.ts
│       │   └── flights.ts
│       ├── lib/
│       │   └── prisma.ts           # Singleton PrismaClient
│       ├── seed.ts                 # 50+ аэропортов, рейсы, места
│       └── seed-seats.ts
├── frontend/
│   └── src/
│       ├── App.tsx                 # BrowserRouter, AuthProvider, ThemeProvider
│       ├── api.ts                  # Axios client + demo/live branching
│       ├── runtimeMode.ts          # Explicit demo/live detection
│       ├── mockData.ts             # 12 маршрутов × 10 дней, seat generation
│       ├── bookingConfirmation.ts  # Confirmation mode labels
│       ├── recentBookings.ts       # localStorage booking cache
│       ├── types.ts                # City, Airport, Seat, Flight, Booking, Pagination
│       ├── context/
│       │   ├── AuthContext.tsx      # JWT auth state, login, register, logout
│       │   └── ThemeContext.tsx     # Dark theme
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── Footer.tsx
│       │   ├── BookingSearchPanel.tsx  # Hero + compact variants
│       │   ├── CityInput.tsx          # Autocomplete с debounce + AbortController
│       │   └── DatePicker.tsx         # Custom calendar через createPortal
│       └── pages/
│           ├── HomePage.tsx        # Search, destinations, tariffs, highlights
│           ├── FlightsPage.tsx     # Search results, sort, fare cards, pagination
│           ├── SeatsPage.tsx       # Seat map, fare sidebar, booking action
│           ├── BookingPage.tsx     # Status, countdown, confirm/cancel, polling
│           ├── AuthPage.tsx        # Login / register with redirect
│           ├── ProfilePage.tsx     # Dashboard, bookings, passengers, settings
│           ├── AboutPage.tsx
│           ├── HelpPage.tsx
│           └── LegalPage.tsx
└── docs/
    └── screenshots/
```

## Быстрый старт

### Demo mode (без backend и PostgreSQL)

```bash
git clone https://github.com/SharPixX/skybooker.git
cd skybooker/frontend
npm install
npm run build
npm run preview
```

Откроется `http://localhost:4173` — приложение автоматически запустится в demo-режиме.

### Live mode (с backend и PostgreSQL)

#### 1. Установить зависимости

```bash
cd skybooker
npm install
cd backend && npm install
cd ../frontend && npm install
```

#### 2. Настроить переменные окружения

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

В `backend/.env` указать:
```
DATABASE_URL=postgresql://user:password@host:5432/postgres
DIRECT_URL=postgresql://user:password@host:5432/postgres
JWT_SECRET=your-secure-secret
BOOKING_CONFIRMATION_MODE=manual
```

#### 3. Применить схему и засеять данные

```bash
cd backend
npx prisma db push
npm run seed
```

#### 4. Запустить

```bash
# Terminal 1: backend
cd backend && npm run dev

# Terminal 2: frontend
cd frontend && npm run dev
```

API: `http://localhost:3000` — Vite проксирует `/api` автоматически.
Frontend: `http://localhost:5173`

## Скрипты

| Команда | Что делает |
|---|---|
| `npm run dev:backend` | Backend в dev-режиме (nodemon) |
| `npm run dev:frontend` | Frontend dev server (Vite) |
| `npm run build` | Production-сборка backend + frontend |
| `npm run test` | Запуск тестов backend |
| `npm run lint` | ESLint для frontend |
| `npm run preview` | Preview production build frontend |
| `npm --prefix backend run seed` | Seed базы данных: аэропорты, рейсы, места |

## Useful commands

Backend:

```bash
npm run build
npm test
```

Frontend:

```bash
npm run build
npm run lint
```

## Current boundaries

This repo is a strong pet project / portfolio project, not a production airline.

- payment provider integration is simulated
- booking confirmation is either manual or disabled, depending on env setup
- no end-to-end payment or refund workflow yet
- infrastructure and monitoring are not set up for real commercial traffic

## Why it is still a strong portfolio project

- non-trivial domain modeling
- real backend/frontend integration
- race-condition-aware booking logic
- explicit demo strategy
- product-quality UI work instead of a template CRUD app
