from fastapi import APIRouter, HTTPException
from ..schemas.maintenance import MaintenancePredictionRequest, MaintenancePredictionResponse
from ..services.predictor import MaintenancePredictorService

router = APIRouter(prefix="/api/v1/predict", tags=["Predictive Maintenance"])
predictor_service = MaintenancePredictorService()

@router.post("/", response_model=MaintenancePredictionResponse)
def predict_maintenance(request: MaintenancePredictionRequest):
    try:
        return predictor_service.predict(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@router.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "MechX AI Predictive Maintenance Microservice",
        "model_loaded": predictor_service.bundle is not None
    }
