from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.dependencies import get_db
from app.models.campaign import Campaign
from app.schemas.campaign import CampaignResponse, CampaignStatusUpdate
from app.agents.campaign_agent import generate_campaign
from app.services.audit_service import create_audit_log
from app.constants.events import Events

router = APIRouter(
    prefix="/campaigns",
    tags=["Campaigns"]
)


@router.post("/generate", response_model=Optional[CampaignResponse])
def generate_campaign_api(
    db: Session = Depends(get_db)
):
    campaign = generate_campaign(db)
    if not campaign:
        raise HTTPException(
            status_code=404,
            detail="No products found in catalog to generate a campaign"
        )
    return campaign


@router.get("/latest", response_model=Optional[CampaignResponse])
def get_latest_campaign_api(
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).order_by(Campaign.id.desc()).first()
    return campaign


@router.get("/", response_model=List[CampaignResponse])
def list_campaigns_api(
    db: Session = Depends(get_db)
):
    return db.query(Campaign).order_by(Campaign.id.desc()).all()


@router.post("/{campaign_id}/execute", response_model=CampaignResponse)
def execute_campaign_api(
    campaign_id: int,
    db: Session = Depends(get_db)
):
    from app.constants.campaign_status import CampaignStatus
    from app.services.agent_action_service import create_agent_action

    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    from app.models.order import Order
    if not campaign.projected_revenue:
        orders = db.query(Order).all()
        current_revenue = sum(o.total_amount for o in orders)
        lift_pct = campaign.expected_revenue_lift or 12.5
        campaign.projected_revenue = round(current_revenue * (1 + lift_pct / 100), 2) if current_revenue > 0 else 56000.0

    campaign.status = CampaignStatus.ACTIVE
    db.commit()
    db.refresh(campaign)

    create_agent_action(
        db=db,
        action_type="CAMPAIGN_EXECUTED",
        action_name=campaign.title,
        source_agent="Execution Engine"
    )

    create_audit_log(
        db=db,
        event_type=Events.AI_ACTION_EXECUTED,
        entity=f"CAMPAIGN (#{campaign.id})",
        description=f"AI activated campaign '{campaign.title}'"
    )

    return campaign


@router.patch("/{campaign_id}/status", response_model=CampaignResponse)
def update_campaign_status_api(
    campaign_id: int,
    payload: CampaignStatusUpdate,
    db: Session = Depends(get_db)
):
    from app.constants.campaign_status import CampaignStatus
    from app.services.agent_action_service import create_agent_action

    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    old_status = campaign.status
    campaign.status = payload.status
    db.commit()
    db.refresh(campaign)

    create_audit_log(
        db=db,
        event_type=Events.CAMPAIGN_STATUS_UPDATED,
        entity=f"CAMPAIGN (#{campaign.id})",
        description=f"Campaign '{campaign.title}' status changed from {old_status} to {campaign.status}"
    )

    if payload.status == CampaignStatus.ACTIVE and old_status != CampaignStatus.ACTIVE:
        create_agent_action(
            db=db,
            action_type="CAMPAIGN_EXECUTED",
            action_name=campaign.title,
            source_agent="Execution Engine"
        )
        create_audit_log(
            db=db,
            event_type=Events.AI_ACTION_EXECUTED,
            entity=f"CAMPAIGN (#{campaign.id})",
            description=f"AI activated campaign '{campaign.title}'"
        )

    return campaign