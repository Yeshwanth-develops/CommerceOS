import os
import json
from fastapi import APIRouter, Request, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from typing import Optional

from app.db.dependencies import get_db
from app.services.webhook_service import process_webhook
from app.services.razorpay_service import verify_webhook_signature

router = APIRouter(
    prefix="/webhooks",
    tags=["Webhooks"],
)


@router.post("/razorpay")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None, alias="X-Razorpay-Signature"),
    db: Session = Depends(get_db),
):
    body_bytes = await request.body()
    body_str = body_bytes.decode("utf-8")

    webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET", "").strip()

    # If signature is provided or secret is configured, perform HMAC SHA256 validation
    if webhook_secret and x_razorpay_signature:
        is_valid = verify_webhook_signature(
            body=body_str,
            signature=x_razorpay_signature,
            webhook_secret=webhook_secret,
        )
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook signature",
            )

    try:
        payload = json.loads(body_str) if body_str else {}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload",
        )

    return process_webhook(db, payload)