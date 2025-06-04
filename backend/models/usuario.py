# backend/utils/db.py
from flask_sqlalchemy import SQLAlchemy
import os

# Instancia global de SQLAlchemy
db = SQLAlchemy()

def init_db():
    """Inicializar base de datos y crear tablas"""
    try:
        # Crear todas las tablas
        db.create_all()
        
        # Crear usuario admin por defecto si no existe
        from models.usuario import Usuario
        from werkzeug.security import generate_password_hash
        
        admin_user = Usuario.query.filter_by(username='admin').first()
        if not admin_user:
            admin_user = Usuario(
                username='admin',
                password=generate_password_hash('admin123'),  # ← CAMBIADO: password en lugar de password_hash
                rol='admin'
            )
            db.session.add(admin_user)
            db.session.commit()
            print("✅ Usuario admin creado: admin/admin123")
        else:
            print("✅ Usuario admin ya existe")
            
        # Crear directorio de uploads si no existe
        upload_folder = os.environ.get('UPLOAD_FOLDER', 'uploads')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
            print(f"✅ Directorio {upload_folder} creado")
            
        print("✅ Base de datos inicializada correctamente")
        
    except Exception as e:
        print(f"❌ Error inicializando base de datos: {str(e)}")
        db.session.rollback()
