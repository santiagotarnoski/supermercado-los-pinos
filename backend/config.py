import os

class Config:
    # Base de datos - usa variable de entorno o fallback local
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or "postgresql://postgres:1234@localhost/supermercado"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT - usa variable de entorno o fallback
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or "tu_clave_secreta_desarrollo"
    
    # ✅ Configuración para subir imágenes
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    
    # Configuración adicional para producción
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB máximo para uploads
