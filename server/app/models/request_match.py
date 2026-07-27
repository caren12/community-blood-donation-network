# Assigned to: Caren — Day 1 (Implement all 5 models)
from datetime import datetime
from app.extensions import db


class RequestMatch(db.Model):
    """Join table — User (donor) <-> BloodRequest, many-to-many."""
    __tablename__ = "request_matches"

    id = db.Column(db.Integer, primary_key=True)
    blood_request_id = db.Column(db.Integer, db.ForeignKey("blood_requests.id"), nullable=False)
    donor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    distance_km = db.Column(db.Float, nullable=True)
    response_status = db.Column(db.String(10), nullable=False, default="pending")  # pending | accepted | declined
    notified_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "blood_request_id": self.blood_request_id,
            "donor_id": self.donor_id,
            "distance_km": self.distance_km,
            "response_status": self.response_status,
            "notified_at": self.notified_at.isoformat() if self.notified_at else None,
        }
