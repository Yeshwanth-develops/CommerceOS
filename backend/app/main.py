from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import app.models

from app.api.product import router as product_router
from app.api.order import router as order_router
from app.api.payment import router as payment_router

app = FastAPI(
    title="CommerceOS API",
    version="1.0.0",
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(product_router)
app.include_router(order_router)
app.include_router(payment_router)


@app.get("/")
def root():
    return {
        "message": "CommerceOS Running"
    }