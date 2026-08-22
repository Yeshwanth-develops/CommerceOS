from pydantic import BaseModel, field_validator
from typing import Optional
from app.constants.bundle_status import BundleStatus


class BundleResponse(BaseModel):
    id: Optional[int] = None
    bundle_name: str
    product_1: str
    product_2: str
    bundle_price: float
    expected_aov_increase: float
    projected_revenue: Optional[float] = None
    reasoning: Optional[str] = None
    status: Optional[str] = BundleStatus.DRAFT

    class Config:
        from_attributes = True


class BundleStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        upper_v = v.upper()
        if upper_v not in BundleStatus.ALL:
            raise ValueError(f"Invalid bundle status '{v}'. Allowed statuses: {BundleStatus.ALL}")
        return upper_v