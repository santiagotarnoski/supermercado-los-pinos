from utils.db import db
from sqlalchemy import Column, Integer, String

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = Column(Integer, primary_key=True)
    username = Column(String(100), unique=True, nullable=False)
    password = Column(String(200), nullable=False)
    rol = Column(String(50), default='cajero')

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "rol": self.rol
        }
