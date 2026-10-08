import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

dotenv_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=dotenv_path)

class Settings:
    def __init__(self):
        self.APP_NAME: str = "UniAssist API"
        self.APP_VERSION: str = "2026.1"
        self.DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")

        self.LLM_API_KEY: str = os.getenv("LLM_API_KEY", "").strip()
        self.LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini").strip()
        self.LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1").rstrip("/")

        self.EMBEDDING_MODEL: str = os.getenv(
            "EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"
        ).strip()
        
        vector_db_env = os.getenv("VECTOR_DB_PATH", "data/index")
        self.VECTOR_DB_PATH: Path = (
            Path(vector_db_env) if Path(vector_db_env).is_absolute() else BASE_DIR / vector_db_env
        )

        kb_env = os.getenv("KNOWLEDGE_BASE_PATH", "data/documents")
        self.KNOWLEDGE_BASE_PATH: Path = (
            Path(kb_env) if Path(kb_env).is_absolute() else BASE_DIR / kb_env
        )

        try:
            self.RETRIEVAL_THRESHOLD: float = float(os.getenv("RETRIEVAL_THRESHOLD", "0.45"))
        except ValueError:
            self.RETRIEVAL_THRESHOLD = 0.45

        try:
            self.TOP_K: int = int(os.getenv("TOP_K", "4"))
        except ValueError:
            self.TOP_K = 4

        origin_str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
        self.FRONTEND_ORIGINS: List[str] = [orig.strip() for orig in origin_str.split(",") if orig.strip()]

settings = Settings()
