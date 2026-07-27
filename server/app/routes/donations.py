# Assigned to: Caren — Day 3 (Donation logging + history endpoints)
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.donation import Donation
from app.models.blood_request import BloodRequest
from app.auth.decorators import get_current_user, role_required

donations_bp = Blueprint("donations", __name__)


@donations_bp.post("")
@jwt_required()
@role_required("donor")
def log_donation():
    user = get_current_user()
    data = request.get_json() or {}

    required = ["units_donated", "location"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": f"Missing required fields: {required}"}), 400

    blood_request_id = data.get("blood_request_id")
    if blood_request_id:
        blood_request = BloodRequest.query.get(blood_request_id)
        if not blood_request:
            return jsonify({"error": "blood_request_id does not exist"}), 400

    donation = Donation(
        donor_id=user.id,
        blood_request_id=blood_request_id,
        units_donated=data["units_donated"],
        location=data["location"],
    )
    db.session.add(donation)

    # If this donation fulfilled a request, mark it fulfilled.
    if blood_request_id:
        blood_request = BloodRequest.query.get(blood_request_id)
        blood_request.status = "fulfilled"

    db.session.commit()
    return jsonify(donation.to_dict()), 201


@donations_bp.get("/me")
@jwt_required()
@role_required("donor")
def my_donation_history():
    user = get_current_user()
    donations = Donation.query.filter_by(donor_id=user.id).order_by(Donation.donation_date.desc()).all()
    return jsonify([d.to_dict() for d in donations]), 200
