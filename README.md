# Inventory & Order Management System

A simplified full-stack system for managing products, customers, orders, and inventory tracking.

## Tech Stack

- **Backend:** Python (FastAPI), SQLAlchemy ORM
- **Frontend:** React (Vite)
- **Database:** PostgreSQL
- **Containerization:** Docker, Docker Compose

## Features

- Product management with unique SKU enforcement
- Customer management with unique email enforcement
- Order creation with real-time stock validation
- Automatic stock reduction on successful order
- Orders are rejected (atomically, with no partial updates) if any item's stock is insufficient
- Low-stock visual indicators on the dashboard

## Project Structure

```
.
├── backend/             # FastAPI application
│   ├── main.py           # App entry point, route registration, CORS
│   ├── database.py       # DB connection setup
│   ├── models.py         # SQLAlchemy models (tables)
│   ├── schemas.py        # Pydantic request/response schemas
│   ├── routes_products.py
│   ├── routes_customers.py
│   ├── routes_orders.py  # Core business logic: stock validation + reduction
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/             # React application
│   ├── src/
│   │   ├── api/          # Axios client + endpoint functions
│   │   ├── pages/        # ProductsPage, CustomersPage, OrdersPage
│   │   └── App.jsx
│   └── Dockerfile
└── docker-compose.yml    # Orchestrates db + backend + frontend
```

## Running Locally with Docker Compose

This is the recommended way to run the entire system with a single command.

```bash
docker-compose up --build
```

This starts:
- PostgreSQL on `localhost:5432`
- Backend API on `localhost:8000` (Swagger docs at `localhost:8000/docs`)
- Frontend on `localhost:3000`

## Running Without Docker (Manual Setup)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Edit DATABASE_URL to point to your local PostgreSQL
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env       # Edit VITE_API_URL if needed
npm run dev
```

## API Documentation

Once the backend is running, interactive Swagger documentation is available at:
```
http://localhost:8000/docs
```

## Business Rules Implemented

1. Product SKUs must be unique — duplicate SKU returns a 400 error.
2. Customer emails must be unique — duplicate email returns a 400 error.
3. Orders are validated against current stock before creation.
4. If any item in an order has insufficient stock, the entire order is rejected — no partial orders are created.
5. On successful order creation, stock is automatically and atomically reduced for each ordered product.
