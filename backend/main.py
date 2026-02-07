from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import positions, products, calculator, learn, assistant, knowledge, valuations, software, service_departments, personas, services, reports, admin, business_units, auth_router
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Product Jarvis API",
    description="Decision-support system for product evaluation",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

app.include_router(positions.router)
app.include_router(products.router)
app.include_router(calculator.router)
app.include_router(learn.router)
app.include_router(assistant.router)
app.include_router(knowledge.router)
app.include_router(valuations.router)
app.include_router(software.router)
app.include_router(service_departments.router)
app.include_router(service_departments.product_dept_router)
app.include_router(personas.router)
app.include_router(services.router)
app.include_router(reports.router)
app.include_router(admin.router)
app.include_router(business_units.router)
app.include_router(business_units.approval_router)
app.include_router(auth_router.router)

@app.get("/")
def root():
    return {"success": True, "data": {"message": "Product Jarvis API"}, "error": None}

@app.get("/health")
def health():
    return {"success": True, "data": {"status": "healthy"}, "error": None}
