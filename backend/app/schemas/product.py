from typing import Optional
from pydantic import BaseModel


class ProductCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    stock: int = 10
    merchant_id: Optional[int] = 1
    category_id: Optional[int] = None


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category_id: Optional[int] = None


class ProductResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    price: float
    stock: int
    merchant_id: Optional[int] = None
    category_id: Optional[int] = None
    inventory_status: Optional[str] = None

    class Config:
        from_attributes = True