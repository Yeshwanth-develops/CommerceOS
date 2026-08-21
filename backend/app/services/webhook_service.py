from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.product import Product
from app.constants.order_status import OrderStatus


def handle_payment_captured(
    db: Session,
    payload: dict
) -> bool:
    try:
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        razorpay_order_id = payment_entity.get("order_id")

        if not razorpay_order_id:
            return False

        order = (
            db.query(Order)
            .filter(Order.razorpay_order_id == razorpay_order_id)
            .first()
        )

        if not order:
            return False

        if order.status != OrderStatus.PAID:
            order.status = OrderStatus.PAID

            # Decrement product stock if not already decremented
            product = db.query(Product).filter(Product.id == order.product_id).first()
            if product:
                product.stock = max(0, product.stock - order.quantity)

            db.commit()

        return True
    except Exception as e:
        print("Error handling payment.captured:", e)
        db.rollback()
        return False


def handle_payment_failed(
    db: Session,
    payload: dict
) -> bool:
    try:
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        razorpay_order_id = payment_entity.get("order_id")

        if not razorpay_order_id:
            return False

        order = (
            db.query(Order)
            .filter(Order.razorpay_order_id == razorpay_order_id)
            .first()
        )

        if not order:
            return False

        order.status = OrderStatus.FAILED
        db.commit()
        return True
    except Exception as e:
        print("Error handling payment.failed:", e)
        db.rollback()
        return False


def handle_refund_created(
    db: Session,
    payload: dict
) -> bool:
    try:
        refund_entity = payload.get("payload", {}).get("refund", {}).get("entity", {})
        # Razorpay may pass order_id in notes or directly on refund entity
        razorpay_order_id = (
            refund_entity.get("notes", {}).get("order_id")
            or refund_entity.get("order_id")
        )

        if not razorpay_order_id:
            return False

        order = (
            db.query(Order)
            .filter(Order.razorpay_order_id == razorpay_order_id)
            .first()
        )

        if not order:
            return False

        if order.status != OrderStatus.REFUNDED:
            order.status = OrderStatus.REFUNDED

            # Restore inventory stock on refund
            product = db.query(Product).filter(Product.id == order.product_id).first()
            if product:
                product.stock += order.quantity

            db.commit()

        return True
    except Exception as e:
        print("Error handling refund.created:", e)
        db.rollback()
        return False


def process_webhook(
    db: Session,
    payload: dict
) -> dict:
    event = payload.get("event")

    if event == "payment.captured":
        handle_payment_captured(db, payload)
    elif event == "payment.failed":
        handle_payment_failed(db, payload)
    elif event == "refund.created":
        handle_refund_created(db, payload)

    return {
        "received": True,
        "event": event,
    }