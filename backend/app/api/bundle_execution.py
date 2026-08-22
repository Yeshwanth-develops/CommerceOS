from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.bundle import Bundle

router = APIRouter(
    prefix="/bundles",
    tags=["Bundle Execution"]
)

@router.post("/{bundle_id}/execute")
def execute_bundle(
    bundle_id: int,
    db: Session = Depends(get_db)
):
    bundle = (
        db.query(Bundle)
        .filter(
            Bundle.id == bundle_id
        )
        .first()
    )

    if not bundle:
        raise HTTPException(
            status_code=404,
            detail="Bundle not found"
        )

    bundle.status = "ACTIVE"

    db.commit()

    return {
        "message":
        "Bundle activated",
        "bundle_id":
        bundle.id
    }