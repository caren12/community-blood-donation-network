# Assigned to: Caren — Day 2 (BloodRequest CRUD endpoints)
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.blood_request import BloodRequest
from app.models.hospital import Hospital
from app.models.user import User
from app.models.request_match import RequestMatch
from app.services.matching import find_compatible_donors, rank_by_distance
from app.sockets import notify_donor_of_match
from app.auth.decorators import get_current_user, role_required

requests_bp = Blueprint("requests", __name__)


@requests_bp.post("")
@jwt_required()
@role_required("hospital_staff")
def create_request():
    user = get_current_user()
    hospital = Hospital.query.filter_by(owner_id=user.id).first()
    if not hospital:
        return jsonify({"error": "No hospital profile found for this account"}), 404
    if not hospital.verified:
        return jsonify({"error": "Hospital is not yet verified by an admin"}), 403

    data = request.get_json() or {}
    required = ["blood_type", "units_needed"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": f"Missing required fields: {required}"}), 400

    blood_request = BloodRequest(
        hospital_id=hospital.id,
        blood_type=data["blood_type"],
        units_needed=data["units_needed"],
        urgency_level=data.get("urgency_level", "medium"),
        status="open",
    )
    db.session.add(blood_request)
    db.session.commit()
    return jsonify(blood_request.to_dict()), 201


@requests_bp.get("")
@jwt_required()
def list_requests():
    user = get_current_user()

    if user.role == "hospital_staff":
        hospital = Hospital.query.filter_by(owner_id=user.id).first()
        if not hospital:
            return jsonify([]), 200
        reqs = BloodRequest.query.filter_by(hospital_id=hospital.id).all()
    elif user.role == "admin":
        reqs = BloodRequest.query.all()
    else:  # donor — see open requests compatible with their profile
        reqs = BloodRequest.query.filter_by(status="open").all()

    return jsonify([r.to_dict() for r in reqs]), 200


@requests_bp.get("/<int:request_id>")
@jwt_required()
def get_request(request_id):
    blood_request = BloodRequest.query.get_or_404(request_id)
    return jsonify(blood_request.to_dict()), 200


@requests_bp.put("/<int:request_id>")
@jwt_required()
@role_required("hospital_staff", "admin")
def update_request(request_id):
    blood_request = BloodRequest.query.get_or_404(request_id)
    data = request.get_json() or {}
    if "status" in data:
        blood_request.status = data["status"]
    if "units_needed" in data:
        blood_request.units_needed = data["units_needed"]
    if "urgency_level" in data:
        blood_request.urgency_level = data["urgency_level"]
    db.session.commit()
    return jsonify(blood_request.to_dict()), 200


@requests_bp.delete("/<int:request_id>")
@jwt_required()
@role_required("hospital_staff", "admin")
def cancel_request(request_id):
    blood_request = BloodRequest.query.get_or_404(request_id)
    db.session.delete(blood_request)
    db.session.commit()
    return jsonify({"message": "Request cancelled"}), 200


# Assigned to: Victor — Day 2 (Matching algorithm + match endpoint)
@requests_bp.post("/<int:request_id>/match")
@jwt_required()
@role_required("hospital_staff", "admin")
def run_matching(request_id):
    blood_request = BloodRequest.query.get_or_404(request_id)
    hospital = Hospital.query.get(blood_request.hospital_id)

    compatible_donors = find_compatible_donors(blood_request.blood_type, hospital.city, User)
    ranked = rank_by_distance(compatible_donors)

    created_matches = []
    for donor, distance_km in ranked:
        existing = RequestMatch.query.filter_by(
            blood_request_id=blood_request.id, donor_id=donor.id
        ).first()
        if existing:
            continue
        match = RequestMatch(
            blood_request_id=blood_request.id,
            donor_id=donor.id,
            distance_km=distance_km,
            response_status="pending",
        )
        db.session.add(match)
        created_matches.append(match)

    db.session.commit()

    # Real-time push — donor sees the new match instantly, no refresh needed.
    for match in created_matches:
        notify_donor_of_match(match.donor_id, {
            **match.to_dict(),
            "blood_type": blood_request.blood_type,
            "urgency_level": blood_request.urgency_level,
            "hospital_name": hospital.name,
        })

    return jsonify({
        "request_id": blood_request.id,
        "matches_created": len(created_matches),
        "matches": [m.to_dict() for m in created_matches],
    }), 201
