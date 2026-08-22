from pydantic import BaseModel, field_validator
from typing import Optional
from app.constants.campaign_status import CampaignStatus


class CampaignResponse(BaseModel):
    id: Optional[int] = None
    title: str
    description: Optional[str] = None
    discount_percentage: Optional[float] = None
    target_product: Optional[str] = None
    expected_revenue_lift: Optional[float] = None
    status: Optional[str] = CampaignStatus.DRAFT

    class Config:
        from_attributes = True


class CampaignStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        upper_v = v.upper()
        if upper_v not in CampaignStatus.ALL:
            raise ValueError(f"Invalid campaign status '{v}'. Allowed statuses: {CampaignStatus.ALL}")
        return upper_v