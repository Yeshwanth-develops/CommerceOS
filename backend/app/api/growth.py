from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.db.dependencies import get_db

from app.agents.growth_agent import (
    generate_growth_insights
)

router = APIRouter(
    prefix="/growth",
    tags=["Growth Agent"]
)


@router.get("/")
def growth_dashboard(
    db: Session = Depends(get_db)
):
    return generate_growth_insights(db)