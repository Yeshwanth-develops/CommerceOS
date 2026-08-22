from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.campaign import Campaign
from app.services.audit_service import create_audit_log
from app.services.agent_action_service import create_agent_action


def generate_campaign(
    db: Session
):
    products = db.query(Product).all()

    if not products:
        return None

    target = max(
        products,
        key=lambda p: p.price
    )

    data = {
        "title": f"Weekend {target.title} Sale",
        "description": f"Promote {target.title} with 10% discount",
        "discount_percentage": 10.0,
        "target_product": target.title,
        "expected_revenue_lift": 12.5,
        "status": "DRAFT"
    }

    campaign = Campaign(
        title=data["title"],
        description=data["description"],
        discount_percentage=data["discount_percentage"],
        target_product=data["target_product"],
        expected_revenue_lift=data["expected_revenue_lift"],
        status="DRAFT"
    )

    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    # Record Audit Trail
    create_audit_log(
        db=db,
        event_type="AI_CAMPAIGN_CREATED",
        entity=f"CAMPAIGN (#{campaign.id})",
        description=f"AI generated campaign '{campaign.title}'"
    )

    # Record Agent Action Execution
    create_agent_action(
        db=db,
        action_type="CAMPAIGN_CREATED",
        action_name=campaign.title,
        source_agent="Campaign Agent"
    )

    return campaign