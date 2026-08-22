from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.order import Order
from app.services.ai_service import get_ai_recommendations
from app.services.audit_service import create_audit_event
from app.constants.events import Events


def generate_growth_insights(
    db: Session
) -> Dict[str, Any]:
    products = db.query(Product).all()
    orders = db.query(Order).all()

    total_revenue = sum(
        order.total_amount
        for order in orders
    )
    total_orders = len(orders)
    product_titles = [product.title for product in products]

    recommendations: List[str] = []

    # Rule 1: Stock Alert
    for product in products:
        if product.stock < 10:
            recommendations.append(
                f"Restock '{product.title}' immediately. Only {product.stock} units left."
            )

    # Rule 2: Order Volume Campaign
    if total_orders > 5:
        recommendations.append(
            "Create a weekend discount campaign to increase conversions."
        )

    # Rule 3: High Revenue Upsell
    if total_revenue > 10000:
        recommendations.append(
            "Launch premium upsell offers for high-value customers."
        )

    # Calculated growth score
    growth_score = min(100, 50 + total_orders * 2)

    # Fetch AI LLM Insights
    ai_response = get_ai_recommendations(
        revenue=total_revenue,
        orders=total_orders,
        products=product_titles,
        growth_score=growth_score,
    )

    # Record Audit Trail Event
    create_audit_event(
        db=db,
        event_type=Events.AI_RECOMMENDATION,
        entity_type="GROWTH_AGENT",
        entity_id=None,
        description=f"Generated growth report: Score {growth_score}/100, Revenue ₹{total_revenue:,.2f}, {len(recommendations)} actionable recommendations",
    )

    # Record Agent Action Execution
    from app.services.agent_action_service import create_agent_action
    create_agent_action(
        db=db,
        action_type="GROWTH_ANALYSIS",
        action_name=f"Growth Analysis (Score: {growth_score}/100)",
        source_agent="Growth Copilot"
    )


    return {
        "growth_score": growth_score,
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "product_count": len(products),
        "recommendations": recommendations,
        "ai_analysis": ai_response,
    }