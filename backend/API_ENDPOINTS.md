# ColorCommerce Admin API - Complete Endpoint Reference

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication

### Login
```
POST /auth/login
Content-Type: application/json

Request Body:
{
  "username": "string",
  "password": "string"
}

Response (200):
{
  "access_token": "string",
  "token_type": "bearer",
  "user_id": 1,
  "username": "string",
  "user_type": "admin|user|reseller"
}
```

### Get Current User
```
GET /auth/me
Authorization: Bearer {access_token}

Response (200):
{
  "uid": 1,
  "username": "string",
  "email": "string@example.com",
  "first_name": "string",
  "last_name": "string",
  "user_type": "admin|user|reseller",
  "in_cloud": true
}
```

## Users (Admin Only)

### List Users
```
GET /users?page=1&page_size=20
Authorization: Bearer {access_token}

Query Parameters:
  page: integer (default: 1, minimum: 1)
  page_size: integer (default: 20, minimum: 1, maximum: 100)

Response (200):
{
  "total": 100,
  "page": 1,
  "page_size": 20,
  "items": [
    {
      "uid": 1,
      "username": "string",
      "user_type": "admin",
      "first_name": "string",
      "last_name": "string",
      "co_name": "string",
      "email": "string@example.com",
      "phone": "string",
      "last_login": "2024-04-13T00:00:00",
      "inactive": false,
      "in_cloud": true
    }
  ]
}
```

### Get User by ID
```
GET /users/{uid}
Authorization: Bearer {access_token}

Path Parameters:
  uid: integer

Response (200):
{
  "uid": 1,
  "username": "string",
  "user_type": "admin",
  "first_name": "string",
  "last_name": "string",
  "co_name": "string",
  "email": "string@example.com",
  "phone": "string",
  "last_login": "2024-04-13T00:00:00",
  "inactive": false,
  "in_cloud": true
}
```

## Accounts

### List Accounts
```
GET /accounts?page=1&page_size=20
Authorization: Bearer {access_token}

Response (200): UserList (same as /users list)
```

### Get Account Info
```
GET /accounts/{uid}/info
Authorization: Bearer {access_token}

Path Parameters:
  uid: integer

Response (200):
{
  "uid": 1,
  "username": "string",
  "email": "string@example.com",
  "first_name": "string",
  "last_name": "string",
  "co_name": "string",
  "user_type": "admin",
  "phone": "string",
  "timestamp": "2024-04-13T00:00:00",
  "last_login": "2024-04-13T00:00:00",
  "inactive": false,
  "in_cloud": true
}
```

### Get Account Activity Log
```
GET /accounts/{uid}/log?limit=50
Authorization: Bearer {access_token}

Query Parameters:
  limit: integer (default: 50, minimum: 1, maximum: 500)

Response (200):
{
  "uid": 1,
  "username": "string",
  "log_entries": [],
  "total_entries": 0
}
```

## Products

### List Products
```
GET /products?page=1&page_size=20&status=active
Authorization: Bearer {access_token}

Query Parameters:
  page: integer (default: 1)
  page_size: integer (default: 20, maximum: 100)
  status: string (optional)

Response (200):
{
  "total": 50,
  "page": 1,
  "page_size": 20,
  "items": [
    {
      "id": 1,
      "name": "Product Name",
      "sku": "SKU123",
      "price": 99.99,
      "status": "active"
    }
  ]
}
```

### Get Product
```
GET /products/{product_id}
Authorization: Bearer {access_token}

Response (200):
{
  "id": 1,
  "name": "Product Name",
  "sku": "SKU123",
  "price": 99.99,
  "description": "Product description",
  "status": "active",
  "created_at": "2024-04-13T00:00:00"
}
```

### Search Products
```
GET /products/search/by-name?q=search+term&limit=20
Authorization: Bearer {access_token}

Query Parameters:
  q: string (minimum: 1 character)
  limit: integer (default: 20, maximum: 100)

Response (200):
{
  "query": "search term",
  "total": 5,
  "items": [...]
}
```

## Orders

### List Orders
```
GET /orders?page=1&page_size=20&status=pending&date_from=2024-01-01&date_to=2024-12-31
Authorization: Bearer {access_token}

Query Parameters:
  page: integer (default: 1)
  page_size: integer (default: 20, maximum: 100)
  status: string (optional)
  date_from: string (optional, format: YYYY-MM-DD)
  date_to: string (optional, format: YYYY-MM-DD)

Response (200):
{
  "total": 100,
  "page": 1,
  "page_size": 20,
  "items": [
    {
      "id": 1,
      "order_number": "ORD-1001",
      "customer_name": "John Doe",
      "total": 299.99,
      "status": "pending",
      "created_at": "2024-04-13T00:00:00"
    }
  ]
}
```

### Get Order Detail
```
GET /orders/{order_id}
Authorization: Bearer {access_token}

Response (200):
{
  "id": 1,
  "order_number": "ORD-1001",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "total": 299.99,
  "status": "pending",
  "items_count": 3,
  "created_at": "2024-04-13T00:00:00",
  "updated_at": "2024-04-13T12:00:00"
}
```

## Categories

### List Categories
```
GET /categories?page=1&page_size=20
Authorization: Bearer {access_token}

Response (200):
{
  "total": 15,
  "page": 1,
  "page_size": 20,
  "items": [
    {
      "id": 1,
      "name": "Category Name",
      "slug": "category-name",
      "product_count": 25
    }
  ]
}
```

### Get Category
```
GET /categories/{category_id}
Authorization: Bearer {access_token}

Response (200):
{
  "id": 1,
  "name": "Category Name",
  "slug": "category-name",
  "description": "Category description",
  "parent_id": null,
  "product_count": 25,
  "status": "active"
}
```

## Reports (Admin Only)

### Get Overview
```
GET /reports/overview?period=month
Authorization: Bearer {access_token}

Query Parameters:
  period: string (day|week|month|year, default: month)

Response (200):
{
  "total_orders": 150,
  "total_revenue": 15000.00,
  "total_customers": 50,
  "average_order_value": 100.00,
  "period": "month"
}
```

### Get Sales Data
```
GET /reports/sales?start_date=2024-01-01&end_date=2024-12-31&granularity=day
Authorization: Bearer {access_token}

Query Parameters:
  start_date: string (optional, format: YYYY-MM-DD)
  end_date: string (optional, format: YYYY-MM-DD)
  granularity: string (day|week|month, default: day)

Response (200):
{
  "period": "custom",
  "total_revenue": 15000.00,
  "total_orders": 150,
  "average_order_value": 100.00,
  "data": [
    {
      "date": "2024-04-13",
      "revenue": 1000.00,
      "orders": 10,
      "items_sold": 25
    }
  ]
}
```

## Stores

### List Stores
```
GET /stores?page=1&page_size=20
Authorization: Bearer {access_token}

Response (200):
{
  "total": 5,
  "page": 1,
  "page_size": 20,
  "items": [
    {
      "id": 1,
      "name": "Store Name",
      "status": "active",
      "orders_count": 250
    }
  ]
}
```

### Get Store Overview
```
GET /stores/{store_id}/overview
Authorization: Bearer {access_token}

Response (200):
{
  "id": 1,
  "name": "Store Name",
  "status": "active",
  "domain": "store.example.com",
  "owner": "Owner Name",
  "total_orders": 250,
  "total_revenue": 50000.00,
  "product_count": 500,
  "created_date": "2024-01-01T00:00:00"
}
```

## Settings (Admin Only)

### Get All Settings
```
GET /settings
Authorization: Bearer {access_token}

Response (200):
{
  "items": [
    {
      "key": "setting_name",
      "value": "setting_value",
      "description": "Setting description"
    }
  ]
}
```

### Get Specific Setting
```
GET /settings/{setting_key}
Authorization: Bearer {access_token}

Response (200):
{
  "key": "setting_key",
  "value": "setting_value",
  "description": "Setting description"
}
```

## Templates (Admin Only)

### List Templates
```
GET /templates?page=1&page_size=20&template_type=email
Authorization: Bearer {access_token}

Query Parameters:
  page: integer (default: 1)
  page_size: integer (default: 20, maximum: 100)
  template_type: string (optional)

Response (200):
{
  "total": 10,
  "page": 1,
  "page_size": 20,
  "items": [
    {
      "id": 1,
      "name": "Template Name",
      "type": "email",
      "last_modified": "2024-04-13T00:00:00"
    }
  ]
}
```

### Get Template
```
GET /templates/{template_id}
Authorization: Bearer {access_token}

Response (200):
{
  "id": 1,
  "name": "Template Name",
  "type": "email",
  "content": "<html>...</html>",
  "created_date": "2024-04-13T00:00:00",
  "last_modified": "2024-04-13T12:00:00"
}
```

## Marketing (Admin Only)

### List Campaigns
```
GET /marketing/campaigns?page=1&page_size=20
Authorization: Bearer {access_token}

Response (200):
{
  "total": 5,
  "page": 1,
  "page_size": 20,
  "items": [
    {
      "id": 1,
      "name": "Campaign Name",
      "status": "active",
      "created_date": "2024-04-13T00:00:00"
    }
  ]
}
```

### Get Campaign
```
GET /marketing/campaigns/{campaign_id}
Authorization: Bearer {access_token}

Response (200):
{
  "id": 1,
  "name": "Campaign Name",
  "description": "Campaign description",
  "status": "active",
  "reach": 1000,
  "conversions": 50,
  "created_date": "2024-04-13T00:00:00"
}
```

### List Promotions
```
GET /marketing/promotions?page=1&page_size=20
Authorization: Bearer {access_token}

Response (200):
{
  "total": 10,
  "page": 1,
  "page_size": 20,
  "items": [...]
}
```

### List Email Templates
```
GET /marketing/email-templates
Authorization: Bearer {access_token}

Response (200):
{
  "items": [...]
}
```

## Shipping (Admin Only)

### Get Shipping Methods
```
GET /shipping/methods
Authorization: Bearer {access_token}

Response (200):
{
  "items": [
    {
      "id": 1,
      "name": "Standard Shipping",
      "cost": 5.99,
      "delivery_days": 5
    }
  ]
}
```

### Get Shipping Carriers
```
GET /shipping/carriers
Authorization: Bearer {access_token}

Response (200):
{
  "items": [
    {
      "id": 1,
      "name": "FedEx",
      "api_key": "***",
      "status": "active"
    }
  ]
}
```

### Get Shipping Rates
```
GET /shipping/rates?destination=US&weight=2.5
Authorization: Bearer {access_token}

Query Parameters:
  destination: string (optional)
  weight: float (optional)

Response (200):
{
  "rates": [...]
}
```

### Get Tracking Info
```
GET /shipping/tracking/{tracking_number}
Authorization: Bearer {access_token}

Response (200):
{
  "tracking_number": "1Z999AA10123456784",
  "carrier": "FedEx",
  "status": "in_transit",
  "events": [
    {
      "timestamp": "2024-04-13T00:00:00",
      "status": "picked_up",
      "location": "Warehouse"
    }
  ]
}
```

## Wholesale (Admin Only)

### List Wholesale Customers
```
GET /wholesale/customers?page=1&page_size=20
Authorization: Bearer {access_token}

Response (200):
{
  "total": 10,
  "page": 1,
  "page_size": 20,
  "items": [
    {
      "id": 1,
      "name": "Wholesale Customer",
      "email": "customer@example.com",
      "status": "active",
      "total_orders": 25
    }
  ]
}
```

### Get Wholesale Customer
```
GET /wholesale/customers/{customer_id}
Authorization: Bearer {access_token}

Response (200):
{
  "id": 1,
  "name": "Wholesale Customer",
  "email": "customer@example.com",
  "status": "active",
  "total_orders": 25
}
```

### List Wholesale Orders
```
GET /wholesale/orders?page=1&page_size=20&customer_id=1
Authorization: Bearer {access_token}

Query Parameters:
  page: integer (default: 1)
  page_size: integer (default: 20)
  customer_id: integer (optional)

Response (200):
{
  "total": 25,
  "page": 1,
  "page_size": 20,
  "items": [
    {
      "id": 1,
      "order_number": "WO-1001",
      "customer_name": "Wholesale Customer",
      "total": 5000.00,
      "status": "completed",
      "created_date": "2024-04-13T00:00:00"
    }
  ]
}
```

### Get Wholesale Pricing
```
GET /wholesale/pricing?product_id=1
Authorization: Bearer {access_token}

Query Parameters:
  product_id: integer (optional)

Response (200):
{
  "items": [...]
}
```

## Health Check

### Check API Health
```
GET /health

Response (200):
{
  "status": "healthy"
}
```

## Root Endpoint

### Get API Info
```
GET /

Response (200):
{
  "message": "ColorCommerce Admin API",
  "version": "1.0.0",
  "docs": "/docs",
  "redoc": "/redoc"
}
```

## HTTP Status Codes

- **200** - OK
- **400** - Bad Request
- **401** - Unauthorized (missing or invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **500** - Internal Server Error

## Headers

All protected endpoints require:
```
Authorization: Bearer {access_token}
```

## Error Response Format

```json
{
  "detail": "Error message"
}
```

## API Documentation

- Interactive API docs: http://localhost:8000/docs
- ReDoc documentation: http://localhost:8000/redoc
