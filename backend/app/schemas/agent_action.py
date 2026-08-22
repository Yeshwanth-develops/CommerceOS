from pydantic import BaseModel
from datetime import datetime


class AgentActionResponse(BaseModel):
    id: int

    action_type: str

    action_name: str

    status: str

    source_agent: str

    created_at: datetime

    class Config:
        from_attributes = True