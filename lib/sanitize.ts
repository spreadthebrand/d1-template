export function sanitizeArticleContent(content: string) {
  return content.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/on\w+="[^"]*"/gi, "").replace(/javascript:/gi, "");
}
