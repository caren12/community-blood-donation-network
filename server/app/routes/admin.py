# Assigned to: Victor — Day 3 (Admin donor removal endpoint)
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.user import User
from app.auth.decorators import role_required

admin_bp = Blueprint("admin", __name__)


@admin_bp.delete("/donors/<int:donor_id>")
@jwt_required()
@role_required("admin")
def remove_donor(donor_id):
    donor = User.query.get_or_404(donor_id)
    if donor.role != "donor":
        return jsonify({"error": "Target user is not a donor"}), 400
    db.session.delete(donor)
    db.session.commit()
    return jsonify({"message": "Donor account removed"}), 200
