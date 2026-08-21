from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from app.services.audit_service import create_audit_event
from app.constants.events import Events


def create_product(
    db: Session,
    product: ProductCreate
) -> Product:
    db_product = Product(
        title=product.title,
        description=product.description,
        price=product.price,
        stock=product.stock,
        merchant_id=product.merchant_id,
        category_id=product.category_id,
    )

    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    create_audit_event(
        db=db,
        event_type=Events.PRODUCT_CREATED,
        entity_type="PRODUCT",
        entity_id=db_product.id,
        description=f"Product '{db_product.title}' created with price ₹{db_product.price} and stock {db_product.stock}",
    )

    return db_product


def get_products(
    db: Session,
    search: Optional[str] = None
) -> List[Dict[str, Any]]:
    query = db.query(Product)

    if search:
        query = query.filter(
            Product.title.ilike(f"%{search}%")
        )

    products = query.order_by(Product.id.asc()).all()

    result = []
    for product in products:
        result.append({
            "id": product.id,
            "title": product.title,
            "description": product.description,
            "price": product.price,
            "stock": product.stock,
            "merchant_id": product.merchant_id,
            "category_id": product.category_id,
            "inventory_status": get_inventory_status(product.stock),
        })

    return result


def get_product_by_id(
    db: Session,
    product_id: int
) -> Optional[Product]:
    return (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )


# Alias
get_product = get_product_by_id


def update_product(
    db: Session,
    product_id: int,
    product_data: ProductUpdate
) -> Optional[Product]:
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        return None

    if product_data.title is not None:
        product.title = product_data.title
    if product_data.description is not None:
        product.description = product_data.description
    if product_data.price is not None:
        product.price = product_data.price
    if product_data.stock is not None:
        product.stock = product_data.stock

    db.commit()
    db.refresh(product)

    create_audit_event(
        db=db,
        event_type=Events.PRODUCT_UPDATED,
        entity_type="PRODUCT",
        entity_id=product.id,
        description=f"Product '{product.title}' updated",
    )

    return product


def delete_product(
    db: Session,
    product_id: int
) -> bool:
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        return False

    db.delete(product)
    db.commit()
    return True


def get_inventory_status(stock: int) -> str:
    if stock <= 0:
        return "Out of Stock"
    elif stock < 10:
        return "Low Stock"
    else:
        return "Available"