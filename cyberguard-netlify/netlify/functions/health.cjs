// netlify/functions/health.cjs
exports.handler = async () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'ok', ts: new Date().toISOString(), platform: 'netlify' }),
});
