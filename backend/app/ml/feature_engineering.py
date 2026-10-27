import numpy as np
import pandas as pd

FEATURE_COLUMNS = [
    "hour", "day_of_week", "month", "is_weekend", "is_holiday", "is_exam_period",
    "sin_hour", "cos_hour", "sin_dow", "cos_dow",
    "lag_1h", "lag_2h", "lag_3h", "lag_24h",
    "rolling_mean_3h", "rolling_mean_6h", "rolling_std_3h"
]

def engineer_occupancy_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes cyclical time features, autoregressive lags, and rolling metrics.
    """
    data = df.copy()
    data = data.sort_values("timestamp").reset_index(drop=True)

    # Cyclical transforms
    data["sin_hour"] = np.sin(2 * np.pi * data["hour"] / 24.0)
    data["cos_hour"] = np.cos(2 * np.pi * data["hour"] / 24.0)
    data["sin_dow"] = np.sin(2 * np.pi * data["day_of_week"] / 7.0)
    data["cos_dow"] = np.cos(2 * np.pi * data["day_of_week"] / 7.0)

    # Autoregressive lags based on total_occupancy
    target = data["total_occupancy"]
    data["lag_1h"] = target.shift(1)
    data["lag_2h"] = target.shift(2)
    data["lag_3h"] = target.shift(3)
    data["lag_24h"] = target.shift(17) # 17 operating hours per day in our diurnal series

    # Rolling statistics
    data["rolling_mean_3h"] = target.shift(1).rolling(window=3, min_periods=1).mean()
    data["rolling_mean_6h"] = target.shift(1).rolling(window=6, min_periods=1).mean()
    data["rolling_std_3h"] = target.shift(1).rolling(window=3, min_periods=1).std().fillna(0)

    # Fill initial NaNs with backfill/forward-fill
    data = data.bfill().ffill()

    return data
