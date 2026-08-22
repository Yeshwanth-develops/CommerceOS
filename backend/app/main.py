from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import app.models
from app.db.database import engine
from app.db.database import Base


@asynccontextmanager
async def lifespan(fastapi_app: FastAPI):
    # Automatically create tables on startup
    Base.metadata.create_all(bind=engine)
    try:
        from app.models.merchant import Merchant
        from app.models.product import Product
        from app.db.database import SessionLocal
        db = SessionLocal()
        # Guarantee default merchant #1 exists in PostgreSQL
        m = db.query(Merchant).filter(Merchant.id == 1).first()
        if not m:
            m = Merchant(id=1, name="Apex Retail Technologies", email="founder@apexretail.io")
            db.add(m)
            db.commit()

        count = db.query(Product).count()
        if count == 0:
            print("[*] Empty database detected. Seeding initial demo catalog...")
            from seed_demo_data import seed_demo_data
            seed_demo_data()
        db.close()
    except Exception as e:
        print(f"[!] Startup initialization notice: {e}")
    yield


app = FastAPI(
    title="ARGOS API",
    version="2.0.0",
    description="Autonomous Commerce OS API Backend",
    lifespan=lifespan,
)


from app.api.product import router as product_router
from app.api.order import router as order_router
from app.api.payment import router as payment_router
from app.api.webhook import router as webhook_router
from app.api.audit import router as audit_router
from app.api.growth import router as growth_router
from app.api.campaign import router as campaign_router
from app.api.bundle import router as bundle_router
from app.api.agent_actions import router as agent_actions_router
from app.api.assistant import router as assistant_router

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print(f"[!] Unhandled error on {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={"Access-Control-Allow-Origin": "*"}
    )

app.include_router(product_router)
app.include_router(order_router)
app.include_router(payment_router)
app.include_router(webhook_router)
app.include_router(audit_router)
app.include_router(growth_router)
app.include_router(campaign_router)
app.include_router(bundle_router)
app.include_router(agent_actions_router)
app.include_router(assistant_router)

@app.get("/")
def root():
    return {
        "message": "ARGOS Running"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }

@app.post("/seed")
def seed():
    from seed_demo_data import seed_demo_data
    seed_demo_data()
    return {
        "status": "success",
        "message": "Demo catalog, orders, and AI intelligence seeded successfully"
    }