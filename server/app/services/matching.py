# Assigned to: Victor — Day 2 (Matching algorithm + match endpoint)
import math

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

# Approximate coordinates for known cities/towns. City names are matched
# case-insensitively; anything not in this table falls back to exact-string
# matching only (see find_compatible_donors) so it degrades gracefully
# instead of crashing on an unrecognized city.
CITY_COORDINATES = {
    "nairobi":  (-1.2921, 36.8219),
    "kiambu":   (-1.1714, 36.8356),
    "mombasa":  (-4.0435, 39.6682),
    "kisumu":   (-0.0917, 34.7680),
    "nakuru":   (-0.3031, 36.0800),
    "eldoret":  (0.5143, 35.2698),
    "thika":    (-1.0332, 37.0693),
    "machakos": (-1.5177, 37.2634),
    "nyeri":    (-0.4169, 36.9483),
    "kakamega": (0.2827, 34.7519),
}

# Maximum distance (km) a donor can be from a hospital to be considered a match.
MAX_MATCH_DISTANCE_KM = 50


def _haversine_km(coord1, coord2):
    """Great-circle distance between two (lat, lon) points, in kilometers."""
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    r = 6371  # Earth's radius in km

    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


def find_compatible_donors(requested_blood_type, city, User):
    """Return donor Users who are available and compatible with the requested type.

    If the hospital's city is in our known coordinate table, this searches ALL
    available compatible donors and filters by real distance later in
    rank_by_distance(). If the city isn't recognized, it falls back to the
    original exact-city-string behavior so nothing breaks on an unknown town.
    """
    hospital_city_key = (city or "").strip().lower()

    if hospital_city_key in CITY_COORDINATES:
        candidates = User.query.filter_by(role="donor", is_available=True).all()
    else:
        candidates = User.query.filter_by(role="donor", is_available=True, city=city).all()

    compatible = [
        donor for donor in candidates
        if donor.blood_type and requested_blood_type in COMPATIBILITY.get(donor.blood_type, [])
    ]
    return compatible


def rank_by_distance(donors, hospital_city=None):
    """Rank donors by real distance to the hospital when possible.

    Falls back to a 0.0km placeholder for any donor/hospital city not in our
    coordinate table, so unrecognized cities still work (just without a
    distance figure), rather than throwing an error.
    """
    hospital_key = (hospital_city or "").strip().lower()
    hospital_coord = CITY_COORDINATES.get(hospital_key)

    ranked = []
    for donor in donors:
        donor_key = (donor.city or "").strip().lower()
        donor_coord = CITY_COORDINATES.get(donor_key)

        if hospital_coord and donor_coord:
            distance = round(_haversine_km(hospital_coord, donor_coord), 1)
        else:
            distance = 0.0

        # Only include donors within the match radius when we actually know
        # both coordinates; otherwise keep the old permissive behavior.
        if hospital_coord and donor_coord and distance > MAX_MATCH_DISTANCE_KM:
            continue

        ranked.append((donor, distance))

    ranked.sort(key=lambda pair: pair[1])
    return ranked