import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "LIBRΛ Smart Library Intelligence"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./librava.db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "libra-quantum-cryptographic-key-hyper-secure-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Simulation & IoT
    SIMULATE_IOT_PULSE: bool = True
    SIMULATION_INTERVAL_SECONDS: int = 5
    
    class Config:
        case_sensitive = True

settings = Settings()
