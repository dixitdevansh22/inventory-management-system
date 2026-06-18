import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# .env file se environment variables load karo
load_dotenv()

# Database URL environment variable se aayega, hardcoded nahi
# Format: postgresql://username:password@host:port/database_name
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/inventory_db")

# Engine - yeh actual connection PostgreSQL ke saath banata hai
engine = create_engine(DATABASE_URL)

# SessionLocal - har request ke liye ek naya database session banayega
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base - saare models (tables) isse inherit karenge
Base = declarative_base()


# Dependency function - FastAPI isse use karega har route mein
# database session dene ke liye, aur request khatam hone par close karne ke liye
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
