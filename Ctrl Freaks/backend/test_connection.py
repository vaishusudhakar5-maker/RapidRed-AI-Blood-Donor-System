from app.database.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        print("✅ Connected Successfully!")
        print(result.fetchone())

except Exception as e:
    print("❌ Connection Failed")
    print(e)