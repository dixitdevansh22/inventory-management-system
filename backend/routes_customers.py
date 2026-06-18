from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from database import get_db
import models
import schemas

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("/", response_model=schemas.CustomerResponse, status_code=201)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # Email unique constraint violate hua
        raise HTTPException(status_code=400, detail=f"Customer with email '{customer.email}' already exists")
    db.refresh(db_customer)
    return db_customer


@router.get("/", response_model=List[schemas.CustomerResponse])
def list_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Customer).offset(skip).limit(limit).all()


@router.get("/{customer_id}", response_model=schemas.CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer
