# Assigned to: Caren — Day 2 (Match respond endpoint)
#            & Victor — Day 2 (real-time notification layer)
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.request_match import RequestMatch
from app.models.blood_request import BloodRequest
from app.models.hospital import Hospital
from app.sockets import notify_hospital_of_response
from app.auth.decorators import get_current_user, role_required

matches_bp = Blueprint("matches", __name__)


@matches_bp.get("/mine")
@jwt_required()
@role_required("donor")
def my_matches():
    user = get_current_user()
    matches = RequestMatch.query.filter_by(donor_id=user.id).order_by(RequestMatch.notified_at.desc()).all()

    result = []
    for match in matches:
        blood_request = BloodRequest.query.get(match.blood_request_id)
        hospital = Hospital.query.get(blood_request.hospital_id) if blood_request else None
        result.append({
            **match.to_dict(),
            "blood_type": blood_request.blood_type if blood_request else None,
            "urgency_level": blood_request.urgency_level if blood_request else None,
            "hospital_name": hospital.name if hospital else None,
        })

    return jsonify(result), 200


@matches_bp.put("/<int:match_id>/respond")
@jwt_required()
@role_required("donor")
def respond_to_match(match_id):
    user = get_current_user()
    match = RequestMatch.query.get_or_404(match_id)

    if match.donor_id != user.id:
        return jsonify({"error": "This match does not belong to you"}), 403

    data = request.get_json() or {}
    response = data.get("response_status")
    if response not in ("accepted", "declined"):
        return jsonify({"error": "response_status must be 'accepted' or 'declined'"}), 400

    match.response_status = response
    db.session.commit()

    # Real-time push — hospital dashboard updates instantly when a donor responds.
    blood_request = BloodRequest.query.get(match.blood_request_id)
    hospital = Hospital.query.get(blood_request.hospital_id) if blood_request else None
    if hospital:
        notify_hospital_of_response(hospital.owner_id, {
            **match.to_dict(),
            "donor_name": user.name,
        })

    return jsonify(match.to_dict()), 200
