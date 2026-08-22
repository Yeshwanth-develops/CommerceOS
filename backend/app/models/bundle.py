from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Float
from sqlalchemy import Text

from app.db.base import Base


class Bundle(Base):
    __tablename__ = "bundles"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    bundle_name = Column(String)

    product_1 = Column(String)

    product_2 = Column(String)

    bundle_price = Column(Float)

    expected_aov_increase = Column(Float)

    reasoning = Column(Text, nullable=True)

    status = Column(
        String,
        default="DRAFT"
    )