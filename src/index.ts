import { handleApi } from "./api";
import { pageFromPath, renderPage } from "./renderHtml";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env);
    }

    const page = pageFromPath(url.pathname);
    return new Response(renderPage(page, url.pathname), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "x-content-type-options": "nosniff",
      },
    });
  },
} satisfies ExportedHandler<Env>;
