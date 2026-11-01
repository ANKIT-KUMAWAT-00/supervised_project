import os
import json
from datetime import datetime
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.dependencies import get_current_admin
from ..models import MLModel, MLTrainingRun, User
from ..ml.train_occupancy import train_and_evaluate_models, MODELS_DIR

router = APIRouter(prefix="/ml", tags=["3D Machine Learning Laboratory"])

TELEMETRY_FILE = os.path.join(MODELS_DIR, "occupancy_telemetry.json")

def load_telemetry():
    if not os.path.exists(TELEMETRY_FILE):
        # Run training if not yet exists
        return train_and_evaluate_models()
    with open(TELEMETRY_FILE, "r") as f:
        return json.load(f)

@router.get("/telemetry")
def get_ml_telemetry():
    """
    Returns actual training metrics, comparison table (LR, RF, XGBoost),
    actual vs predicted curves, 3D Decision Tree Forest coordinates,
    3D regression surface points, and 3D data point clouds.
    """
    return load_telemetry()

@router.get("/models")
def get_ml_models_db(db: Session = Depends(get_db)):
    models = db.query(MLModel).all()
    runs = db.query(MLTrainingRun).order_by(MLTrainingRun.created_at.desc()).limit(10).all()
    return {
        "models": [
            {
                "id": m.id,
                "model_name": m.model_name,
                "model_type": m.model_type,
                "version": m.version,
                "mae": m.mae,
                "rmse": m.rmse,
                "r2": m.r2,
                "is_active": m.is_active,
                "trained_at": m.trained_at
            }
            for m in models
        ],
        "recent_runs": [
            {
                "id": r.id,
                "algorithm": r.algorithm,
                "dataset_size": r.dataset_size,
                "status": r.status,
                "duration_seconds": r.duration_seconds,
                "created_at": r.created_at
            }
            for r in runs
        ]
    }

@router.post("/retrain")
def trigger_retraining(db: Session = Depends(get_db)):
    """
    Triggers the actual ML training pipeline, compares all 3 algorithms,
    generates fresh 3D tree topologies & regression planes, and updates DB records.
    """
    print("Initiating actual machine learning model retraining...")
    new_telemetry = train_and_evaluate_models()

    # Update database records
    now = datetime.utcnow()
    champ_key = new_telemetry["champion_model"]
    for key, stats in new_telemetry["models"].items():
        db_model = db.query(MLModel).filter(MLModel.model_type == key).first()
        is_champ = (key == champ_key)
        if db_model:
            db_model.mae = stats["mae"]
            db_model.rmse = stats["rmse"]
            db_model.r2 = stats["r2"]
            db_model.is_active = is_champ
            db_model.trained_at = now
        else:
            db_model = MLModel(
                model_name=stats["name"],
                model_type=key,
                version="v1.3",
                mae=stats["mae"],
                rmse=stats["rmse"],
                r2=stats["r2"],
                is_active=is_champ,
                trained_at=now
            )
            db.add(db_model)
        
        db.flush()
        run = MLTrainingRun(
            model_id=db_model.id,
            algorithm=stats["name"],
            dataset_size=new_telemetry["dataset_rows"],
            features_used=new_telemetry["features"],
            hyperparameters={"retrain_triggered": True},
            metrics_json=stats,
            status="completed",
            duration_seconds=new_telemetry["training_duration_seconds"],
            logs=f"Retrained successfully. MAE: {stats['mae']}, R2: {stats['r2']}"
        )
        db.add(run)

    db.commit()
    return {
        "message": "Retraining completed successfully. Champion model selected and deployed.",
        "champion_model": champ_key,
        "duration_seconds": new_telemetry["training_duration_seconds"],
        "telemetry": new_telemetry
    }
