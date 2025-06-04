# backend/test_system.py - Corregido para SQLAlchemy 2.x
import requests
import json
import os
from datetime import datetime
from sqlalchemy import text  # ← Importar text

def test_database_connection():
    """Verificar conexión a la base de datos - CORREGIDO"""
    try:
        from app import create_app
        app = create_app()
        
        with app.app_context():
            from utils.db import db
            
            # ✅ Usar text() para SQLAlchemy 2.x
            with db.engine.connect() as connection:
                result = connection.execute(text('SELECT 1'))
                if result:
                    print("✅ Base de datos conectada")
                    return True
                else:
                    print("❌ No se pudo ejecutar query en la base de datos")
                    return False
                
    except Exception as e:
        print(f"❌ Error conectando a la base de datos: {str(e)}")
        return False

# ... resto del código igual ...
