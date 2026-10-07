from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "The Eye"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./the_eye.db"

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
