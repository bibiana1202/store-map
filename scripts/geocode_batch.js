/* eslint-disable no-console */
const { Op } = require('sequelize');
const db = require('../models');
const { Store } = db;
const { geocode } = require('../lib/geocoder');

const BATCH     = Number(process.env.GEOCODE_BATCH  || 200);
const SLEEP_MS  = Number(process.env.GEOCODE_DELAY  || 120);
const HARD_MAX  = Number(process.env.GEOCODE_LIMIT  || 50000); // 상한(실제 데이터가 적으면 여기 전 도달하지 않음)

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function compactAddress(r) {
  // 중복되는 시/도 토큰 제거 (예: "경북 포항시 경북 포항시 북구 ..." -> "경북 포항시 북구 ...")
  const parts = [r.sido, r.sigungu, r.addr1, r.addr2]
    .filter(Boolean)
    .map(s => String(s).trim())
    .filter(Boolean);
  const seen = new Set();
  const dedup = [];
  for (const p of parts) {
    if (seen.has(p)) continue;
    seen.add(p);
    dedup.push(p);
  }
  return dedup.join(' ');
}

function validCoords(c) {
  if (!c) return false;
  const { lat, lng } = c;
  return Number.isFinite(lat) && Number.isFinite(lng);
}

async function geocodeWithFallback(r) {
  // 1) full
  const a1 = compactAddress(r);
  if (a1) {
    const c1 = await geocode(a1);
    if (validCoords(c1)) return c1;
  }
  // 2) addr2 제외 폴백
  const parts = [r.sido, r.sigungu, r.addr1].filter(Boolean).map(s => String(s).trim());
  const a2 = [...new Set(parts)].join(' ');
  if (a2) {
    const c2 = await geocode(a2);
    if (validCoords(c2)) return c2;
  }
  return null;
}

async function run() {
  await db.sequelize.authenticate();
  console.log('🌐 Geocode batch start');
  let processed = 0, updated = 0;

  // 이번 실행에서 이미 처리/시도한 ID는 다시 뽑지 않기
  const processedIds = new Set();

  while (processed < HARD_MAX) {
    const where = {
      [Op.and]: [
        { lat: { [Op.is]: null } },
        { lng: { [Op.is]: null } },
      ],
    };
    if (processedIds.size) {
      where.id = { [Op.notIn]: Array.from(processedIds) };
    }

    const rows = await Store.findAll({
      where,
      limit: BATCH,
      order: [['id','ASC']],
    });

    if (!rows.length) break;

    for (const r of rows) {
      processedIds.add(r.id);
      processed++;
      try {
        const coords = await geocodeWithFallback(r);
        if (validCoords(coords)) {
          r.lat = coords.lat;
          r.lng = coords.lng;
          await r.save();
          updated++;
        } else {
          // 유효 좌표 못 얻은 경우: skip (다음 실행에서 다시 시도하도록 남김)
          console.warn(`⚠️  geocode not found/invalid: id=${r.id} addr="${compactAddress(r)}"`);
        }
      } catch (e) {
        // 저장 실패 등은 좌표를 건드리지 않고 스킵
        console.warn(`geocode fail: id=${r.id} addr="${compactAddress(r)}" err=${e.message}`);
      }
      await sleep(SLEEP_MS);
    }

    console.log(`...progress processed=${processed}, updated=${updated}`);
  }

  console.log(`✅ Done. processed=${processed}, updated=${updated}`);
  await db.sequelize.close();
}

run().catch(e => { console.error('❌ Batch failed:', e); process.exit(1); });
