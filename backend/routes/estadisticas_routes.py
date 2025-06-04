# backend/routes/estadisticas_routes.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.db import db  # ✅ Corregido: db está en utils
from models.producto import Producto  # ✅ Corregido: Producto está en models/producto
from datetime import datetime, date
from sqlalchemy import func

estadisticas_bp = Blueprint('estadisticas', __name__)

@estadisticas_bp.route('/api/estadisticas/ventas-hoy', methods=['GET'])
@jwt_required()
def ventas_hoy():
    """Obtener total de ventas del día actual - Por ahora retorna 0"""
    try:
        # Por ahora retornamos 0 hasta implementar la tabla de ventas
        return jsonify({
            'total': 0.0,
            'fecha': date.today().isoformat(),
            'mensaje': 'Sistema de ventas en desarrollo'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@estadisticas_bp.route('/api/estadisticas/productos', methods=['GET'])
@jwt_required()
def total_productos():
    """Obtener total de productos en inventario"""
    try:
        total = db.session.query(func.count(Producto.id)).scalar()
        
        return jsonify({
            'total': total or 0
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@estadisticas_bp.route('/api/estadisticas/stock-bajo', methods=['GET'])
@jwt_required()
def stock_bajo():
    """Obtener cantidad de productos con stock bajo (menos de 10 unidades)"""
    try:
        # Definir umbral de stock bajo
        umbral_stock_bajo = 10
        
        total = db.session.query(func.count(Producto.id)).filter(
            Producto.stock < umbral_stock_bajo
        ).scalar()
        
        # También obtener la lista de productos con stock bajo
        productos_stock_bajo = db.session.query(Producto).filter(
            Producto.stock < umbral_stock_bajo
        ).all()
        
        productos_lista = [{
            'id': p.id,
            'nombre': p.nombre,
            'stock': p.stock
        } for p in productos_stock_bajo]
        
        return jsonify({
            'total': total or 0,
            'umbral': umbral_stock_bajo,
            'productos': productos_lista
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@estadisticas_bp.route('/api/estadisticas/clientes', methods=['GET'])
@jwt_required()
def total_clientes():
    """Obtener total de clientes registrados - Por ahora retorna 0"""
    try:
        # Por ahora retornamos 0 hasta implementar la tabla de clientes
        return jsonify({
            'total': 0,
            'mensaje': 'Sistema de clientes en desarrollo'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@estadisticas_bp.route('/api/estadisticas/resumen', methods=['GET'])
@jwt_required()
def resumen_completo():
    """Obtener todas las estadísticas en una sola consulta"""
    try:
        umbral_stock_bajo = 10
        
        # Total productos
        total_productos = db.session.query(func.count(Producto.id)).scalar() or 0
        
        # Stock bajo
        stock_bajo = db.session.query(func.count(Producto.id)).filter(
            Producto.stock < umbral_stock_bajo
        ).scalar() or 0
        
        return jsonify({
            'ventas_hoy': 0.0,  # Temporal
            'total_productos': total_productos,
            'stock_bajo': stock_bajo,
            'total_clientes': 0,  # Temporal
            'fecha_actualizacion': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
