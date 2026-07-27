# Assigned to: Caren — Day 1 (Implement all 5 models)
from datetime import datetime
from app.extensions import db


class BloodRequest(db.Model):
    __tablename__ = "blood_requests"

    id = db.Column(db.Integer, primary_key=True)
    hospital_id = db.Column(db.Integer, db.ForeignKey("hospitals.id"), nullable=False)
    blood_type = db.Column(db.String(5), nullable=False)
    units_needed = db.Column(db.Integer, nullable=False)
    urgency_level = db.Column(db.String(10), nullable=False, default="medium")  # low | medium | critical
    status = db.Column(db.String(10), nullable=False, default="open")  # open | fulfilled | expired
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    matches = db.relationship("RequestMatch", backref="blood_request", lazy=True)
    donations = db.relationship("Donation", backref="blood_request", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "hospital_id": self.hospital_id,
            "blood_type": self.blood_type,
            "units_needed": self.units_needed,
            "urgency_level": self.urgency_level,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
