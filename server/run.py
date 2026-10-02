import uvicorn
from dotenv import load_dotenv

# Load .env before app.config reads environment variables at import time.
load_dotenv()

from app.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
