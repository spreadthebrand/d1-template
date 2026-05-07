import { embedUrl, isDirectVideo } from "@/lib/utils";
export function VideoPlayer({ url, title }: { url: string; title: string }) { return isDirectVideo(url) ? <video className="aspect-video w-full rounded-3xl bg-black" src={url} controls preload="metadata" /> : <iframe className="aspect-video w-full rounded-3xl bg-black" src={embedUrl(url)} title={title} allowFullScreen />; }
