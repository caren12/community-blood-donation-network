# Assigned to: Victor — Day 2 (Hospital verification endpoints)
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.hospital import Hospital
from app.services.hospital_verification import auto_verify_hospital
from app.auth.decorators import role_required

hospitals_bp = Blueprint("hospitals", __name__)


@hospitals_bp.get("")
@jwt_required()
@role_required("admin")
def list_hospitals():
    verified_param = request.args.get("verified")
    query = Hospital.query
    if verified_param is not None:
        is_verified = verified_param.lower() == "true"
        query = query.filter_by(verified=is_verified)
    hospitals = query.all()
    return jsonify([h.to_dict() for h in hospitals]), 200


@hospitals_bp.put("/<int:hospital_id>/verify")
@jwt_required()
@role_required("admin")
def verify_hospital(hospital_id):
    hospital = Hospital.query.get_or_404(hospital_id)
    hospital.verified = True
    db.session.commit()
    return jsonify(hospital.to_dict()), 200


@hospitals_bp.post("/<int:hospital_id>/auto-verify")
@jwt_required()
@role_required("admin")
def recheck_auto_verify(hospital_id):
    """Manually re-trigger the KMHFR registry check — useful if it failed at signup
    (e.g. due to a name typo or a transient network error) and an admin wants to retry
    before falling back to manual approval."""
    hospital = Hospital.query.get_or_404(hospital_id)
    if auto_verify_hospital(hospital.name, hospital.city):
        hospital.verified = True
        db.session.commit()
        return jsonify({"verified": True, "hospital": hospital.to_dict()}), 200
    return jsonify({"verified": False, "message": "No confident KMHFR match — use manual verify instead"}), 200
