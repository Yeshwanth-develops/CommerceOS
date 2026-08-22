from app.db.database import engine
from app.db.base import Base

from app.models.merchant import Merchant
from app.models.product import Product
from app.models.category import Category
from app.models.order import Order
from app.models.audit_log import AuditLog
from app.models.campaign import Campaign
from app.models.bundle import Bundle
from app.models.agent_action import AgentAction

Base.metadata.create_all(bind=engine)

print("Tables Created")