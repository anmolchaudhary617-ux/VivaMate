from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.health import router as health_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="VivaMate - AI-Powered Mock Viva Practice Platform API",
    version="0.1.0",
)

# Configure CORS Middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    """Root route returning quick welcome and health info."""
    return {
        "message": "Welcome to VivaMate API",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
