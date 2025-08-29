// lib/cache.js
const { createClient } = require('redis');

const client = createClient({ url: process.env.REDIS_URL });
client.on('error', (err) => console.error('🔴 Redis error:', err));

let ready = false;
async function ensureReady() {
  if (!ready) {
    await client.connect();
    ready = true;
  }
}

async function get(key) {
  await ensureReady();
  const v = await client.get(key);
  return v ? JSON.parse(v) : null;
}

async function setEx(key, ttlSec, value) {
  await ensureReady();
  await client.setEx(key, ttlSec, JSON.stringify(value));
}

module.exports = { get, setEx };
