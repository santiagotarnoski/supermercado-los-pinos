from flask import Flask, send_from_directory
from routes.producto_routes import producto_bp
from routes.auth_routes import auth_bp
from routes.upload_routes import upload_bp  # ✅ nuevo
from utils.db import db, init_db
from utils.auth import jwt, init_bcrypt
from flask_cors import CORS
from config import Config  # ✅ nuevo

import os

app = Flask(__name__)
app.config.from_object(Config)  # ✅ config con UPLOAD_FOLDER

# Configuración detallada de CORS
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Inicializar extensiones
db.init_app(app)
jwt.init_app(app)
init_bcrypt(app)

# Registrar rutas
app.register_blueprint(producto_bp, url_prefix='/api/productos')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(upload_bp, url_prefix='/api')  # ✅ nuevo

# Servir imágenes desde carpeta /uploads
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Ruta raíz para verificar que el backend está activo
@app.route("/")
def index():
    return "✅ Backend del sistema de supermercado funcionando correctamente"

if __name__ == '__main__':
    with app.app_context():
        init_db()

        print("Rutas registradas en Flask:")
        for rule in app.url_map.iter_rules():
            print(rule)

    app.run(host='0.0.0.0', port=5000, debug=True)
