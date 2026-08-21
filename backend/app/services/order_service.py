from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.models.order import Order, OrderStatus
from app.models.merchant import Merchant
from app.models.product import Product
from app.schemas.order import OrderCreate, PaymentVerifyRequest
from app.services.razorpay_service import create_razorpay_order, verify_razorpay_signature
from app.services.audit_service import create_audit_event
from app.constants.events import Events


def create_order(
    db: Session,
    order_data: OrderCreate
) -> Dict[str, Any]:
    # 1. Validate Merchant Exists
    merchant = (
        db.query(Merchant)
        .filter(Merchant.id == order_data.merchant_id)
        .first()
    )
    if not merchant:
        raise ValueError(f"Merchant with id {order_data.merchant_id} not found")

    # 2. Validate Quantity
    if order_data.quantity <= 0:
        raise ValueError("Order quantity must be at least 1")

    # 3. Validate Product Exists
    product = (
        db.query(Product)
        .filter(Product.id == order_data.product_id)
        .first()
    )
    if not product:
        raise ValueError(f"Product with id {order_data.product_id} not found")

    # 4. Verify Product Belongs To Merchant
    if product.merchant_id != order_data.merchant_id:
        raise ValueError(
            f"Product {order_data.product_id} does not belong to merchant {order_data.merchant_id}"
        )

    # 5. Inventory Check
    if product.stock < order_data.quantity:
        raise ValueError(
            f"Insufficient stock: only {product.stock} units available (requested {order_data.quantity})"
        )

    # Calculate Total
    total = round(product.price * order_data.quantity, 2)

    # Create Razorpay Order
    rzp_order = create_razorpay_order(total)

    # Save Order in Database
    order = Order(
        merchant_id=order_data.merchant_id,
        product_id=order_data.product_id,
        quantity=order_data.quantity,
        total_amount=total,
        status=OrderStatus.PENDING.value,
        razorpay_order_id=rzp_order["id"],
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    create_audit_event(
        db=db,
        event_type=Events.ORDER_CREATED,
        entity_type="ORDER",
        entity_id=order.id,
        description=f"Order #{order.id} created for product '{product.title}' (qty: {order.quantity}, total: ₹{total})",
    )

    return {
        "order_id": order.id,
        "amount": total,
        "status": order.status,
        "razorpay_order_id": order.razorpay_order_id,
        "created_at": order.created_at,
    }


def verify_payment(
    db: Session,
    payment_data: PaymentVerifyRequest
) -> Order:
    # 1. Verify Razorpay cryptographic signature
    is_valid = verify_razorpay_signature(
        razorpay_order_id=payment_data.razorpay_order_id,
        razorpay_payment_id=payment_data.razorpay_payment_id,
        razorpay_signature=payment_data.razorpay_signature,
    )
    if not is_valid:
        raise ValueError("Invalid payment signature")

    # 2. Find order in DB
    order = (
        db.query(Order)
        .filter(Order.razorpay_order_id == payment_data.razorpay_order_id)
        .first()
    )
    if not order:
        raise ValueError(f"Order with Razorpay ID {payment_data.razorpay_order_id} not found")

    # 3. Update order status to PAID
    order.status = OrderStatus.PAID.value

    # 4. Decrement product stock
    product = db.query(Product).filter(Product.id == order.product_id).first()
    if product:
        product.stock = max(0, product.stock - order.quantity)

    db.commit()
    db.refresh(order)

    create_audit_event(
        db=db,
        event_type=Events.PAYMENT_VERIFIED,
        entity_type="ORDER",
        entity_id=order.id,
        description=f"Payment verified for order #{order.id} via API",
    )

    return order


def get_orders(db: Session) -> List[Order]:
    return db.query(Order).order_by(Order.created_at.desc()).all()