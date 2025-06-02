from flask import Blueprint, request, jsonify
from utils.auth import bcrypt
from flask_jwt_extended import create_access_token
from models.usuario import Usuario
from utils.db import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data['username']
    password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    # ❌ Bloquear registros como admin desde cualquier fuente
    if data.get('rol') == 'admin':
        return jsonify({"error": "No podés registrarte como admin"}), 403

    # ✅ Si no se especifica rol, se asigna 'cajero' por defecto
    rol = data.get('rol', 'cajero')

    if Usuario.query.filter_by(username=username).first():
        return jsonify({"error": "Usuario ya existe"}), 400

    nuevo = Usuario(username=username, password=password, rol=rol)
    db.session.add(nuevo)
    db.session.commit()
    return jsonify({"mensaje": "Usuario creado", "usuario": nuevo.to_dict()}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']

    usuario = Usuario.query.filter_by(username=username).first()

    print("🟡 Username recibido:", username)
    print("🟡 Password recibido:", password)
    if usuario:
        print("🟢 Usuario encontrado:", usuario.username)
        print("🔐 Hash guardado:", usuario.password)
        print("✅ ¿Password coincide?:", bcrypt.check_password_hash(usuario.password, password))
    else:
        print("🔴 Usuario no encontrado")

    if not usuario or not bcrypt.check_password_hash(usuario.password, password):
        return jsonify({"error": "Credenciales incorrectas"}), 401

    token = create_access_token(identity=str(usuario.id))
    return jsonify({"access_token": token, "rol": usuario.rol})
