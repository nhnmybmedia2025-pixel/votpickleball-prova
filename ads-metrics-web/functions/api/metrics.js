import { checkAuth, json } from "../_shared/auth.js";
import { fetchFacebookInsights } from "../_shared/facebook.js";
import { fetchTikTokInsights } from "../_shared/tiktok.js";
import { buildSummary, byCampaign } from "../_shared/summary.js";

function ymd(d) {
  return d.toISOString().slice(0, 10);
}

function resolveRange(url) {
  const sinceQ = url.searchParams.get("since");
  const untilQ = url.searchParams.get("until");
  const days = Math.min(
    Math.max(parseInt(url.searchParams.get("days") || "7", 10) || 7, 1),
    90
  );
  if (sinceQ && untilQ) {
    return { since: sinceQ, until: untilQ };
  }
  const until = new Date();
  const since = new Date(until);
  since.setUTCDate(since.getUTCDate() - (days - 1));
  return { since: ymd(since), until: ymd(until) };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const auth = checkAuth(request, env);
  if (!auth.ok) return json(auth.body, auth.status);

  const url = new URL(request.url);
  const { since, until } = resolveRange(url);
  const platform = (url.searchParams.get("platform") || "all").toLowerCase();
  const level = url.searchParams.get("level") || "campaign";

  const rows = [];
  const errors = [];
  const notes = [];

  const wantFb = platform === "all" || platform === "facebook";
  const wantTt = platform === "all" || platform === "tiktok";

  if (wantFb) {
    try {
      const fb = await fetchFacebookInsights(env, { since, until, level });
      if (fb.error) errors.push({ platform: "facebook", message: fb.error });
      else if (fb.skipped) notes.push({ platform: "facebook", message: fb.reason });
      else rows.push(...fb.rows);
    } catch (e) {
      errors.push({ platform: "facebook", message: String(e.message || e) });
    }
  }

  if (wantTt) {
    try {
      const tt = await fetchTikTokInsights(env, { since, until });
      if (tt.error) errors.push({ platform: "tiktok", message: tt.error });
      else if (tt.skipped) notes.push({ platform: "tiktok", message: tt.reason });
      else rows.push(...tt.rows);
    } catch (e) {
      errors.push({ platform: "tiktok", message: String(e.message || e) });
    }
  }

  const summary = buildSummary(rows);
  const campaigns = byCampaign(rows);

  return json({
    ok: errors.length === 0,
    since,
    until,
    landing: env.LANDING_URL || "https://votpickleball-prova.pages.dev/",
    summary,
    campaigns,
    rows,
    notes,
    errors,
  });
}

export async function onRequestPost(context) {
  // Allow POST with JSON body { password, days, since, until, platform }
  const { request, env } = context;
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // Inject password into a synthetic request for auth
  const headers = new Headers(request.headers);
  if (body.password) headers.set("X-App-Password", String(body.password));
  const authReq = new Request(request.url, { method: "GET", headers });
  const auth = checkAuth(authReq, env);
  if (!auth.ok) return json(auth.body, auth.status);

  const u = new URL(request.url);
  if (body.days) u.searchParams.set("days", String(body.days));
  if (body.since) u.searchParams.set("since", body.since);
  if (body.until) u.searchParams.set("until", body.until);
  if (body.platform) u.searchParams.set("platform", body.platform);
  if (body.level) u.searchParams.set("level", body.level);

  const getReq = new Request(u.toString(), {
    method: "GET",
    headers: { "X-App-Password": headers.get("X-App-Password") || "" },
  });
  return onRequestGet({ request: getReq, env });
}
