// src/routes/store.js
'use strict';
const express = require('express');
const router = express.Router();
const {
  getStores,
  postGeocode,
  getNearby
} = require('../controllers/store.controller');


// 최근 등록된 Store 목록 조회 (limit 기본 50, 최대 200)
/**
 * @openapi
 * /api/stores:
 *   get:
 *     summary: 최근 Store 목록 조회
 *     tags: [Store]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 200, default: 50 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean }
 *                 items:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Store' }
 */
router.get('/stores', getStores);

// 주소 문자열 → 위도/경도 변환 (카카오/네이버 지오코딩)
/**
 * @openapi
 * /api/geocode:
 *   post:
 *     summary: 주소→좌표 변환
 *     tags: [Geo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [address]
 *             properties:
 *               address: { type: string }
 *     responses:
 *       200:
 *         description: 결과 또는 not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: integer, enum: [0,1] }
 *                 result:
 *                   type: object
 *                   properties:
 *                     lat: { type: number }
 *                     lng: { type: number }
 */
router.post('/geocode', postGeocode);

/**
 * @openapi
 * /api/nearby:
 *   get:
 *     summary: 좌표 반경 내 가게 검색
 *     tags: [Store]
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema: { type: number }
 *         required: true
 *       - in: query
 *         name: lng
 *         schema: { type: number }
 *         required: true
 *       - in: query
 *         name: radius
 *         schema: { type: number, default: 3 }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: integer }
 *                 cached: { type: boolean }
 *                 result:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/NearbyItem' }
 */
// 주어진 위도/경도 반경 내 Store 검색 (Redis 캐싱 적용, TTL 120s)
router.get('/nearby', getNearby);

module.exports = router;
