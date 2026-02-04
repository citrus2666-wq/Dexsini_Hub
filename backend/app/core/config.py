from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Dexsini Hub"
    API_V1_STR: str = "/api/v1"
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "Postgres"
    POSTGRES_DB: str = "dexsini_hub"
    DATABASE_URI: Optional[str] = None
    
    # Auth
    SECRET_KEY: str = "CHANGE_THIS_TO_A_SECURE_SECRET_KEY" # TODO: Generate secrets
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **values):
        super().__init__(**values)
        if not self.DATABASE_URI:
            import os
            # Render provides DATABASE_URL
            db_url = os.getenv("DATABASE_URL")
            if db_url:
                # SQLAlchemy requires postgresql:// instead of postgres://
                if db_url.startswith("postgres://"):
                    db_url = db_url.replace("postgres://", "postgresql://", 1)
                self.DATABASE_URI = db_url
            else:
                self.DATABASE_URI = f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

settings = Settings()
