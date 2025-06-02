from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
bcrypt = Bcrypt()

def init_bcrypt(app):
    bcrypt.init_app(app)

jwt = JWTManager()

def init_app(app):
    jwt.init_app(app)

