// src/controllers/store.controller.js
'use strict';
const cache = require('../../lib/cache');
const { geocode } = require('../../lib/geocoder');
const { listStores, findNearbyStores } = require('../services/store.service');

const TTL_SECONDS = Number(process.env.NEARBY_CACHE_TTL || 120);

const cacheKey = ({ lat, lng, radius, category }) =>
  `geo:${lat.toFixed(5)}:${lng.toFixed(5)}:${radius}:${category || '*'}`;


// 최근 등록된 Store 목록 조회 (limit 기본 50, 최대 200)
async function getStores(req, res, next) {
  try {
    const items = await listStores({ limit: req.query.limit });
    res.json({ ok: true, items });
  } catch (e) { next(e); }
}

// 주소 문자열 → 위도/경도 변환 (카카오/네이버 지오코딩)
async function postGeocode(req, res) {
  try {
    const address = (req.body?.address || '').trim();
    if (!address) return res.status(400).json({ status: 0, message: 'address required' });
    const coords = await geocode(address);
    if (!coords) return res.json({ status: 0, message: 'not found' });
    res.json({ status: 1, result: coords });
  } catch (e) {
    console.error('POST /api/geocode error:', e);
    res.status(500).json({ status: 0, message: 'internal error' });
  }
}

// 주어진 위도/경도 반경 내 Store 검색 (Redis 캐싱 적용, TTL 120s)
async function getNearby(req, res) {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = Math.max(0.1, parseFloat(req.query.radius || '3'));
    const category = (req.query.category || '').trim();

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ status: 0, message: 'lat,lng required (numbers)' });
    }

    const key = cacheKey({ lat, lng, radius, category });
    const cached = await cache.get(key);
    if (cached) return res.json({ status: 1, cached: true, result: cached });

    const result = await findNearbyStores({ lat, lng, radiusKm: radius, category });
    await cache.setEx(key, TTL_SECONDS, result);

    res.json({ status: 1, cached: false, result });
  } catch (e) {
    console.error('GET /api/nearby error:', e);
    res.status(500).json({ status: 0, message: 'internal error' });
  }
}

module.exports = { getStores, postGeocode, getNearby };
