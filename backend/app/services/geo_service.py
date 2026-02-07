import math


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Distance in km between two (lat, lon) points."""
    R = 6371  # Earth radius km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def is_inside_geofence(user_lat: float, user_lon: float, center_lat: float, center_lon: float, radius_m: float) -> bool:
    """Check if (user_lat, user_lon) is within radius_m meters of (center_lat, center_lon)."""
    km = haversine_km(user_lat, user_lon, center_lat, center_lon)
    return km * 1000 <= radius_m
