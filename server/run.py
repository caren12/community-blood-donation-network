# Assigned to: Ian — Day 1 (Flask app + PostgreSQL + SQLAlchemy setup)
#            & Victor — Day 2 (real-time notification layer — socketio.run instead of app.run)
import os

if __name__ == "__main__":
    import eventlet
    eventlet.monkey_patch()

from dotenv import load_dotenv
load_dotenv()

from app import create_app
from app.extensions import db, socketio
app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    port = int(os.environ.get("PORT", 5000))
    # socketio.run wraps app.run so both REST endpoints and WebSocket events work together
    socketio.run(app, host="0.0.0.0", port=port, debug=True)
