# ColorCommerce Admin Platform - FastAPI Backend

A Python FastAPI backend for the e-commerce admin platform, migrated from PHP to FastAPI. Connects to a MySQL "colorcommerce" database with read-only access.

## Project Structure

```
backend/
├── requirements.txt          # Python dependencies
├── app/
│   ├── __init__.py          # Empty package init
│   ├── main.py              # FastAPI application setup with CORS and all routers
│   ├── config.py            # Pydantic settings (DATABASE_URL, SECRET_KEY, API_PREFIX)
│   ├── database.py          # SQLAlchemy engine and session factory
│   ├── dependencies.py      # Auth dependency (get_current_user, get_current_admin_user)
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py          # User model (all fields from users table)
│   │   ├── action.py        # Action model (id, action, form, type, csrf_check)
│   │   ├── template_view_link.py  # TemplateViewLink model
│   │   ├── permission.py    # Permission model (uid, page_id from perms table)
│   │   └── page.py          # Page model (id, name)
│   ├── schemas/             # Pydantic response models
│   │   ├── __init__.py
│   │   ├── user.py          # UserOut, UserList schemas
│   │   └── auth.py          # LoginRequest, TokenResponse, UserInfo schemas
│   └── routers/             # API route handlers
│       ├── __init__.py
│       ├── auth.py          # POST /login, GET /me
│       ├── users.py         # GET /users, GET /users/{uid}
│       ├── accounts.py      # GET /accounts, GET /accounts/{uid}/info, /log
│       ├── products.py      # GET /products, /products/{id}, /products/search
│       ├── orders.py        # GET /orders, GET /orders/{id}
│       ├── categories.py    # GET /categories, GET /categories/{id}
│       ├── reports.py       # GET /reports/overview, /reports/sales
│       ├── stores.py        # GET /stores, GET /stores/{id}/overview
│       ├── settings.py      # GET /settings, GET /settings/{key}
│       ├── templates_mgmt.py    # GET /templates, GET /templates/{id}
│       ├── marketing.py     # GET /marketing/campaigns, /promotions, /email-templates
│       ├── shipping.py      # GET /shipping/methods, /carriers, /rates, /tracking/{id}
│       └── wholesale.py     # GET /wholesale/customers, /orders, /pricing
```

## Configuration

**Database Connection** (read-only):
- URL: `mysql+pymysql://claude_cc:claude_cc_readonly@localhost:3306/colorcommerce`

**API Settings**:
- API Prefix: `/api/v1`
- CORS Origins: `http://localhost:3000`, `http://localhost:3001`
- Secret Key: `cv3-nextgen-secret-2026`
- Token Algorithm: HS256
- Token Expiration: 30 minutes

## Dependencies

- FastAPI 0.109.0
- Uvicorn 0.27.0
- SQLAlchemy 2.0.25
- PyMySQL 1.1.0
- python-jose[cryptography] 3.3.0
- passlib[bcrypt] 1.7.4
- python-multipart 0.0.6
- Pydantic 2.5.3
- pydantic-settings 2.1.0

## Running the Application

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login with username/password
- `GET /api/v1/auth/me` - Get current user info (requires token)

### Users (Admin only)
- `GET /api/v1/users` - List all users (paginated)
- `GET /api/v1/users/{uid}` - Get user by ID

### Accounts
- `GET /api/v1/accounts` - List accounts (paginated)
- `GET /api/v1/accounts/{uid}/info` - Get account info
- `GET /api/v1/accounts/{uid}/log` - Get account activity log

### Products
- `GET /api/v1/products` - List products (paginated)
- `GET /api/v1/products/{id}` - Get product detail
- `GET /api/v1/products/search/by-name` - Search products

### Orders
- `GET /api/v1/orders` - List orders (paginated, filterable)
- `GET /api/v1/orders/{id}` - Get order detail

### Categories
- `GET /api/v1/categories` - List categories (paginated)
- `GET /api/v1/categories/{id}` - Get category detail

### Reports (Admin only)
- `GET /api/v1/reports/overview` - Get overview statistics
- `GET /api/v1/reports/sales` - Get sales data

### Stores
- `GET /api/v1/stores` - List stores (paginated)
- `GET /api/v1/stores/{id}/overview` - Get store overview

### Settings (Admin only)
- `GET /api/v1/settings` - Get all settings
- `GET /api/v1/settings/{key}` - Get specific setting

### Templates (Admin only)
- `GET /api/v1/templates` - List templates (paginated)
- `GET /api/v1/templates/{id}` - Get template detail

### Marketing (Admin only)
- `GET /api/v1/marketing/campaigns` - List campaigns
- `GET /api/v1/marketing/campaigns/{id}` - Get campaign
- `GET /api/v1/marketing/promotions` - List promotions
- `GET /api/v1/marketing/email-templates` - List email templates

### Shipping (Admin only)
- `GET /api/v1/shipping/methods` - List shipping methods
- `GET /api/v1/shipping/carriers` - List carriers
- `GET /api/v1/shipping/rates` - Get shipping rates
- `GET /api/v1/shipping/tracking/{number}` - Track shipment

### Wholesale (Admin only)
- `GET /api/v1/wholesale/customers` - List wholesale customers
- `GET /api/v1/wholesale/customers/{id}` - Get customer
- `GET /api/v1/wholesale/orders` - List wholesale orders
- `GET /api/v1/wholesale/pricing` - Get wholesale pricing

## Important Notes

- **Read-Only Database**: All connections use read-only credentials. No write operations are performed except during login validation.
- **Authentication**: All endpoints except login require JWT bearer token authentication.
- **Authorization**: Admin-only endpoints check user_type == "admin".
- **CORS**: Enabled for localhost:3000 and localhost:3001 for frontend development.
- **Documentation**: Interactive API docs available at `/docs` (Swagger UI) and `/redoc` (ReDoc).

## Database Models

All models are mapped to existing ColorCommerce tables:
- `users` - User accounts with authentication and profile data
- `actions` - Available actions in the system
- `template_view_link` - Template and view associations
- `perms` - User permission mappings (uid + page_id)
- `pages` - Page definitions

