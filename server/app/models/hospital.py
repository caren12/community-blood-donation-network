# Assigned to: Caren — Day 1 (Implement all 5 models)
from app.extensions import db


class Hospital(db.Model):
    __tablename__ = "hospitals"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(80), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    verified = db.Column(db.Boolean, default=False, nullable=False)

    # link back to the staff account that owns this hospital record
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # one Hospital -> many BloodRequest (one-to-many #1)
    requests = db.relationship("BloodRequest", backref="hospital", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "city": self.city,
            "phone": self.phone,
            "verified": self.verified,
            "owner_id": self.owner_id,
        }
