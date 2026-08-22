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


@router.post("/{bundle_id}/execute", response_model=BundleResponse)
def execute_bundle_api(
    bundle_id: int,
    db: Session = Depends(get_db)
):
    from app.constants.bundle_status import BundleStatus
    from app.services.agent_action_service import create_agent_action

    bundle = db.query(Bundle).filter(Bundle.id == bundle_id).first()
    from app.models.order import Order
    if not bundle.projected_revenue:
        orders = db.query(Order).all()
        current_revenue = sum(o.total_amount for o in orders)
        lift_pct = bundle.expected_aov_increase or 18.0
        bundle.projected_revenue = round(current_revenue * (1 + lift_pct / 100), 2) if current_revenue > 0 else 77579.0

    bundle.status = BundleStatus.ACTIVE
    db.commit()
    db.refresh(bundle)

    create_agent_action(
        db=db,
        action_type="BUNDLE_EXECUTED",
        action_name=bundle.bundle_name,
        source_agent="Execution Engine"
    )

    create_audit_log(
        db=db,
        event_type=Events.AI_ACTION_EXECUTED,
        entity=f"BUNDLE (#{bundle.id})",
        description=f"AI activated bundle '{bundle.bundle_name}'"
    )

    return bundle


@router.patch("/{bundle_id}/status", response_model=BundleResponse)
def update_bundle_status_api(
    bundle_id: int,
    payload: BundleStatusUpdate,
    db: Session = Depends(get_db)
):
    from app.constants.bundle_status import BundleStatus
    from app.services.agent_action_service import create_agent_action

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

    if payload.status == BundleStatus.ACTIVE and old_status != BundleStatus.ACTIVE:
        create_agent_action(
            db=db,
            action_type="BUNDLE_EXECUTED",
            action_name=bundle.bundle_name,
            source_agent="Execution Engine"
        )
        create_audit_log(
            db=db,
            event_type=Events.AI_ACTION_EXECUTED,
            entity=f"BUNDLE (#{bundle.id})",
            description=f"AI activated bundle '{bundle.bundle_name}'"
        )

    return bundle