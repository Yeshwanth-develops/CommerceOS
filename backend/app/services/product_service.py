from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from app.services.audit_service import create_audit_event
from app.constants.events import Events


def create_product(
    db: Session,
    product: ProductCreate
) -> Product:
    clean_title = product.title.strip()
    m_id = product.merchant_id or 1

    # Ensure Merchant exists to satisfy foreign key constraint
    from app.models.merchant import Merchant
    merchant = db.query(Merchant).filter(Merchant.id == m_id).first()
    if not merchant:
        merchant = Merchant(id=m_id, name="Apex Retail Technologies", email="founder@apexretail.io")
        db.add(merchant)
        db.commit()

    # Check if a product with the same title already exists for this merchant (case-insensitive)
    existing_product = (
        db.query(Product)
        .filter(
            Product.merchant_id == m_id,
            func.lower(Product.title) == func.lower(clean_title)
        )
        .first()
    )

    if existing_product:
        # Intelligent Restock: Update existing product instead of creating duplicate
        previous_stock = existing_product.stock
        existing_stock_to_add = product.stock if product.stock is not None else 10
        existing_product.stock += existing_stock_to_add

        if product.price and product.price > 0:
            existing_product.price = product.price
        if product.description:
            existing_product.description = product.description
        if product.category_id is not None:
            existing_product.category_id = product.category_id

        db.commit()
        db.refresh(existing_product)

        try:
            create_audit_event(
                db=db,
                event_type=Events.PRODUCT_UPDATED,
                entity_type="PRODUCT",
                entity_id=existing_product.id,
                description=f"Restocked product '{existing_product.title}' with +{existing_stock_to_add} units (Stock: {previous_stock} ➔ {existing_product.stock}, Price: ₹{existing_product.price})",
            )
        except Exception:
            pass

        return existing_product

    # Otherwise create a new product
    db_product = Product(
        title=clean_title,
        description=product.description,
        price=product.price,
        stock=product.stock if product.stock is not None else 10,
        merchant_id=m_id,
        category_id=product.category_id,
    )

    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    try:
        create_audit_event(
            db=db,
            event_type=Events.PRODUCT_CREATED,
            entity_type="PRODUCT",
            entity_id=db_product.id,
            description=f"Product '{db_product.title}' created with price ₹{db_product.price} and stock {db_product.stock}",
        )
    except Exception:
        pass

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

    products = query.order_by(Product.id.desc()).all()

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
        product.title = product_data.title.strip()
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
        description=f"Product '{product.title}' updated (Stock: {product.stock}, Price: ₹{product.price})",
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
    elif stock < 15:
        return "Low Stock"
    else:
        return "Available"