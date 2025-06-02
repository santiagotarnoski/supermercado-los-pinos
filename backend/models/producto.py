from utils.db import db

class Producto(db.Model):
    __tablename__ = 'productos'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    descripcion = db.Column(db.String(255))
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    stock_minimo = db.Column(db.Integer, nullable=False)
    stock_actual = db.Column(db.Integer, nullable=False)
    fecha_vencimiento = db.Column(db.Date)
    categoria = db.Column(db.String(50))
    imagen_url = db.Column(db.Text)  # ✅ nuevo campo para imágenes

    def __init__(self, nombre, descripcion, precio, stock_minimo, stock_actual, fecha_vencimiento=None, categoria="Otros", imagen_url=None):
        self.nombre = nombre
        self.descripcion = descripcion
        self.precio = precio
        self.stock_minimo = stock_minimo
        self.stock_actual = stock_actual
        self.fecha_vencimiento = fecha_vencimiento
        self.categoria = categoria
        self.imagen_url = imagen_url  # ✅ constructor actualizado

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'precio': float(self.precio),
            'stock_minimo': self.stock_minimo,
            'stock_actual': self.stock_actual,
            'fecha_vencimiento': str(self.fecha_vencimiento) if self.fecha_vencimiento else None,
            'categoria': self.categoria,
            'imagen_url': self.imagen_url  # ✅ devolvemos la imagen
        }
