from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.dependencies import get_db
from app.agents.commerce_agent import (
    merchant_assistant,
    execute_full_commerce_plan,
)

class ChatRequest(BaseModel):
    query: str

router = APIRouter(
    prefix="/assistant",
    tags=["Commerce Assistant"]
)

@router.post("/chat")
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    return merchant_assistant(
        db=db,
        query=request.query
    )


@router.post("/execute-plan")
def execute_plan(
    db: Session = Depends(get_db)
):
    return execute_full_commerce_plan(db=db)