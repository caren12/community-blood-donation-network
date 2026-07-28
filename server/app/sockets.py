# Assigned to: Victor — Day 2 (Matching algorithm + match endpoint — WebSocket notification layer)
#
# Real-time notification channel. When the matching algorithm creates a RequestMatch,
# it calls notify_donor_of_match() below instead of just logging a TODO — the donor's
# browser receives a live "new_match" event with no page refresh required.
#
# Client connects with:  io(SOCKET_URL, { auth: { token: <jwt_access_token> } })
# and is placed into a private room "user_<id>" (works for any role — donor or
# hospital staff), so notifications only ever reach the account they belong to.

from flask_jwt_extended import decode_token
from flask_socketio import join_room, disconnect
from app.extensions import socketio


@socketio.on("connect")
def handle_connect(auth):
    token = (auth or {}).get("token")
    if not token:
        disconnect()
        return False
    try:
        decoded = decode_token(token)
        user_id = decoded["sub"]
    except Exception:
        disconnect()
        return False
    join_room(f"user_{user_id}")


def notify_donor_of_match(donor_id, match_payload):
    """Call this right after creating a RequestMatch row."""
    socketio.emit("new_match", match_payload, room=f"user_{donor_id}")


def notify_hospital_of_response(hospital_owner_id, match_payload):
    """Call this when a donor accepts/declines, so the hospital dashboard updates live too."""
    socketio.emit("match_response", match_payload, room=f"user_{hospital_owner_id}")
