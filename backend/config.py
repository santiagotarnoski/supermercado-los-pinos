import os

class Config:
    SQLALCHEMY_DATABASE_URI = "postgresql://postgres:1234@localhost/supermercado"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "tu_clave_secreta"

    # ✅ Configuración para subir imágenes
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
