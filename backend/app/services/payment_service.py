from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.product import Product
from app.schemas.payment import PaymentVerificationRequest
from app.services.razorpay_service import verify_payment_signature
from app.constants.order_status import OrderStatus
from app.services.audit_service import create_audit_event
from app.constants.events import Events


def verify_payment(
    db: Session,
    payment_data: PaymentVerificationRequest
) -> bool:
    verified = verify_payment_signature(
        payment_data.razorpay_order_id,
        payment_data.razorpay_payment_id,
        payment_data.razorpay_signature
    )

    if not verified:
        return False

    order = (
        db.query(Order)
        .filter(Order.razorpay_order_id == payment_data.razorpay_order_id)
        .first()
    )

    if not order:
        return False

    # Mark order as PAID
    order.status = OrderStatus.PAID

    # Decrement product inventory
    product = db.query(Product).filter(Product.id == order.product_id).first()
    if product:
        product.stock = max(0, product.stock - order.quantity)

    db.commit()

    create_audit_event(
        db=db,
        event_type=Events.PAYMENT_VERIFIED,
        entity_type="ORDER",
        entity_id=order.id,
        description=f"Payment verified for order #{order.id} (Razorpay ID: {payment_data.razorpay_order_id})",
    )

    return True