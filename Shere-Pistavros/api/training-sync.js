import { Redis } from "@upstash/redis";

const DATASET_KEY = process.env.TRAINING_SYNC_KEY || "shere-pistavros:global-dataset:v1";

const getRedisClient = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
};

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

export default async function handler(request, response) {
  const redis = getRedisClient();
  if (!redis) {
    response.status(503).json({
      error: "Cloud sync is not configured. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel project settings.",
    });
    return;
  }

  if (request.method === "GET") {
    try {
      const payload = await redis.get(DATASET_KEY);
      response.status(200).json({
        version: 1,
        updatedAt: payload?.updatedAt || null,
        trainingData: normalizeArray(payload?.trainingData),
        history: normalizeArray(payload?.history),
        synaxariumCatalog: normalizeArray(payload?.synaxariumCatalog),
        reviewDenials: normalizeArray(payload?.reviewDenials),
      });
      return;
    } catch (error) {
      response.status(500).json({ error: `Cloud read failed: ${error.message}` });
      return;
    }
  }

  if (request.method === "POST") {
    try {
      const body = request.body || {};
      const payload = {
        version: 1,
        updatedAt: body.updatedAt || new Date().toISOString(),
        trainingData: normalizeArray(body.trainingData),
        history: normalizeArray(body.history),
        synaxariumCatalog: normalizeArray(body.synaxariumCatalog),
        reviewDenials: normalizeArray(body.reviewDenials),
      };

      await redis.set(DATASET_KEY, payload);
      response.status(202).json({ ok: true, updatedAt: payload.updatedAt });
      return;
    } catch (error) {
      response.status(500).json({ error: `Cloud write failed: ${error.message}` });
      return;
    }
  }

  response.setHeader("Allow", "GET, POST");
  response.status(405).json({ error: "Method not allowed" });
}
