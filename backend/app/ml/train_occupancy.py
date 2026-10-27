import os
import json
import time
import joblib
import warnings
import numpy as np
import pandas as pd
from datetime import datetime

warnings.filterwarnings("ignore", category=RuntimeWarning)
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from .data_generator import generate_library_occupancy_dataset
from .feature_engineering import engineer_occupancy_features, FEATURE_COLUMNS

MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(MODELS_DIR, exist_ok=True)

def extract_tree_3d_structure(rf_model, feature_names, max_trees: int = 5):
    """
    Extracts geometric node coordinates and split metadata for the 3D Forest visualization.
    """
    trees_3d = []
    for tree_idx in range(min(max_trees, len(rf_model.estimators_))):
        estimator = rf_model.estimators_[tree_idx].tree_
        nodes = []
        
        def traverse(node_id, depth, x, y, z, parent_id=None):
            is_leaf = estimator.children_left[node_id] == estimator.children_right[node_id]
            feature_idx = estimator.feature[node_id]
            feature_name = feature_names[feature_idx] if feature_idx >= 0 else "Leaf"
            threshold = float(estimator.threshold[node_id]) if not is_leaf else float(estimator.value[node_id][0][0])
            
            node_data = {
                "id": int(node_id),
                "parent_id": int(parent_id) if parent_id is not None else None,
                "depth": int(depth),
                "x": round(float(x), 2),
                "y": round(float(y), 2),
                "z": round(float(z), 2),
                "is_leaf": bool(is_leaf),
                "feature": feature_name,
                "threshold": round(threshold, 2),
                "samples": int(estimator.n_node_samples[node_id]),
                "impurity": round(float(estimator.impurity[node_id]), 4)
            }
            nodes.append(node_data)
            
            if not is_leaf and depth < 4: # limit depth for clean 3D rendering
                left_child = int(estimator.children_left[node_id])
                right_child = int(estimator.children_right[node_id])
                spread = 3.5 / (depth + 1)
                traverse(left_child, depth + 1, x - spread, y - 2.0, z, parent_id=node_id)
                traverse(right_child, depth + 1, x + spread, y - 2.0, z, parent_id=node_id)

        # Space out trees along the X/Z axis
        tree_offset_x = (tree_idx - (max_trees - 1) / 2) * 8.0
        traverse(0, 0, tree_offset_x, 6.0, 0.0, parent_id=None)
        trees_3d.append({
            "tree_index": tree_idx,
            "root_x": tree_offset_x,
            "nodes": nodes
        })
    return trees_3d

def extract_xgboost_3d_ensembles(xgb_model, feature_names, max_stages: int = 4):
    """
    Extracts sequential boosting stages for 3D sequential ensemble visualization.
    """
    stages = []
    try:
        booster = xgb_model.get_booster()
        dump = booster.get_dump(dump_format="json")
        for i in range(min(max_stages, len(dump))):
            tree_json = json.loads(dump[i])
            stages.append({
                "stage": i,
                "weight_scale": round(0.08 * (0.95 ** i), 4),
                "tree_summary": f"Boosting Iteration {i+1}: Focuses on residual error from Stage {i}"
            })
    except Exception:
        # Fallback if dump format differs
        for i in range(max_stages):
            stages.append({
                "stage": i,
                "weight_scale": round(0.08 * (0.95 ** i), 4),
                "tree_summary": f"Boosting Stage {i+1} Sequential Tree"
            })
    return stages

def train_and_evaluate_models():
    """
    Executes complete ML training pipeline, compares all 3 models, saves models and telemetry.
    """
    start_time = time.time()
    print("Generating 12-month synthetic occupancy historical dataset...")
    raw_df = generate_library_occupancy_dataset(days=365)
    
    print("Engineering features (lags, cyclical time, rolling stats)...")
    featured_df = engineer_occupancy_features(raw_df)

    X = featured_df[FEATURE_COLUMNS]
    y = featured_df["total_occupancy"]

    # Time-based train / val / test split
    n = len(featured_df)
    train_end = int(n * 0.70)
    val_end = int(n * 0.85)

    X_train, y_train = X.iloc[:train_end], y.iloc[:train_end]
    X_val, y_val = X.iloc[train_end:val_end], y.iloc[train_end:val_end]
    X_test, y_test = X.iloc[val_end:], y.iloc[val_end:]

    results = {}
    fitted_models = {}

    # 1. Linear Regression (L2 Regularized Ridge)
    print("Training 1/3: Linear Regression (Ridge)...")
    lr = Ridge(alpha=1.0)
    lr.fit(X_train, y_train)
    val_pred_lr = lr.predict(X_val)
    test_pred_lr = lr.predict(X_test)
    results["linear_regression"] = {
        "name": "Linear Regression",
        "mae": float(round(mean_absolute_error(y_test, test_pred_lr), 2)),
        "rmse": float(round(np.sqrt(mean_squared_error(y_test, test_pred_lr)), 2)),
        "r2": float(round(r2_score(y_test, test_pred_lr), 4)),
        "val_mae": float(round(mean_absolute_error(y_val, val_pred_lr), 2)),
        "coefficients": {f: float(round(c, 4)) for f, c in zip(FEATURE_COLUMNS, lr.coef_)},
        "intercept": float(round(lr.intercept_, 4))
    }
    fitted_models["linear_regression"] = lr

    # 2. Random Forest Regressor
    print("Training 2/3: Random Forest Regressor...")
    rf = RandomForestRegressor(n_estimators=45, max_depth=9, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    val_pred_rf = rf.predict(X_val)
    test_pred_rf = rf.predict(X_test)
    results["random_forest"] = {
        "name": "Random Forest Regressor",
        "mae": float(round(mean_absolute_error(y_test, test_pred_rf), 2)),
        "rmse": float(round(np.sqrt(mean_squared_error(y_test, test_pred_rf)), 2)),
        "r2": float(round(r2_score(y_test, test_pred_rf), 4)),
        "val_mae": float(round(mean_absolute_error(y_val, val_pred_rf), 2)),
        "feature_importances": {f: float(round(imp, 4)) for f, imp in zip(FEATURE_COLUMNS, rf.feature_importances_)}
    }
    fitted_models["random_forest"] = rf

    # 3. XGBoost Regressor
    print("Training 3/3: XGBoost Regressor...")
    xgb = XGBRegressor(n_estimators=50, max_depth=6, learning_rate=0.08, random_state=42, n_jobs=-1)
    xgb.fit(X_train, y_train)
    val_pred_xgb = xgb.predict(X_val)
    test_pred_xgb = xgb.predict(X_test)
    results["xgboost"] = {
        "name": "XGBoost Regressor",
        "mae": float(round(mean_absolute_error(y_test, test_pred_xgb), 2)),
        "rmse": float(round(np.sqrt(mean_squared_error(y_test, test_pred_xgb)), 2)),
        "r2": float(round(r2_score(y_test, test_pred_xgb), 4)),
        "val_mae": float(round(mean_absolute_error(y_val, val_pred_xgb), 2)),
        "feature_importances": {f: float(round(imp, 4)) for f, imp in zip(FEATURE_COLUMNS, xgb.feature_importances_)}
    }
    fitted_models["xgboost"] = xgb

    # Select Champion Model based on best (lowest) validation MAE and highest R2
    best_key = min(results.keys(), key=lambda k: results[k]["val_mae"])
    print(f"Champion Model Selected: {results[best_key]['name']} (Val MAE: {results[best_key]['val_mae']}, Test R2: {results[best_key]['r2']})")

    # Serialize Models
    for key, model in fitted_models.items():
        model_path = os.path.join(MODELS_DIR, f"{key}_occupancy.joblib")
        joblib.dump(model, model_path)

    best_model_path = os.path.join(MODELS_DIR, "best_occupancy_model.joblib")
    joblib.dump(fitted_models[best_key], best_model_path)

    # Actual vs Predicted Sample Data (last 48 hours of test set)
    sample_test_timestamps = featured_df["timestamp"].iloc[val_end:].dt.strftime("%Y-%m-%d %H:%M").tolist()[-48:]
    actual_values = [int(v) for v in y_test.iloc[-48:].tolist()]
    pred_lr_vals = [int(round(v)) for v in test_pred_lr[-48:].tolist()]
    pred_rf_vals = [int(round(v)) for v in test_pred_rf[-48:].tolist()]
    pred_xgb_vals = [int(round(v)) for v in test_pred_xgb[-48:].tolist()]

    actual_vs_predicted = [
        {
            "timestamp": sample_test_timestamps[i],
            "actual": actual_values[i],
            "linear_regression": pred_lr_vals[i],
            "random_forest": pred_rf_vals[i],
            "xgboost": pred_xgb_vals[i],
            "residual_xgb": actual_values[i] - pred_xgb_vals[i]
        }
        for i in range(len(sample_test_timestamps))
    ]

    # Generate 3D ML Data:
    # 1. 3D Decision Tree Forest
    trees_3d = extract_tree_3d_structure(rf, FEATURE_COLUMNS, max_trees=4)

    # 2. 3D Regression Surface Coordinates (Hour vs Lag_1h vs Occupancy)
    hour_grid = np.linspace(7, 23, 10)
    lag_grid = np.linspace(50, 320, 10)
    H_mesh, L_mesh = np.meshgrid(hour_grid, lag_grid)
    # Estimate plane using LR weights for hour & lag_1h
    h_idx = FEATURE_COLUMNS.index("hour")
    l_idx = FEATURE_COLUMNS.index("lag_1h")
    Z_mesh = lr.intercept_ + lr.coef_[h_idx] * H_mesh + lr.coef_[l_idx] * L_mesh
    regression_surface_3d = {
        "x_label": "Hour of Day (7 - 23)",
        "y_label": "Lag 1h Occupancy",
        "z_label": "Predicted Occupancy",
        "plane_points": [
            {"x": float(round(H_mesh[i, j], 1)), "y": float(round(L_mesh[i, j], 1)), "z": float(round(Z_mesh[i, j], 1))}
            for i in range(10) for j in range(10)
        ]
    }

    # 3. 3D Sample Data Cloud (120 points normalized in -10 to +10 3D box)
    sample_indices = np.random.choice(len(X_test), 120, replace=False)
    data_points_3d = []
    for idx in sample_indices:
        h = float(X_test.iloc[idx]["hour"])
        lag = float(X_test.iloc[idx]["lag_1h"])
        occ = float(y_test.iloc[idx])
        # Normalized coordinates for 3D viewport
        x_norm = ((h - 7) / 16.0) * 16.0 - 8.0
        y_norm = ((occ - 20) / 330.0) * 10.0 - 5.0
        z_norm = ((lag - 20) / 330.0) * 16.0 - 8.0
        data_points_3d.append({
            "x": round(x_norm, 2),
            "y": round(y_norm, 2),
            "z": round(z_norm, 2),
            "actual_occupancy": int(occ),
            "hour": int(h),
            "exam_flag": int(X_test.iloc[idx]["is_exam_period"])
        })

    elapsed_time = round(time.time() - start_time, 2)

    telemetry = {
        "trained_at": datetime.utcnow().isoformat(),
        "training_duration_seconds": elapsed_time,
        "dataset_rows": n,
        "features": FEATURE_COLUMNS,
        "champion_model": best_key,
        "models": results,
        "actual_vs_predicted": actual_vs_predicted,
        "trees_3d": trees_3d,
        "regression_surface_3d": regression_surface_3d,
        "data_points_3d": data_points_3d,
        "xgboost_stages": extract_xgboost_3d_ensembles(xgb, FEATURE_COLUMNS)
    }

    metadata_path = os.path.join(MODELS_DIR, "occupancy_telemetry.json")
    with open(metadata_path, "w") as f:
        json.dump(telemetry, f, indent=2)

    print(f"ML Pipeline Completed successfully in {elapsed_time}s! Telemetry saved to {metadata_path}")
    return telemetry

if __name__ == "__main__":
    train_and_evaluate_models()
