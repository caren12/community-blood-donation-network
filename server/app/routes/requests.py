
#CAREN

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from app.extensions import db
from app.models import BloodRequest, Hospital, RoleEnum, UrgencyEnum, RequestStatusEnum
from app.auth.decorators import current_user, roles_required
from app.services.matching import find_and_notify_matches

requests_bp = Blueprint("requests", __name__)

VALID_URGENCY = {u.value for u in UrgencyEnum}


def _forbid_if_not_owner(blood_request, user, claims):
    """
    Returns a (response, status) tuple to return immediately if the caller
    is hospital_staff for a DIFFERENT hospital than the one that owns this
    request. Returns None if the caller is allowed to proceed (admin, or
    hospital_staff for the correct hospital).
    """
    if claims.get("role") == RoleEnum.hospital_staff.value and blood_request.hospital_id != user.hospital_id:
        return jsonify({"error": "You do not have permission to modify this request"}), 403
    return None


@requests_bp.post("")
@roles_required(RoleEnum.hospital_staff.value)
def create_request():
    """
    Hospital staff create a new emergency blood request for their own
    hospital. Only staff attached to a VERIFIED hospital can do this —
    an unverified hospital (pending admin review) is blocked here, not
    just hidden in the frontend UI.
    """
    user = current_user()
    hospital = Hospital.query.get(user.hospital_id) if user.hospital_id else None

    if not hospital or not hospital.verified:
        # Enforced server-side per the spec, not just hidden in the UI.
        return jsonify({"error": "Only verified hospitals can create requests"}), 403

    # Pull and validate the request body before touching the database.
    data = request.get_json(silent=True) or {}
    blood_type = data.get("blood_type")
    units_needed = data.get("units_needed")
    urgency_level = data.get("urgency_level")

    if not blood_type or not units_needed or urgency_level not in VALID_URGENCY:
        return jsonify({"error": "blood_type, units_needed and a valid urgency_level are required"}), 400

    # New requests always start life as "open" — hospital staff move them
    # to fulfilled/expired later via update_request, or a donation logs
    # against them directly (see donations.py).
    blood_request = BloodRequest(
        hospital_id=hospital.id,
        blood_type=blood_type,
        units_needed=int(units_needed),
        urgency_level=UrgencyEnum(urgency_level),
        status=RequestStatusEnum.open,
    )
    db.session.add(blood_request)
    db.session.commit()
    return jsonify(blood_request.to_dict()), 201


@requests_bp.get("")
@jwt_required()
def list_requests():
    """Hospital staff see only their own hospital's requests; donors/admins see open ones."""
    user = current_user()
    claims = get_jwt()

    if claims.get("role") == RoleEnum.hospital_staff.value:
        query = BloodRequest.query.filter_by(hospital_id=user.hospital_id)
    elif claims.get("role") == RoleEnum.admin.value:
        query = BloodRequest.query
    else:  # donor: only ever needs to see open requests they might be matched to
        query = BloodRequest.query.filter_by(status=RequestStatusEnum.open)

    results = query.order_by(BloodRequest.created_at.desc()).all()
    return jsonify([r.to_dict() for r in results]), 200


@requests_bp.get("/<int:request_id>")
@jwt_required()
def get_request(request_id):
    """
    Fetch a single request's detail. Open to any logged-in user (donor,
    hospital staff, or admin) — request detail isn't sensitive on its own,
    unlike editing/cancelling/matching it, which are ownership-checked below.
    """
    blood_request = BloodRequest.query.get(request_id)
    if not blood_request:
        return jsonify({"error": "Request not found"}), 404
    return jsonify(blood_request.to_dict()), 200


@requests_bp.put("/<int:request_id>")
@roles_required(RoleEnum.hospital_staff.value, RoleEnum.admin.value)
def update_request(request_id):
    """
    Update a request's status/units/urgency. hospital_staff may only update
    requests belonging to their own hospital (checked below); admins may
    update any request. Only the fields present in the request body are
    changed — omitted fields are left as-is.
    """
    blood_request = BloodRequest.query.get(request_id)
    if not blood_request:
        return jsonify({"error": "Request not found"}), 404

    # Ownership check: block hospital_staff from editing another hospital's
    # request, even though their role alone passes @roles_required above.
    user = current_user()
    claims = get_jwt()
    forbidden = _forbid_if_not_owner(blood_request, user, claims)
    if forbidden:
        return forbidden

    data = request.get_json(silent=True) or {}
    if "status" in data:
        if data["status"] not in {s.value for s in RequestStatusEnum}:
            return jsonify({"error": "Invalid status"}), 400
        blood_request.status = RequestStatusEnum(data["status"])
    if "units_needed" in data:
        blood_request.units_needed = int(data["units_needed"])
    if "urgency_level" in data:
        if data["urgency_level"] not in VALID_URGENCY:
            return jsonify({"error": "Invalid urgency_level"}), 400
        blood_request.urgency_level = UrgencyEnum(data["urgency_level"])

    db.session.commit()
    return jsonify(blood_request.to_dict()), 200


@requests_bp.delete("/<int:request_id>")
@roles_required(RoleEnum.hospital_staff.value, RoleEnum.admin.value)
def cancel_request(request_id):
    """
    Cancel (hard-delete) a request. Same ownership rule as update_request:
    hospital_staff can only cancel their own hospital's requests; admins
    can cancel any. Deleting the BloodRequest also cascades to its
    RequestMatch rows via the relationship's cascade config.
    """
    blood_request = BloodRequest.query.get(request_id)
    if not blood_request:
        return jsonify({"error": "Request not found"}), 404

    # Ownership check — see update_request above for why this exists.
    user = current_user()
    claims = get_jwt()
    forbidden = _forbid_if_not_owner(blood_request, user, claims)
    if forbidden:
        return forbidden

    db.session.delete(blood_request)
    db.session.commit()
    return jsonify({"message": "Request cancelled"}), 200


# ---------------------------------------------------------------------
# Owner: Victor | Day 2 | Task 11: Matching algorithm + match endpoint
# ---------------------------------------------------------------------
@requests_bp.post("/<int:request_id>/match")
@roles_required(RoleEnum.hospital_staff.value, RoleEnum.admin.value)
def match_request(request_id):
    """
    Run the matching algorithm for this request: find compatible, available
    donors in the same city, create a RequestMatch row per candidate, and
    notify them. Same ownership rule as update_request/cancel_request —
    hospital_staff can only trigger matching on their own hospital's
    requests. See app/services/matching.py for the actual matching logic.
    """
    blood_request = BloodRequest.query.get(request_id)
    if not blood_request:
        return jsonify({"error": "Request not found"}), 404

    # Ownership check — see update_request above for why this exists.
    user = current_user()
    claims = get_jwt()
    forbidden = _forbid_if_not_owner(blood_request, user, claims)
    if forbidden:
        return forbidden

    matches = find_and_notify_matches(blood_request)
    return jsonify([m.to_dict() for m in matches]), 201