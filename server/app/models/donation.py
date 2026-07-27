# Assigned to: Caren — Day 1 (Implement all 5 models)
from datetime import datetime
from app.extensions import db


class Donation(db.Model):
    __tablename__ = "donations"

    id = db.Column(db.Integer, primary_key=True)
    donor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    blood_request_id = db.Column(db.Integer, db.ForeignKey("blood_requests.id"), nullable=True)
    units_donated = db.Column(db.Integer, nullable=False, default=1)
    location = db.Column(db.String(150), nullable=False)
    donation_date = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "donor_id": self.donor_id,
            "blood_request_id": self.blood_request_id,
            "units_donated": self.units_donated,
            "location": self.location,
            "donation_date": self.donation_date.isoformat() if self.donation_date else None,
        }
