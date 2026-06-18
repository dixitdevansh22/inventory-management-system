from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=schemas.OrderResponse, status_code=201)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    """
    Order create karne ka sabse important endpoint.

    Business rules jo yahan follow ho rahi hain:
    1. Customer exist karna chahiye
    2. Har product exist karna chahiye
    3. Har product ka stock sufficient hona chahiye
    4. Agar koi bhi item ka stock kam hai, POORA order reject hoga
       (partial order nahi banega - yeh "all or nothing" approach hai)
    5. Order successfully banne par, stock automatically kam ho jayega
    """

    # Step 1: Customer check karo
    customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Step 2: Pehle SAARE products fetch karo aur stock validate karo
    # Yeh loop ek baar pehle chalate hain validation ke liye,
    # taaki koi bhi database change karne se pehle pata chal jaye
    # ki order valid hai ya nahi
    products_to_update = []
    total_amount = 0.0

    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product with id {item.product_id} not found"
            )

        # Yahan hai woh critical check: stock insufficient hai toh order reject
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Insufficient stock for product '{product.name}' "
                    f"(SKU: {product.sku}). Available: {product.stock_quantity}, "
                    f"Requested: {item.quantity}"
                )
            )

        total_amount += product.price * item.quantity
        products_to_update.append((product, item.quantity, product.price))

    # Step 3: Saari validation pass ho gayi, ab actually order banao
    # Yeh sab ek hi database transaction mein hota hai (atomic operation)
    db_order = models.Order(
        customer_id=order.customer_id,
        total_amount=total_amount,
        status=models.OrderStatus.PENDING
    )
    db.add(db_order)
    db.flush()  # Order ka ID generate karne ke liye, commit se pehle

    for product, quantity, price in products_to_update:
        order_item = models.OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=quantity,
            price_at_order=price
        )
        db.add(order_item)

        # Yahan hai automatic stock reduction
        product.stock_quantity -= quantity

    db.commit()
    db.refresh(db_order)
    return db_order


@router.get("/", response_model=List[schemas.OrderResponse])
def list_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Order).offset(skip).limit(limit).all()


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
