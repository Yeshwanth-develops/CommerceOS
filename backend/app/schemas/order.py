from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class OrderCreate(BaseModel):
    merchant_id: int
    product_id: int
    quantity: int


class OrderCreateResponse(BaseModel):
    order_id: int
    amount: float
    status: str
    razorpay_order_id: Optional[str] = None
    created_at: Optional[datetime] = None


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentVerifyResponse(BaseModel):
    success: bool
    message: str
    order_id: int
    status: str


class OrderResponse(BaseModel):
    id: int
    merchant_id: int
    product_id: int
    quantity: int
    total_amount: float
    status: str
    razorpay_order_id: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True