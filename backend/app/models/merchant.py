from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base

class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(Integer, primary_key=True)

    name = Column(String)

    email = Column(String, unique=True)

    products = relationship(
        "Product",
        back_populates="merchant"
    )