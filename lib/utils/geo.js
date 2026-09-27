const EARTH_RADIUS_KM = 6371;
const toRadians = (degrees) => (degrees * Math.PI) / 180;

export function distanceKm(from, to) {
  const latDelta = toRadians(to.latitude - from.latitude);
  const lonDelta = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(lonDelta / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function boundingBox({ latitude, longitude }, radiusKm) {
  const latitudeDelta = radiusKm / 111;
  const longitudeDelta = radiusKm / (111 * Math.max(Math.cos(toRadians(latitude)), 0.01));

  return {
    minLatitude: latitude - latitudeDelta,
    maxLatitude: latitude + latitudeDelta,
    minLongitude: longitude - longitudeDelta,
    maxLongitude: longitude + longitudeDelta,
  };
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

export function directionsUrl({ latitude, longitude }) {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}


export function largerMapUrl({ latitude, longitude }) {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=14/${latitude}/${longitude}`;
}
