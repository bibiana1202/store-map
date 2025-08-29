/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const iconv = require('iconv-lite'); // UTF-8이면 사용 안됨. 자동감지는 못하니 옵션으로 처리
const db = require('../models');
const { Store } = db;

const INPUT = process.argv[2] || path.join(__dirname, '../data/stores.csv');
const BATCH_SIZE = Number(process.env.CSV_BATCH_SIZE || 500);
const ENCODING = process.env.CSV_ENCODING || 'utf8'; // 'utf8' or 'cp949'

/** CSV 헤더: 연번,업체명,연락처,시도,시군구,기본주소,상세주소,주요사업 */
function mapRow(row) {
  const seqNo = toInt(row['연번']);
  return {
    seqNo,
    name: safeStr(row['업체명']),
    phone: normalizePhone(row['연락처']),
    sido: safeStr(row['시도']),
    sigungu: safeStr(row['시군구']),
    addr1: safeStr(row['기본주소']),
    addr2: safeStr(row['상세주소']),
    category: safeStr(row['주요사업']),
    // lat/lng는 지오코딩 단계에서 갱신
  };
}

function safeStr(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}
function toInt(v) {
  if (v == null) return null;
  const n = parseInt(String(v).replace(/[^\d-]/g, ''), 10);
  return Number.isNaN(n) ? null : n;
}
function normalizePhone(v) {
  if (!v) return null;
  const d = String(v).replace(/\D/g, '');
  if (!d) return null;
  if (d.startsWith('02')) {
    if (d.length === 9) return d.replace(/^(\d{2})(\d{3})(\d{4})$/, '$1-$2-$3');
    if (d.length === 10) return d.replace(/^(\d{2})(\d{4})(\d{4})$/, '$1-$2-$3');
  } else if (d.startsWith('0')) {
    if (d.length === 10) return d.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3');
    if (d.length === 11) return d.replace(/^(\d{3})(\d{4})(\d{4})$/, '$1-$2-$3');
  }
  return d;
}

async function run() {
  console.log('📥 CSV Import start:', INPUT, `(encoding=${ENCODING})`);
  await db.sequelize.authenticate();

  let buffer = [];
  let total = 0;
  let upserts = 0;

  const upsertBatch = async (batch) => {
    if (!batch.length) return;
    const updatable = ['name','phone','sido','sigungu','addr1','addr2','category','lat','lng'];
    await Store.bulkCreate(batch, { updateOnDuplicate: updatable });
    upserts += batch.length;
  };

  const baseStream = fs.createReadStream(INPUT);
  const stream = (ENCODING.toLowerCase() === 'cp949' || ENCODING.toLowerCase() === 'euc-kr')
    ? baseStream.pipe(iconv.decodeStream('cp949')).pipe(iconv.encodeStream('utf8'))
    : baseStream;

  await new Promise((resolve, reject) => {
    const p = stream
      .pipe(csv())
      .on('data', (row) => {
        try {
          const m = mapRow(row);
          if (m.seqNo == null || !m.name) {
            console.warn('⚠️  Skipped (missing seqNo or name):', row);
            return;
          }
          buffer.push(m);
          total++;
          if (buffer.length >= BATCH_SIZE) {
            p.pause();
            upsertBatch(buffer)
              .then(() => { buffer = []; p.resume(); })
              .catch(reject);
          }
        } catch (e) { reject(e); }
      })
      .on('end', async () => {
        try {
          if (buffer.length) await upsertBatch(buffer);
          console.log(`✅ Done. rows read: ${total}, upserted: ${upserts}`);
          resolve();
        } catch (e) { reject(e); }
      })
      .on('error', reject);
  });

  await db.sequelize.close();
}

run().catch((e) => {
  console.error('❌ Import failed:', e);
  process.exit(1);
});
