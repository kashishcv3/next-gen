# CV3 Admin Platform — Next-Gen

A full-stack migration of the CommerceV3 e-commerce admin platform from PHP/Smarty2 to a modern **Python FastAPI** backend and **Next.js 14** frontend, with pixel-accurate visual matching of the legacy Bootstrap 3 UI.

## Architecture

```
next-gen/
├── backend/          # Python FastAPI REST API
│   ├── app/
│   │   ├── main.py           # FastAPI app entry point
│   │   ├── config.py         # Settings (DB, JWT, CORS, email)
│   │   ├── database.py       # SQLAlchemy engine & sessions
│   │   ├── dependencies.py   # Auth dependencies
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── routers/          # API route handlers
│   │   └── services/         # Business logic
│   └── requirements.txt
│
└── frontend/         # Next.js 14 (App Router, TypeScript)
    ├── src/
    │   ├── app/              # Pages & layouts
    │   │   ├── login/        # Login with MFA support
    │   │   └── dashboard/    # Dashboard pages (master-list, etc.)
    │   ├── components/       # Layout & UI components
    │   ├── context/          # React Context (AuthContext)
    │   ├── lib/              # API client, auth utilities
    │   ├── hooks/            # Custom React hooks
    │   ├── types/            # TypeScript type definitions
    │   └── utils/            # Helper functions
    ├── package.json
    └── next.config.js
```

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Python 3.11+, FastAPI, SQLAlchemy   |
| Frontend  | Next.js 14, React 18, TypeScript    |
| Database  | MySQL (existing ColorCommerce DB)   |
| Auth      | JWT (HS256) + Email-based MFA       |
| Styling   | Bootstrap 3 (legacy match), CDN     |
| Email     | Netcore API v6 (MFA codes)          |

## Features

- **JWT Authentication** with email-based multi-factor authentication (MFA)
- **Device Trust** — "Remember this device for 7 days" skips MFA on trusted devices
- **Action-Forward Routing** — replicates the legacy PHP action→forward→template routing pattern
- **Master List** — developer/store management view matching the old admin UI
- **Pixel-Accurate UI** — Bootstrap 3 + SB-Admin theme matching the legacy Smarty2 templates
- **Full Admin API** — users, accounts, products, orders, categories, reports, stores, settings, templates, marketing, shipping, wholesale

## Prerequisites

- Python 3.11+
- Node.js 18+
- MySQL 8.0+ (with access to the `colorcommerce` database)

## Getting Started

### 1. Backend

```bash
cd next-gen/backend

# Install dependencies
pip install -r requirements.txt

# Configure database (edit app/config.py or create .env)
# DATABASE_URL=mysql+pymysql://user:pass@localhost:3306/colorcommerce

# Start the server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Frontend

```bash
cd next-gen/frontend

# Install dependencies
npm install

# Optional: create .env.local
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Overview

All endpoints are prefixed with `/api/v1`.

| Group       | Endpoints                                           |
|-------------|-----------------------------------------------------|
| Auth        | `POST /auth/login`, `POST /auth/verify-mfa`, `GET /auth/me` |
| Users       | `GET /users`, `GET /users/{uid}`                    |
| Accounts    | `GET /accounts`, `GET /accounts/{uid}/info`         |
| Master List | `GET /master-list`, `POST /master-list`             |
| Products    | `GET /products`, `GET /products/{id}`, `GET /products/search/by-name` |
| Orders      | `GET /orders`, `GET /orders/{id}`                   |
| Categories  | `GET /categories`, `GET /categories/{id}`           |
| Stores      | `GET /stores`, `GET /stores/{id}/overview`          |
| Reports     | `GET /reports/overview`, `GET /reports/sales`        |
| Settings    | `GET /settings`, `GET /settings/{key}`              |
| Templates   | `GET /templates`, `GET /templates/{id}`             |
| Marketing   | `GET /marketing/campaigns`, `/promotions`, `/email-templates` |
| Shipping    | `GET /shipping/methods`, `/carriers`, `/rates`      |
| Wholesale   | `GET /wholesale/customers`, `/orders`, `/pricing`   |
| Actions     | `GET /actions/forward/{action}` (legacy routing)    |

## Login Flow

```
User enters credentials
        │
        ▼
  POST /auth/login
        │
        ├── Device trust cookie valid? ──▶ Skip MFA, return JWT + forward_route
        │
        ▼
  MFA required? ──No──▶ Return JWT + forward_route
        │
       Yes
        │
        ▼
  Send 6-digit code via email (Netcore API)
  Return mfa_token
        │
        ▼
  User enters code (pastable 6-input OTC)
  POST /auth/verify-mfa
        │
        ├── "Trust device" checked? ──▶ Store device_trust cookie (7 days)
        │
        ▼
  Return JWT + forward_route
        │
        ▼
  Redirect to forward_route (e.g. /dashboard/master-list)
```

## Environment Variables

| Variable                    | Default                              | Description           |
|-----------------------------|--------------------------------------|-----------------------|
| `DATABASE_URL`              | `mysql+pymysql://...@localhost:3306/colorcommerce` | MySQL connection URL |
| `SECRET_KEY`                | `cv3-nextgen-secret-2026`            | JWT signing key       |
| `NETCORE_API_KEY`           | *(set in config)*                    | Email API key         |
| `NEXT_PUBLIC_API_BASE_URL`  | `http://localhost:8000/api/v1`       | Frontend API base URL |

## License

Proprietary — CommerceV3, Inc.
