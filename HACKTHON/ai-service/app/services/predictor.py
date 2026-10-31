import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List
from ..schemas.maintenance import MaintenancePredictionRequest, ComponentPrediction, MaintenancePredictionResponse

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'models', 'maintenance_rf_pipeline.joblib')

class MaintenancePredictorService:
    def __init__(self):
        self.bundle = None
        self.load_model()

    def load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.bundle = joblib.load(MODEL_PATH)
                print(f"[PredictorService] Loaded Random Forest model trained at {self.bundle.get('trained_at')}")
            except Exception as e:
                print(f"[PredictorService] Error loading model: {e}")
                self.bundle = None
        else:
            print(f"[PredictorService] Model file not found at {MODEL_PATH}, will use rule-based fallback.")

    def predict(self, req: MaintenancePredictionRequest) -> MaintenancePredictionResponse:
        current_year = datetime.now().year
        vehicle_age = max(0.5, float(current_year - req.manufacturing_year))
        km_since_last = max(500, req.current_odometer - (req.last_service_odometer or (req.current_odometer - 5000)))
        days_since_last = req.days_since_last_service if req.days_since_last_service is not None else 90

        predictions: List[ComponentPrediction] = []
        
        # Candidate components based on fuel type
        components_to_eval = [
            'Brake Pads',
            'Engine Oil & Filter',
            '12V Battery',
            'Transmission Fluid',
            'Coolant Radiator Flush',
            'Cabin & Air Filters'
        ]
        if req.fuel_type == 'ELECTRIC':
            components_to_eval = [c for c in components_to_eval if c != 'Engine Oil & Filter']

        for comp in components_to_eval:
            times_replaced = req.component_history.get(comp, 0) if req.component_history else 0

            if self.bundle is not None:
                try:
                    le_comp = self.bundle['le_comp']
                    le_fuel = self.bundle['le_fuel']
                    le_vtype = self.bundle['le_vtype']
                    le_priority = self.bundle['le_priority']
                    clf = self.bundle['clf_priority']
                    reg_km = self.bundle['reg_km']
                    reg_days = self.bundle['reg_days']

                    c_enc = le_comp.transform([comp])[0] if comp in le_comp.classes_ else 0
                    f_enc = le_fuel.transform([req.fuel_type])[0] if req.fuel_type in le_fuel.classes_ else 0
                    v_enc = le_vtype.transform([req.vehicle_type])[0] if req.vehicle_type in le_vtype.classes_ else 0

                    features = pd.DataFrame([{
                        'comp_encoded': c_enc,
                        'fuel_encoded': f_enc,
                        'vtype_encoded': v_enc,
                        'vehicle_age_years': vehicle_age,
                        'current_odometer': req.current_odometer,
                        'days_since_last_service': days_since_last,
                        'km_since_last_service': km_since_last,
                        'times_previously_replaced': times_replaced
                    }])

                    pred_class_idx = clf.predict(features)[0]
                    priority = le_priority.inverse_transform([pred_class_idx])[0]
                    proba = np.max(clf.predict_proba(features)[0]) * 100.0

                    rem_km = int(max(300, reg_km.predict(features)[0]))
                    rem_days = int(max(7, reg_days.predict(features)[0]))

                    due_mileage = req.current_odometer + rem_km
                    due_date = (datetime.now() + timedelta(days=rem_days)).strftime('%Y-%m-%d')

                    rec = self._generate_recommendation(comp, priority, rem_km, rem_days)

                    predictions.append(ComponentPrediction(
                        component_name=comp,
                        prediction_type='ML_MODEL',
                        predicted_maintenance_requirement=f"{comp} Service & Health Verification",
                        estimated_due_mileage=due_mileage,
                        estimated_due_date=due_date,
                        priority_level=priority,
                        confidence_score=round(proba, 2),
                        recommendation=rec
                    ))
                    continue
                except Exception as ex:
                    print(f"Fallback to rule-based for {comp}: {ex}")

            # Fallback Rule-Based Engine
            predictions.append(self._rule_based_prediction(comp, req.current_odometer, km_since_last, days_since_last))

        return MaintenancePredictionResponse(
            vehicle_id=req.vehicle_id,
            evaluated_at=datetime.now().isoformat(),
            predictions=predictions,
            model_version='RandomForest-v1.0' if self.bundle else 'RuleBasedFallback-v1.0'
        )

    def _rule_based_prediction(self, comp: str, odometer: int, km_since: int, days_since: int) -> ComponentPrediction:
        threshold_map = {
            'Engine Oil & Filter': (10000, 180),
            'Brake Pads': (22000, 365),
            '12V Battery': (35000, 730),
            'Transmission Fluid': (40000, 730),
            'Coolant Radiator Flush': (40000, 730),
            'Cabin & Air Filters': (15000, 365)
        }
        max_km, max_days = threshold_map.get(comp, (15000, 180))
        km_rem = max(300, max_km - (km_since % max_km))
        days_rem = max(7, max_days - (days_since % max_days))

        wear = max((km_since % max_km) / max_km, (days_since % max_days) / max_days)
        if wear >= 0.90:
            priority = 'CRITICAL'
        elif wear >= 0.70:
            priority = 'HIGH'
        elif wear >= 0.40:
            priority = 'MEDIUM'
        else:
            priority = 'LOW'

        due_mileage = odometer + km_rem
        due_date = (datetime.now() + timedelta(days=days_rem)).strftime('%Y-%m-%d')
        rec = self._generate_recommendation(comp, priority, km_rem, days_rem)

        return ComponentPrediction(
            component_name=comp,
            prediction_type='RULE_BASED',
            predicted_maintenance_requirement=f"{comp} Scheduled Inspection",
            estimated_due_mileage=due_mileage,
            estimated_due_date=due_date,
            priority_level=priority,
            confidence_score=85.0,
            recommendation=rec
        )

    def _generate_recommendation(self, comp: str, priority: str, rem_km: int, rem_days: int) -> str:
        if priority == 'CRITICAL':
            return f"CRITICAL: {comp} shows severe wear parameters. Service within {rem_km} km or {rem_days} days to prevent failure."
        elif priority == 'HIGH':
            return f"ATTENTION: {comp} approaching maintenance threshold in {rem_km} km. Schedule booking with authorized mechanic."
        elif priority == 'MEDIUM':
            return f"MONITOR: {comp} operating within acceptable parameters. Next routine inspection at ~{rem_km} km."
        else:
            return f"OPTIMAL: {comp} in good condition. Expected healthy lifespan exceeds {rem_km} km."
