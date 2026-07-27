# Assigned to: Ian — Day 1 (Auth endpoints: register, login, JWT)
#            & Caren — Day 1 (Password reset endpoints)
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token
from flask_mail import Message

from app.extensions import db, bcrypt, mail
from app.models.user import User
from app.models.hospital import Hospital
from app.services.hospital_verification import auto_verify_hospital
from app.auth.tokens import generate_reset_token, verify_reset_token, consume_reset_token

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    required = ["name", "email", "password", "role"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": f"Missing required fields: {required}"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 409

    if data["role"] not in ("donor", "hospital_staff"):
        return jsonify({"error": "role must be 'donor' or 'hospital_staff'"}), 400

    password_hash = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    user = User(
        name=data["name"],
        email=data["email"],
        password_hash=password_hash,
        role=data["role"],
        blood_type=data.get("blood_type") if data["role"] == "donor" else None,
        city=data.get("city"),
    )
    db.session.add(user)
    db.session.flush()  # get user.id before commit

    if data["role"] == "hospital_staff":
        hospital_fields = ["hospital_name", "hospital_address", "hospital_phone"]
        if not all(data.get(f) for f in hospital_fields):
            db.session.rollback()
            return jsonify({"error": f"Missing hospital fields: {hospital_fields}"}), 400
        hospital = Hospital(
            name=data["hospital_name"],
            address=data["hospital_address"],
            city=data.get("city", ""),
            phone=data["hospital_phone"],
            verified=auto_verify_hospital(data["hospital_name"], data.get("city", "")),
            owner_id=user.id,
        )
        db.session.add(hospital)

    db.session.commit()

    access_token = create_access_token(identity=user.id, additional_claims={"role": user.role})
    refresh_token = create_refresh_token(identity=user.id)

    return jsonify({
        "user": user.to_dict(),
        "access_token": access_token,
        "refresh_token": refresh_token,
    }), 201


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=user.id, additional_claims={"role": user.role})
    refresh_token = create_refresh_token(identity=user.id)

    return jsonify({
        "user": user.to_dict(),
        "access_token": access_token,
        "refresh_token": refresh_token,
    }), 200


@auth_bp.post("/forgot-password")
def forgot_password():
    data = request.get_json() or {}
    email = data.get("email")
    if not email:
        return jsonify({"error": "email is required"}), 400

    user = User.query.filter_by(email=email).first()
    # Always return 200 even if user not found, to avoid leaking which emails are registered.
    if user:
        token = generate_reset_token(user.id)
        reset_link = f"{request.host_url.rstrip('/')}/reset-password/{token}"
        try:
            msg = Message(
                subject="Reset your Blood Donation Network password",
                recipients=[user.email],
                body=f"Click the link to reset your password (valid 30 minutes): {reset_link}",
            )
            mail.send(msg)
        except Exception as e:
            # Email sending may fail in local/dev without SMTP creds configured — don't block the flow.
            print(f"[forgot-password] email send failed: {e}")

    return jsonify({"message": "If that email exists, a reset link has been sent."}), 200


@auth_bp.post("/reset-password")
def reset_password():
    data = request.get_json() or {}
    token = data.get("token")
    new_password = data.get("password")
    if not token or not new_password:
        return jsonify({"error": "token and password are required"}), 400

    user_id = verify_reset_token(token)
    if not user_id:
        return jsonify({"error": "Invalid or expired token"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
    db.session.commit()
    consume_reset_token(token)

    return jsonify({"message": "Password updated successfully"}), 200
