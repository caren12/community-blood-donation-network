from flask import Flask
from app.config import Config
from app.extensions import db, jwt, bcrypt, cors, mail, socketio


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["FRONTEND_URL"]}})
    socketio.init_app(app, cors_allowed_origins=app.config["FRONTEND_URL"])

    # Registers the WebSocket 'connect' handler (see app/sockets.py)
    import app.sockets  # noqa: F401

    # Blueprints — each owned by whoever built that feature (see file headers)
    from app.routes.auth import auth_bp
    from app.routes.donors import donors_bp
    from app.routes.hospitals import hospitals_bp
    from app.routes.requests import requests_bp
    from app.routes.matches import matches_bp
    from app.routes.donations import donations_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(donors_bp, url_prefix="/api/donors")
    app.register_blueprint(hospitals_bp, url_prefix="/api/hospitals")
    app.register_blueprint(requests_bp, url_prefix="/api/requests")
    app.register_blueprint(matches_bp, url_prefix="/api/matches")
    app.register_blueprint(donations_bp, url_prefix="/api/donations")
    
    # admin.py defines routes like /donors/<id> so the final path matches spec: DELETE /api/donors/<id>
    app.register_blueprint(admin_bp, url_prefix="/api")

    @app.get("/api/health")
    def health():
        return {"status": "ok"}, 200

    return app