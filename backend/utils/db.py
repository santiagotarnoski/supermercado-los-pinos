from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db():
    from models.producto import Producto
    db.create_all()
