# Assigned to: Caren — Day 2 (Donor endpoints)
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.user import User
from app.auth.decorators import get_current_user

donors_bp = Blueprint("donors", __name__)


@donors_bp.get("/me")
@jwt_required()
def get_my_profile():
    user = get_current_user()
    if not user or user.role != "donor":
        return jsonify({"error": "Donor profile not found"}), 404
    return jsonify(user.to_dict()), 200


@donors_bp.put("/me")
@jwt_required()
def update_my_profile():
    user = get_current_user()
    if not user or user.role != "donor":
        return jsonify({"error": "Donor profile not found"}), 404

    data = request.get_json() or {}
    for field in ("blood_type", "city"):
        if field in data:
            setattr(user, field, data[field])
    if "is_available" in data:
        user.is_available = bool(data["is_available"])

    db.session.commit()
    return jsonify(user.to_dict()), 200


@donors_bp.get("")
@jwt_required()
def search_donors():
    user = get_current_user()
    blood_type = request.args.get("blood_type")
    city = request.args.get("city")

    query = User.query.filter_by(role="donor")

    # Admins can see every donor account, including unavailable ones.
    # Everyone else (hospital staff searching for donors) only sees available donors.
    if not user or user.role != "admin":
        query = query.filter_by(is_available=True)

    if blood_type:
        query = query.filter_by(blood_type=blood_type)
    if city:
        query = query.filter_by(city=city)

    donors = query.all()
    return jsonify([d.to_dict() for d in donors]), 200
