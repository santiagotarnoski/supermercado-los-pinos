from utils.db import db
from app import app  # Cambiado de "from backend.app" a "from app"

with app.app_context():
    db.drop_all()
    db.create_all()
    print("📦 Base de datos reseteada y tablas creadas correctamente.")
