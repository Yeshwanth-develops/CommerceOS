from app.db.database import engine
from app.db.base import Base

from app.models.merchant import Merchant
from app.models.product import Product
from app.models.category import Category
from app.models.order import Order
from app.models.audit_log import AuditLog

Base.metadata.create_all(bind=engine)

print("Tables Created")