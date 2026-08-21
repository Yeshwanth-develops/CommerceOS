from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.schemas.order import (
    OrderCreate,
    OrderCreateResponse,
    OrderResponse,
    PaymentVerifyRequest,
    PaymentVerifyResponse,
)
from app.services.order_service import (
    create_order,
    get_orders,
    verify_payment,
)

router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)


@router.post("/", response_model=OrderCreateResponse, status_code=status.HTTP_201_CREATED)
def create_order_api(
    order: OrderCreate,
    db: Session = Depends(get_db),
):
    try:
        result = create_order(db, order)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {order.product_id} not found",
            )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/verify", response_model=PaymentVerifyResponse)
def verify_payment_api(
    payment_data: PaymentVerifyRequest,
    db: Session = Depends(get_db),
):
    try:
        order = verify_payment(db, payment_data)
        return {
            "success": True,
            "message": "Payment verified and recorded successfully",
            "order_id": order.id,
            "status": order.status,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/", response_model=List[OrderResponse])
def get_orders_api(
    db: Session = Depends(get_db),
):
    return get_orders(db)