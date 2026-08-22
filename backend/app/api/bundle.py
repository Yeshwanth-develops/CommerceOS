from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.dependencies import get_db
from app.models.bundle import Bundle
from app.schemas.bundle import BundleResponse, BundleStatusUpdate
from app.agents.bundle_agent import generate_bundle
from app.services.audit_service import create_audit_log
from app.constants.events import Events

router = APIRouter(
    prefix="/bundles",
    tags=["Bundles"]
)


@router.post("/generate", response_model=Optional[BundleResponse])
def generate_bundle_api(
    db: Session = Depends(get_db)
):
    bundle = generate_bundle(db)
    if not bundle:
        raise HTTPException(
            status_code=400,
            detail="At least 2 products are required to generate a bundle"
        )
    return bundle


@router.get("/latest", response_model=Optional[BundleResponse])
def get_latest_bundle_api(
    db: Session = Depends(get_db)
):
    bundle = db.query(Bundle).order_by(Bundle.id.desc()).first()
    return bundle


@router.get("/", response_model=List[BundleResponse])
def list_bundles_api(
    db: Session = Depends(get_db)
):
    return db.query(Bundle).order_by(Bundle.id.desc()).all()


@router.patch("/{bundle_id}/status", response_model=BundleResponse)
def update_bundle_status_api(
    bundle_id: int,
    payload: BundleStatusUpdate,
    db: Session = Depends(get_db)
):
    bundle = db.query(Bundle).filter(Bundle.id == bundle_id).first()
    if not bundle:
        raise HTTPException(status_code=404, detail="Bundle not found")

    old_status = bundle.status
    bundle.status = payload.status
    db.commit()
    db.refresh(bundle)

    create_audit_log(
        db=db,
        event_type=Events.BUNDLE_STATUS_UPDATED,
        entity=f"BUNDLE (#{bundle.id})",
        description=f"Bundle '{bundle.bundle_name}' status changed from {old_status} to {bundle.status}"
    )

    return bundle