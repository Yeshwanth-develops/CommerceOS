from sqlalchemy import Column, Integer, String, Float

from app.db.base import Base


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    description = Column(String)

    discount_percentage = Column(Float)

    target_product = Column(String)

    expected_revenue_lift = Column(Float)

    status = Column(String, default="DRAFT")