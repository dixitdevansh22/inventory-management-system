from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
from models import OrderStatus


# ---------- Product Schemas ----------

class ProductBase(BaseModel):
    sku: str = Field(..., min_length=1, description="Unique product SKU")
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0, description="Price must be greater than 0")
    stock_quantity: int = Field(..., ge=0, description="Stock cannot be negative")


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)


class ProductResponse(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # SQLAlchemy object se directly convert karne ke liye


# ---------- Customer Schemas ----------

class CustomerBase(BaseModel):
    name: str
    email: EmailStr  # Pydantic automatically valid email format check karega
    phone: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Order Schemas ----------

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0, description="Quantity must be at least 1")


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(..., min_length=1, description="Order must have at least one item")


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_at_order: float

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    status: OrderStatus
    created_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True
