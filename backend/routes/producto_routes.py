# backend/routes/producto_routes.py - Versión corregida
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models.producto import Producto
from utils.db import db
import os
import uuid
from datetime import datetime

producto_bp = Blueprint('productos', __name__)

# Extensiones permitidas para imágenes
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_image(file):
    """Guarda una imagen y retorna la URL"""
    if file and allowed_file(file.filename):
        # Generar nombre único para evitar conflictos
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        # Retornar URL relativa
        return f"/uploads/{unique_filename}"
    return None

@producto_bp.route('/', methods=['GET'])
def get_productos():
    """Obtener todos los productos con filtros opcionales - CORREGIDO"""
    try:
        # Parámetros de consulta
        categoria = request.args.get('categoria')
        busqueda = request.args.get('busqueda')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        print(f"🔍 GET /productos - página: {page}, por_página: {per_page}")
        print(f"📊 Filtros - categoría: {categoria}, búsqueda: {busqueda}")
        
        # Construir consulta
        query = Producto.query
        
        if categoria and categoria != 'todos':
            query = query.filter(Producto.categoria == categoria)
            print(f"🏷️ Filtrando por categoría: {categoria}")
        
        if busqueda:
            query = query.filter(
                Producto.nombre.contains(busqueda) | 
                Producto.descripcion.contains(busqueda)
            )
            print(f"🔍 Filtrando por búsqueda: {busqueda}")
        
        # Contar total antes de paginación
        total_productos = query.count()
        print(f"📈 Total de productos encontrados: {total_productos}")
        
        # Aplicar paginación
        productos_paginados = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        print(f"📄 Productos en esta página: {len(productos_paginados.items)}")
        
        # Obtener categorías únicas para filtros
        categorias_query = db.session.query(Producto.categoria).distinct()
        categorias = [cat[0] for cat in categorias_query.all() if cat[0]]
        
        print(f"🏷️ Categorías encontradas: {categorias}")
        
        # Convertir productos a diccionarios
        productos_dict = []
        for producto in productos_paginados.items:
            producto_dict = producto.to_dict()
            productos_dict.append(producto_dict)
            print(f"📦 Producto: {producto_dict['nombre']} - {producto_dict['categoria']}")
        
        # ✅ DEVOLVER ESTRUCTURA CORRECTA
        response_data = {
            'productos': productos_dict,
            'total': productos_paginados.total,
            'pages': productos_paginados.pages,
            'current_page': page,
            'per_page': per_page,
            'categorias': categorias
        }
        
        print(f"✅ Devolviendo {len(productos_dict)} productos en la respuesta")
        return jsonify(response_data)
        
    except Exception as e:
        print(f"❌ Error en get_productos: {str(e)}")
        return jsonify({
            'error': str(e),
            'productos': [],
            'categorias': [],
            'total': 0,
            'pages': 0,
            'current_page': 1
        }), 500

@producto_bp.route('/', methods=['POST'])
@jwt_required()
def create_producto():
    """Crear nuevo producto con imagen opcional"""
    try:
        # Datos del formulario
        data = request.form.to_dict()
        print(f"📝 Creando producto: {data.get('nombre')}")
        
        # Validaciones básicas
        if not data.get('nombre') or not data.get('precio'):
            return jsonify({'error': 'Nombre y precio son requeridos'}), 400
        
        # Manejar imagen si está presente
        imagen_url = None
        if 'imagen' in request.files:
            file = request.files['imagen']
            if file.filename != '':
                imagen_url = save_image(file)
                if not imagen_url:
                    return jsonify({'error': 'Formato de imagen no válido'}), 400
        
        # Crear producto
        nuevo_producto = Producto(
            nombre=data['nombre'],
            descripcion=data.get('descripcion', ''),
            precio=float(data['precio']),
            stock_minimo=int(data.get('stock_minimo', 0)),
            stock_actual=int(data.get('stock_actual', 0)),
            categoria=data.get('categoria', 'general'),
            imagen_url=imagen_url,
            fecha_vencimiento=datetime.strptime(data['fecha_vencimiento'], '%Y-%m-%d').date() 
                             if data.get('fecha_vencimiento') else None
        )
        
        db.session.add(nuevo_producto)
        db.session.commit()
        
        print(f"✅ Producto creado: {nuevo_producto.nombre}")
        
        return jsonify({
            'message': 'Producto creado exitosamente',
            'producto': nuevo_producto.to_dict()
        }), 201
        
    except Exception as e:
        print(f"❌ Error creando producto: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@producto_bp.route('/<int:producto_id>', methods=['PUT'])
@jwt_required()
def update_producto(producto_id):
    """Actualizar producto existente"""
    try:
        producto = Producto.query.get_or_404(producto_id)
        data = request.form.to_dict()
        
        print(f"📝 Actualizando producto ID {producto_id}: {producto.nombre}")
        
        # Actualizar campos
        if 'nombre' in data:
            producto.nombre = data['nombre']
        if 'descripcion' in data:
            producto.descripcion = data['descripcion']
        if 'precio' in data:
            producto.precio = float(data['precio'])
        if 'stock_minimo' in data:
            producto.stock_minimo = int(data['stock_minimo'])
        if 'stock_actual' in data:
            producto.stock_actual = int(data['stock_actual'])
        if 'categoria' in data:
            producto.categoria = data['categoria']
        if 'fecha_vencimiento' in data and data['fecha_vencimiento']:
            producto.fecha_vencimiento = datetime.strptime(data['fecha_vencimiento'], '%Y-%m-%d').date()
        
        # Manejar imagen nueva
        if 'imagen' in request.files:
            file = request.files['imagen']
            if file.filename != '':
                # Eliminar imagen anterior si existe
                if producto.imagen_url:
                    old_file = producto.imagen_url.split('/')[-1]
                    old_path = os.path.join(current_app.config['UPLOAD_FOLDER'], old_file)
                    if os.path.exists(old_path):
                        os.remove(old_path)
                
                # Guardar nueva imagen
                nueva_imagen_url = save_image(file)
                if nueva_imagen_url:
                    producto.imagen_url = nueva_imagen_url
                else:
                    return jsonify({'error': 'Formato de imagen no válido'}), 400
        
        producto.fecha_actualizacion = datetime.utcnow()
        db.session.commit()
        
        print(f"✅ Producto actualizado: {producto.nombre}")
        
        return jsonify({
            'message': 'Producto actualizado exitosamente',
            'producto': producto.to_dict()
        })
        
    except Exception as e:
        print(f"❌ Error actualizando producto: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@producto_bp.route('/<int:producto_id>', methods=['DELETE'])
@jwt_required()
def delete_producto(producto_id):
    """Eliminar producto"""
    try:
        producto = Producto.query.get_or_404(producto_id)
        nombre_producto = producto.nombre
        
        print(f"🗑️ Eliminando producto ID {producto_id}: {nombre_producto}")
        
        # Eliminar imagen del disco si existe
        if producto.imagen_url:
            filename = producto.imagen_url.split('/')[-1]
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            if os.path.exists(filepath):
                os.remove(filepath)
        
        db.session.delete(producto)
        db.session.commit()
        
        print(f"✅ Producto eliminado: {nombre_producto}")
        
        return jsonify({'message': 'Producto eliminado exitosamente'})
        
    except Exception as e:
        print(f"❌ Error eliminando producto: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@producto_bp.route('/<int:producto_id>', methods=['GET'])
def get_producto(producto_id):
    """Obtener un producto específico"""
    try:
        producto = Producto.query.get_or_404(producto_id)
        print(f"📦 Obteniendo producto ID {producto_id}: {producto.nombre}")
        return jsonify(producto.to_dict())
    except Exception as e:
        print(f"❌ Error obteniendo producto: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ✅ RUTA ADICIONAL PARA DEBUGGING
@producto_bp.route('/debug', methods=['GET'])
def debug_productos():
    """Ruta de debugging para ver todos los productos sin paginación"""
    try:
        productos = Producto.query.all()
        productos_dict = [producto.to_dict() for producto in productos]
        
        return jsonify({
            'total_en_db': len(productos_dict),
            'productos': productos_dict,
            'categorias': list(set([p.categoria for p in productos if p.categoria]))
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
