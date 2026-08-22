from sqlalchemy.orm import Session

from app.models.bundle import Bundle
from app.models.product import Product
from app.models.order import Order
from app.services.audit_service import create_audit_log
from app.services.ai_service import generate_gemini_bundle
from app.services.agent_action_service import create_agent_action


def generate_bundle(
    db: Session
):
    products = db.query(Product).all()

    if len(products) < 2:
        return None

    orders = db.query(Order).all()
    total_orders = len(orders)
    total_revenue = sum(order.total_amount for order in orders)

    products_data = [
        {
            "id": p.id,
            "title": p.title,
            "price": p.price,
            "stock": p.stock,
        }
        for p in products
    ]

    # Gemini AI bundle recommendation
    ai_bundle = generate_gemini_bundle(
        products=products_data,
        total_orders=total_orders,
        total_revenue=total_revenue,
    )

    bundle = Bundle(
        bundle_name=ai_bundle["bundle_name"],
        product_1=ai_bundle["product_1"],
        product_2=ai_bundle["product_2"],
        bundle_price=ai_bundle["bundle_price"],
        expected_aov_increase=ai_bundle["expected_aov_increase"],
        reasoning=ai_bundle.get("reasoning"),
        status="DRAFT"
    )

    db.add(bundle)
    db.commit()
    db.refresh(bundle)

    # Record Audit Trail
    create_audit_log(
        db=db,
        event_type="AI_BUNDLE_CREATED",
        entity=f"BUNDLE (#{bundle.id})",
        description=f"AI generated bundle '{bundle.bundle_name}'"
    )

    # Record Agent Action Execution
    create_agent_action(
        db=db,
        action_type="BUNDLE_CREATED",
        action_name=bundle.bundle_name,
        source_agent="Bundle Agent"
    )

    return bundle