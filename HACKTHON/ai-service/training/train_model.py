"""
MechX Predictive Maintenance Model Trainer
Trains a Multi-Output/Multi-Task Random Forest Classifier & Regressor pipeline
to predict component maintenance requirement, priority risk, and estimated due mileage.
"""

import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, mean_absolute_error

# Set seeds
np.random.seed(42)

COMPONENTS = [
    'Brake Pads',
    'Engine Oil & Filter',
    '12V Battery',
    'Transmission Fluid',
    'Coolant Radiator Flush',
    'Cabin & Air Filters'
]

FUEL_TYPES = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG']
VEHICLE_TYPES = ['SUV', 'SEDAN', 'HATCHBACK', 'EV_CROSSOVER']

def generate_synthetic_dataset(num_samples=4000):
    records = []
    
    for _ in range(num_samples):
        comp = np.random.choice(COMPONENTS)
        fuel = np.random.choice(FUEL_TYPES)
        v_type = np.random.choice(VEHICLE_TYPES)
        
        # Vehicle characteristics
        vehicle_age_years = np.random.uniform(0.5, 12.0)
        current_odometer = int(vehicle_age_years * np.random.uniform(8000, 22000))
        days_since_last_service = np.random.randint(15, 550)
        km_since_last_service = int(days_since_last_service * np.random.uniform(15, 60))
        times_replaced = np.random.randint(0, 5)
        
        # Base maintenance logic for components
        if comp == 'Engine Oil & Filter':
            if fuel == 'ELECTRIC':
                continue # EVs don't have engine oil
            threshold_km = 10000
            threshold_days = 180
            wear_ratio = max(km_since_last_service / threshold_km, days_since_last_service / threshold_days)
        elif comp == 'Brake Pads':
            threshold_km = 22000
            threshold_days = 365
            wear_ratio = max(km_since_last_service / threshold_km, days_since_last_service / threshold_days)
        elif comp == '12V Battery':
            threshold_days = 365 * 3.0 # ~3 years
            wear_ratio = (days_since_last_service + times_replaced * 100) / threshold_days
        elif comp == 'Transmission Fluid':
            threshold_km = 45000
            wear_ratio = (current_odometer % threshold_km) / threshold_km
        elif comp == 'Coolant Radiator Flush':
            threshold_km = 40000
            threshold_days = 730
            wear_ratio = max((current_odometer % threshold_km) / threshold_km, days_since_last_service / threshold_days)
        else: # Filters
            threshold_km = 15000
            wear_ratio = km_since_last_service / threshold_km
            
        # Add realistic noise
        wear_ratio += np.random.normal(0, 0.08)
        wear_ratio = max(0.05, min(2.5, wear_ratio))
        
        # Priority mapping
        if wear_ratio >= 1.05:
            priority = 'CRITICAL'
            status = 'IMMEDIATE_REPLACEMENT_REQUIRED'
            remaining_km = np.random.randint(100, 800)
            remaining_days = np.random.randint(3, 14)
        elif wear_ratio >= 0.85:
            priority = 'HIGH'
            status = 'INSPECTION_AND_SERVICE_DUE_SOON'
            remaining_km = np.random.randint(800, 2500)
            remaining_days = np.random.randint(15, 45)
        elif wear_ratio >= 0.60:
            priority = 'MEDIUM'
            status = 'MONITOR_CONDITION'
            remaining_km = np.random.randint(2500, 6000)
            remaining_days = np.random.randint(45, 120)
        else:
            priority = 'LOW'
            status = 'GOOD_CONDITION'
            remaining_km = np.random.randint(6000, 15000)
            remaining_days = np.random.randint(120, 365)
            
        due_mileage = current_odometer + remaining_km
        
        records.append({
            'component_name': comp,
            'fuel_type': fuel,
            'vehicle_type': v_type,
            'vehicle_age_years': round(vehicle_age_years, 2),
            'current_odometer': current_odometer,
            'days_since_last_service': days_since_last_service,
            'km_since_last_service': km_since_last_service,
            'times_previously_replaced': times_replaced,
            'wear_ratio': round(wear_ratio, 3),
            'priority': priority,
            'status': status,
            'remaining_km': remaining_km,
            'remaining_days': remaining_days,
            'due_mileage': due_mileage
        })
        
    df = pd.DataFrame(records)
    return df

def train_and_save():
    print("1. Generating synthetic maintenance training dataset...")
    df = generate_synthetic_dataset(6000)
    
    os.makedirs('ai-service/datasets', exist_ok=True)
    os.makedirs('ai-service/models', exist_ok=True)
    
    dataset_path = 'ai-service/datasets/vehicle_maintenance_data.csv'
    df.to_csv(dataset_path, index=False)
    print(f"Dataset saved to {dataset_path} with {len(df)} samples.")
    
    # Feature preprocessing
    le_comp = LabelEncoder().fit(COMPONENTS)
    le_fuel = LabelEncoder().fit(FUEL_TYPES)
    le_vtype = LabelEncoder().fit(VEHICLE_TYPES)
    le_priority = LabelEncoder().fit(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    
    X = pd.DataFrame()
    X['comp_encoded'] = le_comp.transform(df['component_name'])
    X['fuel_encoded'] = le_fuel.transform(df['fuel_type'])
    X['vtype_encoded'] = le_vtype.transform(df['vehicle_type'])
    X['vehicle_age_years'] = df['vehicle_age_years']
    X['current_odometer'] = df['current_odometer']
    X['days_since_last_service'] = df['days_since_last_service']
    X['km_since_last_service'] = df['km_since_last_service']
    X['times_previously_replaced'] = df['times_previously_replaced']
    
    # Targets
    y_priority = le_priority.transform(df['priority'])
    y_remaining_km = df['remaining_km']
    y_remaining_days = df['remaining_days']
    
    # Split
    X_train, X_test, y_p_train, y_p_test, y_km_train, y_km_test, y_d_train, y_d_test = train_test_split(
        X, y_priority, y_remaining_km, y_remaining_days, test_size=0.2, random_state=42
    )
    
    print("2. Training Random Forest Priority Classifier...")
    clf_priority = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
    clf_priority.fit(X_train, y_p_train)
    p_preds = clf_priority.predict(X_test)
    print(classification_report(y_p_test, p_preds, target_names=le_priority.classes_))
    
    print("3. Training Random Forest Mileage & Days Regressor...")
    reg_km = RandomForestRegressor(n_estimators=80, max_depth=12, random_state=42)
    reg_km.fit(X_train, y_km_train)
    km_mae = mean_absolute_error(y_km_test, reg_km.predict(X_test))
    print(f"Mileage Regression MAE: {km_mae:.1f} KM")
    
    reg_days = RandomForestRegressor(n_estimators=80, max_depth=12, random_state=42)
    reg_days.fit(X_train, y_d_train)
    days_mae = mean_absolute_error(y_d_test, reg_days.predict(X_test))
    print(f"Days Regression MAE: {days_mae:.1f} Days")
    
    # Save artifacts bundle
    model_bundle = {
        'clf_priority': clf_priority,
        'reg_km': reg_km,
        'reg_days': reg_days,
        'le_comp': le_comp,
        'le_fuel': le_fuel,
        'le_vtype': le_vtype,
        'le_priority': le_priority,
        'components': COMPONENTS,
        'trained_at': datetime.now().isoformat()
    }
    
    model_path = 'ai-service/models/maintenance_rf_pipeline.joblib'
    joblib.dump(model_bundle, model_path)
    print(f"Successfully serialized model bundle to {model_path}!")

if __name__ == '__main__':
    train_and_save()
