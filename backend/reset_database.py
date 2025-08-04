"""
Database reset script for development.
Drops all tables and recreates them with the current schema.
"""

from sqlalchemy import text
from database_study import engine
from models_study import Base

def reset_database():
    """Drop all tables and recreate them."""
    print("🔄 Resetting database...")
    
    # Drop all tables
    with engine.connect() as conn:
        # Disable foreign key checks temporarily
        conn.execute(text("DROP SCHEMA IF EXISTS public CASCADE"))
        conn.execute(text("CREATE SCHEMA public"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO postgres"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO public"))
        conn.commit()
    
    print("✅ Dropped all tables")
    
    # Recreate all tables
    Base.metadata.create_all(bind=engine)
    print("✅ Recreated all tables with current schema")
    
    print("🎉 Database reset complete!")

if __name__ == "__main__":
    reset_database() 