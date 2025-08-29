const axios = require('axios');

async function geocodeByKakao(address) {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) throw new Error('KAKAO_REST_API_KEY missing');
  const url = 'https://dapi.kakao.com/v2/local/search/address.json';
  const res = await axios.get(url, {
    headers: { Authorization: `KakaoAK ${key}` },
    params: { query: address }
  });
  const doc = res.data.documents?.[0];
  if (!doc) return null;
  // road_address 우선, 없으면 address 사용
  const src = doc.road_address || doc.address;
  return src ? { lat: parseFloat(src.y), lng: parseFloat(src.x) } : null;
}

async function geocodeByNaver(address) {
  const id = process.env.NAVER_MAPS_KEY_ID;
  const secret = process.env.NAVER_MAPS_KEY;
  if (!id || !secret) throw new Error('NAVER_MAPS_KEY_ID/KEY missing');
  const url = 'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode';
  const res = await axios.get(url, {
    headers: {
      'X-NCP-APIGW-API-KEY-ID': id,
      'X-NCP-APIGW-API-KEY': secret,
    },
    params: { query: address }
  });
  const item = res.data.addresses?.[0];
  if (!item) return null;
  return { lat: parseFloat(item.y), lng: parseFloat(item.x) };
}

// 우선 카카오 → 실패 시 네이버로 폴백
async function geocode(address) {
  const trimmed = (address || '').trim();
  if (!trimmed) return null;
  try {
    const r1 = await geocodeByKakao(trimmed);
    if (r1) return r1;
  } catch (_) {}
  try {
    const r2 = await geocodeByNaver(trimmed);
    if (r2) return r2;
  } catch (_) {}
  return null;
}

module.exports = { geocode, geocodeByKakao, geocodeByNaver };
