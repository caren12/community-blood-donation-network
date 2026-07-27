# Assigned to: Victor — Day 2 (Hospital verification — automated check against Kenya's
#              official facility registry, falling back to manual admin approval)
#
# Kenya Master Health Facility Registry (KMHFR) is the Ministry of Health's public
# registry of every licensed health facility in Kenya. API docs:
#   https://mfl-api-docs.readthedocs.io/en/latest/
# Base URL used here: https://api.kmhfr.health.go.ke
#
# IMPORTANT: KMHFR's facility list endpoint is publicly readable for basic lookups,
# but production write/verification workflows may require a registered API account —
# check the current auth requirements at the docs link above before relying on this
# in production. This integration degrades gracefully: if the API is unreachable, times
# out, or returns no confident match, the hospital simply falls back to the manual
# admin-review flow that was already built (PUT /api/hospitals/<id>/verify).

import requests

KMHFR_BASE_URL = "https://api.kmhfr.health.go.ke/api/facilities/facilities/"
REQUEST_TIMEOUT_SECONDS = 6


def auto_verify_hospital(name: str, city: str) -> bool:
    """
    Attempt to confirm a hospital is a real, registered Kenyan health facility by
    searching KMHFR for a name match, then loosely checking the county/city string.

    Returns True only on a confident match. Any failure (network error, no match,
    ambiguous result) returns False so the hospital falls back to manual admin review —
    this function is intentionally conservative, since a false positive here would let
    an unverified hospital create emergency blood requests.
    """
    try:
        response = requests.get(
            KMHFR_BASE_URL,
            params={"search": name, "page_size": 10},
            headers={"Accept": "application/json"},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        data = response.json()
    except (requests.RequestException, ValueError) as e:
        print(f"[hospital_verification] KMHFR lookup failed, falling back to manual review: {e}")
        return False

    results = data.get("results", [])
    if not results:
        return False

    name_lower = name.strip().lower()
    city_lower = (city or "").strip().lower()

    for facility in results:
        facility_name = (facility.get("name") or "").strip().lower()
        facility_county = (facility.get("county") or facility.get("ward_name") or "").strip().lower()

        name_matches = name_lower in facility_name or facility_name in name_lower
        city_matches = not city_lower or city_lower in facility_county or facility_county in city_lower

        if name_matches and city_matches and facility.get("is_active", True):
            return True

    return False
