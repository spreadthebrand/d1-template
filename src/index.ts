import { handleApi } from "./api";
import {
  createBookingLink,
  createCampaign,
  createLead,
  createLeadSearch,
  getApprovalQueue,
  getBookingLinks,
  getCampaigns,
  getDashboardMetrics,
  getLeads,
  getRecentActivity,
  updateMessageDraft,
} from "./db";
import { pageFromPath, renderPage, staticState, type AppState } from "./renderHtml";

function redirect(location: string) {
  return new Response(null, { status: 303, headers: { location } });
}

async function loadAppState(env: Env): Promise<AppState> {
  try {
    const [leads, campaigns, approvalQueue, metrics, recentActivity, bookingLinks] = await Promise.all([
      getLeads(env),
      getCampaigns(env),
      getApprovalQueue(env),
      getDashboardMetrics(env),
      getRecentActivity(env),
      getBookingLinks(env),
    ]);

    return { leads, campaigns, approvalQueue, metrics, recentActivity, bookingLinks };
  } catch {
    return staticState;
  }
}

async function handleAction(request: Request, env: Env) {
  const url = new URL(request.url);
  const form = await request.formData();

  if (url.pathname === "/actions/leads") {
    await createLead(env, form);
    return redirect("/leads?created=lead");
  }

  if (url.pathname === "/actions/lead-searches") {
    await createLeadSearch(env, form);
    return redirect("/leads?queued=search");
  }

  if (url.pathname === "/actions/campaigns") {
    await createCampaign(env, form);
    return redirect("/campaigns?created=campaign");
  }

  if (url.pathname === "/actions/booking-links") {
    await createBookingLink(env, form);
    return redirect("/booking-links?saved=booking");
  }

  if (url.pathname === "/actions/approval") {
    await updateMessageDraft(env, String(form.get("id") ?? ""), String(form.get("action") ?? "approve"));
    return redirect("/approval-queue?updated=message");
  }

  return redirect("/dashboard");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env);
    }

    if (url.pathname.startsWith("/actions/") && request.method === "POST") {
      return handleAction(request, env);
    }

    const page = pageFromPath(url.pathname);
    const state = await loadAppState(env);
    return new Response(renderPage(page, url.pathname, state), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "x-content-type-options": "nosniff",
      },
    });
  },
} satisfies ExportedHandler<Env>;
