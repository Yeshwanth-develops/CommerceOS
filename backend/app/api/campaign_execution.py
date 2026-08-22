from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.campaign import Campaign

router = APIRouter(
    prefix="/campaigns",
    tags=["Campaign Execution"]
)

@router.post("/{campaign_id}/execute")
def execute_campaign(
    campaign_id: int,
    db: Session = Depends(get_db)
):
    campaign = (
        db.query(Campaign)
        .filter(
            Campaign.id == campaign_id
        )
        .first()
    )

    if not campaign:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found"
        )

    campaign.status = "ACTIVE"

    db.commit()

    return {
        "message":
        "Campaign activated",
        "campaign_id":
        campaign.id
    }