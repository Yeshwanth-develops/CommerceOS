from sqlalchemy.orm import Session
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from typing import Optional

def create_product(
    db: Session,
    product: ProductCreate
):
    db_product = Product(
        title=product.title,
        description=product.description,
        price=product.price,
        stock=product.stock,
        merchant_id=product.merchant_id
    )

    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    return db_product


def get_products(
    db: Session,
    search: Optional[str] = None
):
    query = db.query(Product)

    if search:
        query = query.filter(
            Product.title.ilike(f"%{search}%")
        )

    products = query.all()

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
            "inventory_status": get_inventory_status(product.stock)
        })

    return result



def get_product_by_id(
    db: Session,
    product_id: int
):
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
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        return None

    product.title = product_data.title
    product.description = product_data.description
    product.price = product_data.price
    product.stock = product_data.stock

    db.commit()
    db.refresh(product)

    return product


def delete_product(
    db: Session,
    product_id: int
):
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

def get_inventory_status(stock: int):
    if stock == 0:
        return "Out of Stock"

    elif stock < 10:
        return "Low Stock"

    else:
        return "Available"