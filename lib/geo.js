// lib/geo.js
const EARTH_KM = 6371;

function bbox(lat, lng, radiusKm) {
  const dLat = (radiusKm / EARTH_KM) * (180 / Math.PI);
  const dLng = (radiusKm / (EARTH_KM * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);
  return {
    minLat: lat - dLat,
    maxLat: lat + dLat,
    minLng: lng - dLng,
    maxLng: lng + dLng,
  };
}

// 하버사인(거리 km) SQL
function haversineSql(lat, lng) {
  return `
    (6371 * 2 * ASIN(SQRT(
      POWER(SIN(RADIANS(${lat} - lat) / 2), 2) +
      COS(RADIANS(${lat})) * COS(RADIANS(lat)) *
      POWER(SIN(RADIANS(${lng} - lng) / 2), 2)
    )))
  `;
}

module.exports = { EARTH_KM, bbox, haversineSql };
