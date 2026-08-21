import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from app.db.base import Base


class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    merchant_id = Column(
        Integer,
        ForeignKey("merchants.id"),
        nullable=False,
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
    )

    quantity = Column(Integer, default=1, nullable=False)

    total_amount = Column(Float, nullable=False)

    status = Column(
        String,
        default=OrderStatus.PENDING.value,
        nullable=False,
    )

    razorpay_order_id = Column(
        String,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )