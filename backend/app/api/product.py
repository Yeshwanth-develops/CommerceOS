from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from typing import Optional

from app.db.dependencies import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services.product_service import (
    create_product,
    get_products,
    get_product_by_id,
    update_product,
    delete_product,
)

router = APIRouter(
    prefix="/products",
    tags=["Products"],
)


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product_api(
    product: ProductCreate,
    db: Session = Depends(get_db),
):
    return create_product(db, product)


@router.get("/", response_model=List[ProductResponse])
def get_products_api(
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return get_products(
        db,
        search
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product_api(
    product_id: int,
    db: Session = Depends(get_db),
):
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found",
        )
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product_api(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db)
):
    updated = update_product(
        db,
        product_id,
        product
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found"
        )
    return updated


@router.delete("/{product_id}")
def delete_product_api(
    product_id: int,
    db: Session = Depends(get_db)
):
    success = delete_product(
        db,
        product_id
    )

    return {
        "success": success
    }