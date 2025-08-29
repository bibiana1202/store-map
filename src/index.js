require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { createClient } = require('redis');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./docs/swagger');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // UI
app.get('/openapi.json', (req, res) => res.json(swaggerSpec));   // JSON

const storesRouter = require('./routes/stores');
app.use(express.json());
app.use('/api',storesRouter);

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// ✅ 재시도/오프라인큐 비활성 + 짧은 connectTimeout
const redis = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: () => 0,  // 재시도 안 함 (즉시 실패)
    connectTimeout: 300          // 연결 시도 최대 300ms
  },
  disableOfflineQueue: true       // 오프라인 큐 비활성
});

redis.on('error', (err) => console.warn('⚠️ Redis:', err.message));

let triedConnect = false;

// 타임아웃 도우미
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function ensureRedis(timeoutMs = 300) {
  if (redis.isOpen) return true;
  // 이전에 실패했더라도 다음 요청에서 다시 시도할 수 있게 triedConnect는 즉시 쓰지 않음
  const connectPromise = redis.connect()
    .then(() => true)
    .catch(() => false);

  // ⏱️ 타임아웃과 경합
  const ok = await Promise.race([connectPromise, delay(timeoutMs).then(() => false)]);
  if (!ok) {
    // 연결이 지연되면 클라이언트 상태를 정리(미연결/큐 방지)
    try { if (redis.isOpen) await redis.quit(); } catch {}
  }
  return ok;
}

app.get('/', (_, res) => res.send('store-map API is running'));

app.get('/health', async (_, res) => {
  const ok = await ensureRedis(200); // 200ms 안에 안 붙으면 NOREDIS
  try {
    const status = ok ? await redis.ping() : 'NOREDIS';
    return res.json({ ok: true, redis: status });
  } catch {
    return res.json({ ok: true, redis: 'NOREDIS' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 http://localhost:${port}`));
