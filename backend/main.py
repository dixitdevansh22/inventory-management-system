from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import routes_products
import routes_customers
import routes_orders

# App start hote hi saari tables create kar do (agar already nahi hain)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory & Order Management System",
    description="API for managing products, customers, orders, and inventory tracking",
    version="1.0.0"
)

# CORS - React frontend ko backend se baat karne dene ke liye
# Production mein allow_origins ko specific frontend URL tak limit karna chahiye
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Saare routers ko app mein include karo
app.include_router(routes_products.router)
app.include_router(routes_customers.router)
app.include_router(routes_orders.router)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Inventory Management System API is running"}
