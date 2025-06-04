# backend/config.py - Versión con menos logs
import os
from datetime import timedelta

class Config:
    # ✅ Base de datos - PostgreSQL en desarrollo y producción
    if os.environ.get('DATABASE_URL'):
        # Producción - PostgreSQL desde Railway/Render
        database_url = os.environ.get('DATABASE_URL')
        # Fix para Railway que a veces usa postgres:// en lugar de postgresql://
        if database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        SQLALCHEMY_DATABASE_URI = database_url
    else:
        # Desarrollo - Tu PostgreSQL local
        SQLALCHEMY_DATABASE_URI = "postgresql://postgres:1234@localhost/supermercado"
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # ✅ REDUCIR LOGS - Solo mostrar SQL en modo debug explícito
    SQLALCHEMY_ECHO = os.environ.get('SQL_DEBUG', 'false').lower() == 'true'
    
    # Configuraciones adicionales para PostgreSQL en producción
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_recycle': 300,
        'pool_pre_ping': True,
        'pool_timeout': 20,
        'max_overflow': 0
    }
    
    # ✅ JWT y seguridad
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', "tu_clave_secreta")
    SECRET_KEY = os.environ.get('SECRET_KEY', 'clave-secreta-para-flask-sessions')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # ✅ Configuración para subir imágenes
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or os.path.join(BASE_DIR, 'uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB máximo
    
    # ✅ Configuración de entorno
    ENVIRONMENT = os.environ.get('ENVIRONMENT', 'development')
    DEBUG = os.environ.get('ENVIRONMENT', 'development') != 'production'
    
    @staticmethod
    def init_app(app):
        """Inicialización de la aplicación"""
        # Crear directorio de uploads si no existe
        upload_folder = app.config.get('UPLOAD_FOLDER')
        if upload_folder and not os.path.exists(upload_folder):
            try:
                os.makedirs(upload_folder)
                print(f"📁 Directorio {upload_folder} creado")
            except Exception as e:
                print(f"❌ Error creando directorio {upload_folder}: {e}")
        
        # Verificar configuración crítica en producción
        if app.config.get('ENVIRONMENT') == 'production':
            required_vars = ['JWT_SECRET_KEY', 'SECRET_KEY']
            missing = []
            
            for var in required_vars:
                if not os.environ.get(var):
                    missing.append(var)
            
            if missing:
                print(f"⚠️ Variables de entorno faltantes en producción: {', '.join(missing)}")

# Configuraciones específicas por entorno
class DevelopmentConfig(Config):
    """Configuración para desarrollo local"""
    DEBUG = True
    # ✅ Solo mostrar SQL si se solicita explícitamente
    SQLALCHEMY_ECHO = os.environ.get('SQL_DEBUG', 'false').lower() == 'true'

class ProductionConfig(Config):
    """Configuración para producción"""
    DEBUG = False
    SQLALCHEMY_ECHO = False  # ✅ Nunca mostrar SQL en producción
    
    @classmethod  
    def init_app(cls, app):
        Config.init_app(app)
        
        # Logs de producción
        import logging
        from logging.handlers import RotatingFileHandler
        
        if not app.debug and not app.testing:
            if not os.path.exists('logs'):
                os.mkdir('logs')
            
            file_handler = RotatingFileHandler('logs/supermercado.log', 
                                             maxBytes=10240, backupCount=10)
            file_handler.setFormatter(logging.Formatter(
                '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
            ))
            file_handler.setLevel(logging.INFO)
            app.logger.addHandler(file_handler)
            app.logger.setLevel(logging.INFO)
            app.logger.info('Sistema Supermercado iniciado')

class TestingConfig(Config):
    """Configuración para testing"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_ECHO = False

# Seleccionar configuración basada en variable de entorno
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

# Configuración activa
Config = config.get(os.environ.get('ENVIRONMENT', 'development'), DevelopmentConfig)
