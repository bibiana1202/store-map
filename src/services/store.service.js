// src/services/store.service.js
'use strict';
const { Op, Sequelize } = require('sequelize');
const db = require('../../models');
const { Store } = db;
const { bbox, haversineSql } = require('../../lib/geo');


// 최근 등록된 Store 목록 조회 (limit 기본 50, 최대 200)
async function listStores({ limit = 50 }) {
  const safeLimit = Math.min(parseInt(limit, 10) || 50, 200);
  const items = await Store.findAll({ order: [['id','DESC']], limit: safeLimit });
  return items;
}

// 주어진 위도/경도 반경 내 Store 검색 (Redis 캐싱 적용, TTL 120s)
async function findNearbyStores({ lat, lng, radiusKm, category }) {
  const { minLat, maxLat, minLng, maxLng } = bbox(lat, lng, radiusKm);
  const distLiteral = Sequelize.literal(haversineSql(lat, lng));

  const where = {
    lat: { [Op.between]: [minLat, maxLat] },
    lng: { [Op.between]: [minLng, maxLng] },
  };
  if (category) where.category = { [Op.like]: `%${category}%` };

  const rows = await Store.findAll({
    attributes: { include: [[distLiteral, 'distance_km']] },
    where,
    order: [[Sequelize.col('distance_km'), 'ASC']],
    limit: 500,
    having: Sequelize.literal(`distance_km <= ${radiusKm}`),
  });

  return rows.map(r => ({
    id: r.id,
    seqNo: r.seqNo ?? r.get('seqNo'),
    name: r.name,
    phone: r.phone,
    sido: r.sido,
    sigungu: r.sigungu,
    addr1: r.addr1,
    addr2: r.addr2,
    category: r.category,
    lat: r.lat,
    lng: r.lng,
    distance_km: Number(r.get('distance_km')),
  }));
}

module.exports = { listStores, findNearbyStores };
