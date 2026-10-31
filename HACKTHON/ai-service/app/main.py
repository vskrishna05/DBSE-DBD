from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.predict import router as predict_router

app = FastAPI(
    title="MechX Predictive Maintenance Microservice",
    description="Machine Learning REST API for vehicle component degradation analysis and maintenance forecasting using Scikit-learn Random Forests.",
    version="1.0.0"
)

# Enable CORS for Spring Boot backend and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router)

@app.get("/")
def root():
    return {
        "message": "MechX Predictive Maintenance API is running",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
def health():
    return {"status": "HEALTHY", "service": "MechX Predictive Maintenance Microservice"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
