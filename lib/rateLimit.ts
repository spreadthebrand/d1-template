type Entry = { count: number; resetAt: number };
const bucket = new Map<string, Entry>();
export function rateLimit(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now(); const entry = bucket.get(key);
  if (!entry || entry.resetAt < now) { bucket.set(key, { count: 1, resetAt: now + windowMs }); return true; }
  if (entry.count >= limit) return false;
  entry.count += 1; return true;
}
