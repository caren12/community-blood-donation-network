# Assigned to: Victor — Day 2 (Matching algorithm + match endpoint)

# Simplified ABO/Rh compatibility chart: donor blood type -> recipient types they can give to
COMPATIBILITY = {
    "O-":  ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],  # universal donor
    "O+":  ["O+", "A+", "B+", "AB+"],
    "A-":  ["A-", "A+", "AB-", "AB+"],
    "A+":  ["A+", "AB+"],
    "B-":  ["B-", "B+", "AB-", "AB+"],
    "B+":  ["B+", "AB+"],
    "AB-": ["AB-", "AB+"],
    "AB+": ["AB+"],
}


def find_compatible_donors(requested_blood_type, city, User):
    """Return donor Users who are available, in the same city, and compatible with the requested type."""
    candidates = User.query.filter_by(role="donor", is_available=True, city=city).all()
    compatible = [
        donor for donor in candidates
        if donor.blood_type and requested_blood_type in COMPATIBILITY.get(donor.blood_type, [])
    ]
    return compatible


def rank_by_distance(donors):
    """MVP: same-city match => distance placeholder of 0km. Upgrade path: real lat/lon + haversine."""
    return [(donor, 0.0) for donor in donors]
