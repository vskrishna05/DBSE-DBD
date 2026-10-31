from pydantic import BaseModel, Field
from typing import List, Optional

class MaintenancePredictionRequest(BaseModel):
    vehicle_id: int
    vehicle_type: Optional[str] = 'SUV' # SUV, SEDAN, HATCHBACK, EV_CROSSOVER
    fuel_type: str = 'DIESEL' # PETROL, DIESEL, ELECTRIC, HYBRID, CNG
    manufacturing_year: int = 2022
    current_odometer: int = 38450
    last_service_odometer: Optional[int] = 30000
    days_since_last_service: Optional[int] = 140
    component_history: Optional[dict] = Field(default_factory=dict) # e.g. {'Brake Pads': 1}

class ComponentPrediction(BaseModel):
    component_name: str
    prediction_type: str = 'ML_MODEL'
    predicted_maintenance_requirement: str
    estimated_due_mileage: int
    estimated_due_date: str
    priority_level: str # LOW, MEDIUM, HIGH, CRITICAL
    confidence_score: float
    recommendation: str

class MaintenancePredictionResponse(BaseModel):
    vehicle_id: int
    evaluated_at: str
    predictions: List[ComponentPrediction]
    model_version: str
