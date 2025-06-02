from flask import Blueprint, request, jsonify
from models.producto import Producto
from utils.db import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.usuario import Usuario

producto_bp = Blueprint('producto_bp', __name__)

# Obtener todos los productos
@producto_bp.route('/', methods=['GET'])
def get_productos():
    productos = Producto.query.all()
    result = []
    for p in productos:
        result.append({
            'id': p.id,
            'nombre': p.nombre,
            'descripcion': p.descripcion,
            'precio': float(p.precio),
            'stock_minimo': p.stock_minimo,
            'stock_actual': p.stock_actual,
            'fecha_vencimiento': str(p.fecha_vencimiento) if p.fecha_vencimiento else None,
            'categoria': p.categoria  # ✅ AGREGADO
        })
    return jsonify(result), 200

# Crear un nuevo producto (solo admin)
@producto_bp.route('', methods=['POST'])
@jwt_required()
def crear_producto():
    print("➡️ Entrando a crear_producto()")

    user_id = get_jwt_identity()
    usuario = Usuario.query.get(user_id)

    if usuario.rol != 'admin':
        return jsonify({"error": "Solo administradores pueden crear productos"}), 403

    data = request.json

    nuevo = Producto(
        nombre=data['nombre'],
        descripcion=data.get('descripcion', ''),
        precio=data['precio'],
        stock_minimo=data['stock_minimo'],
        stock_actual=data['stock_actual'],
        fecha_vencimiento=data.get('fecha_vencimiento'),
        categoria=data.get('categoria', 'Otros')  # ✅ AGREGADO
    )

    db.session.add(nuevo)
    db.session.commit()
    return jsonify({"mensaje": "Producto creado", "producto": nuevo.to_dict()}), 201

# Obtener producto por ID
@producto_bp.route('/<int:id>', methods=['GET'])
def get_producto(id):
    producto = Producto.query.get_or_404(id)
    return jsonify({
        'id': producto.id,
        'nombre': producto.nombre,
        'descripcion': producto.descripcion,
        'precio': float(producto.precio),
        'stock_minimo': producto.stock_minimo,
        'stock_actual': producto.stock_actual,
        'fecha_vencimiento': str(producto.fecha_vencimiento) if producto.fecha_vencimiento else None,
        'categoria': producto.categoria  # ✅ AGREGADO
    }), 200

# Actualizar producto (solo admin)
@producto_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_producto(id):
    user_id = get_jwt_identity()
    usuario = Usuario.query.get(user_id)
    if usuario.rol != 'admin':
        return jsonify({"error": "Solo administradores pueden actualizar productos"}), 403

    producto = Producto.query.get_or_404(id)
    data = request.json
    producto.nombre = data['nombre']
    producto.descripcion = data.get('descripcion', '')
    producto.precio = data['precio']
    producto.stock_minimo = data['stock_minimo']
    producto.stock_actual = data['stock_actual']
    producto.fecha_vencimiento = data.get('fecha_vencimiento')
    producto.categoria = data.get('categoria', 'Otros')  # ✅ AGREGADO
    db.session.commit()
    return jsonify({'message': 'Producto actualizado'}), 200

# Eliminar producto (solo admin)
@producto_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_producto(id):
    user_id = get_jwt_identity()
    usuario = Usuario.query.get(user_id)
    if usuario.rol != 'admin':
        return jsonify({"error": "Solo administradores pueden eliminar productos"}), 403

    producto = Producto.query.get_or_404(id)
    db.session.delete(producto)
    db.session.commit()
    return jsonify({'message': 'Producto eliminado'}), 200
