import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "VivaMate API")
    API_V1_STR: str = "/api"
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if origin.strip()
    ]
    
    # AI Provider Configuration ("ollama" | "remote")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "ollama")
    
    # Local Ollama AI Configuration
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen3:4b")

    # Remote Open-Weight AI Configuration (Production / Deployment)
    REMOTE_AI_BASE_URL: str = os.getenv("REMOTE_AI_BASE_URL", "https://router.huggingface.co/v1")
    REMOTE_AI_API_KEY: str = os.getenv("REMOTE_AI_API_KEY", "")
    REMOTE_AI_MODEL: str = os.getenv("REMOTE_AI_MODEL", "Qwen/Qwen3-4B-Instruct-2507")

    # Hugging Face Inference Providers Configuration
    HF_BASE_URL: str = os.getenv("HF_BASE_URL", "https://router.huggingface.co/v1")
    HF_TOKEN: str = os.getenv("HF_TOKEN", "")
    HF_MODEL: str = os.getenv("HF_MODEL", "Qwen/Qwen3-4B-Instruct-2507")

settings = Settings()
