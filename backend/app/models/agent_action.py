from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime

from datetime import datetime

from app.db.base import Base


class AgentAction(Base):
    __tablename__ = "agent_actions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    action_type = Column(
        String,
        nullable=False
    )

    action_name = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        default="COMPLETED"
    )

    source_agent = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )