# backend/app.py - Versión corregida para SQLAlchemy 2.x
import os
import datetime
from flask import Flask, send_from_directory, jsonify
from routes.producto_routes import producto_bp
from routes.auth_routes import auth_bp
from routes.upload_routes import upload_bp
from routes.estadisticas_routes import estadisticas_bp
from utils.db import db, init_db
from utils.auth import jwt, init_bcrypt
from flask_cors import CORS
from config import Config
from sqlalchemy import text  # ← Importar text para SQLAlchemy 2.x

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configuración CORS para desarrollo y producción - ✅ CORREGIDA
    allowed_origins = [
        "http://localhost:5173",  # Desarrollo
        "http://localhost:3000",  # Desarrollo alternativo
        "http://localhost:4173",  # Vite preview
        "https://supermercado-los-pinos.onrender.com",  # ← AGREGADO: Frontend de Render
        os.environ.get('FRONTEND_URL', 'http://localhost:5173')  # Producción
    ]
    
    # Si hay múltiples URLs de frontend en producción, sepáralas por comas
    frontend_url = os.environ.get('FRONTEND_URL', '')
    if ',' in frontend_url:
        production_urls = [url.strip() for url in frontend_url.split(',')]
        allowed_origins.extend(production_urls)
    elif frontend_url and frontend_url not in allowed_origins:
        allowed_origins.append(frontend_url)
    
    # ✅ CORS más permisivo para solucionar problemas de conexión
    CORS(app, 
         resources={r"/api/*": {"origins": allowed_origins}}, 
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    
    # Inicializar extensiones
    db.init_app(app)
    jwt.init_app(app)
    init_bcrypt(app)
    
    # Registrar rutas
    app.register_blueprint(producto_bp, url_prefix='/api/productos')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(upload_bp, url_prefix='/api')
    app.register_blueprint(estadisticas_bp)  # Ya tiene /api/estadisticas
    
    # Servir imágenes desde carpeta /uploads
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    # Ruta raíz para verificar que el backend está activo
    @app.route("/")
    def index():
        return {
            "status": "success",
            "message": "✅ Backend del sistema de supermercado funcionando correctamente",
            "version": "1.0.0",
            "environment": os.environ.get('ENVIRONMENT', 'development'),
            "endpoints": {
                "health": "/api/health",
                "auth": "/api/auth/",
                "productos": "/api/productos/",
                "estadisticas": "/api/estadisticas/",
                "uploads": "/api/upload/"
            }
        }
    
    # Ruta de health check para monitoreo - ✅ CORREGIDA
    @app.route("/api/health")
    def health_check():
        try:
            # ✅ Usar text() para SQLAlchemy 2.x
            with db.engine.connect() as connection:
                result = connection.execute(text('SELECT 1'))
                db_status = "connected"
        except Exception as e:
            db_status = f"error: {str(e)}"
        
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "database": db_status,
            "upload_folder": os.path.exists(app.config['UPLOAD_FOLDER']),
            "environment": os.environ.get('ENVIRONMENT', 'development')
        })
    
    # Inicializar base de datos en el contexto de la app
    with app.app_context():
        init_db()
        
        # Debug: mostrar rutas registradas solo en desarrollo
        if os.environ.get('ENVIRONMENT') != 'production':
            print("Rutas registradas en Flask:")
            for rule in app.url_map.iter_rules():
                print(f"  {rule.rule} -> {rule.endpoint}")
    
    return app

# Crear la aplicación (necesario para Railway/Render)
app = create_app()

if __name__ == '__main__':
    # Puerto para desarrollo local o variable de entorno para producción
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('ENVIRONMENT', 'development') != 'production'
    
    app.run(
        host='0.0.0.0', 
        port=port, 
        debug=debug_mode
    )
