# Assigned to: Ian — Day 1 (Flask app + PostgreSQL + SQLAlchemy setup)
# Assigned to: Victor — Day 2 (Matching algorithm — real-time notification layer)
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_mail import Mail
from flask_socketio import SocketIO

db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()
cors = CORS()
mail = Mail()
socketio = SocketIO(cors_allowed_origins="*")
