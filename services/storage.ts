// Local-first storage abstraction. TODO: enable S3-compatible providers (AWS S3, Cloudflare R2, Bunny.net) with S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET, and S3_REGION.
export function validateUpload(type: string) { return ["video/mp4", "video/webm", "image/png", "image/jpeg", "image/webp"].includes(type); }
