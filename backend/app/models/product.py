from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    description = Column(String)

    price = Column(Float, nullable=False)

    stock = Column(Integer, default=0)

    merchant_id = Column(
        Integer,
        ForeignKey("merchants.id")
    )

    category_id = Column(
        Integer,
        ForeignKey("categories.id")
    )

    merchant = relationship(
        "Merchant",
        back_populates="products"
    )

    category = relationship(
        "Category"
    )

    @property
    def inventory_status(self) -> str:
        if self.stock == 0:
            return "Out of Stock"
        elif self.stock < 10:
            return "Low Stock"
        return "Available"