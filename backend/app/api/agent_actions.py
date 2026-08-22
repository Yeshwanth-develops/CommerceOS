from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.dependencies import get_db
from app.models.agent_action import AgentAction
from app.schemas.agent_action import AgentActionResponse

router = APIRouter(
    prefix="/agent-actions",
    tags=["Agent Actions"]
)


@router.get("/", response_model=List[AgentActionResponse])
def get_agent_actions(
    db: Session = Depends(get_db)
):
    return (
        db.query(AgentAction)
        .order_by(
            AgentAction.id.desc()
        )
        .all()
    )