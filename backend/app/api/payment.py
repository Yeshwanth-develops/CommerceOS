from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.db.dependencies import get_db

from app.schemas.payment import (
    PaymentVerificationRequest
)

from app.services.payment_service import (
    verify_payment
)

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


@router.post("/verify")
def verify_payment_api(
    data: PaymentVerificationRequest,
    db: Session = Depends(get_db)
):
    success = verify_payment(
        db,
        data
    )

    if not success:
        raise HTTPException(
            status_code=400,
            detail="Payment verification failed"
        )

    return {
        "success": True
    }