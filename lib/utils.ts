import crypto from "crypto";
import clsx from "clsx";
export const cn = (...classes: unknown[]) => clsx(classes);
export const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const hashValue = (value = "") => crypto.createHash("sha256").update(`${process.env.NEXTAUTH_SECRET ?? "local"}:${value}`).digest("hex");
export const isDirectVideo = (url: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url) || url.startsWith("/uploads/");
export const embedUrl = (url: string) => {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
};
