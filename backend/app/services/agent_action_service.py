from sqlalchemy.orm import Session

from app.models.agent_action import AgentAction


def create_agent_action(
    db: Session,
    action_type: str,
    action_name: str,
    source_agent: str,
):
    action = AgentAction(
        action_type=action_type,
        action_name=action_name,
        source_agent=source_agent,
        status="COMPLETED"
    )

    db.add(action)
    db.commit()
    db.refresh(action)

    return action