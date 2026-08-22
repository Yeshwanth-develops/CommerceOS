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


@router.patch("/{campaign_id}/status", response_model=CampaignResponse)
def update_campaign_status_api(
    campaign_id: int,
    payload: CampaignStatusUpdate,
    db: Session = Depends(get_db)
):
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

    return campaign