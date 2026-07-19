const GRAPH = "https://graph.facebook.com/v21.0";

const FB_FIELDS = [
  "campaign_id",
  "campaign_name",
  "adset_id",
  "adset_name",
  "ad_id",
  "ad_name",
  "impressions",
  "clicks",
  "inline_link_clicks",
  "spend",
  "cpc",
  "cpm",
  "ctr",
  "actions",
  "cost_per_action_type",
  "date_start",
  "date_stop",
].join(",");

const LEAD_TYPES = new Set([
  "lead",
  "onsite_conversion.lead_grouped",
  "offsite_conversion.fb_pixel_lead",
  "leadgen_grouped",
]);

function actionValue(actions) {
  if (!Array.isArray(actions)) return 0;
  let total = 0;
  for (const a of actions) {
    if (LEAD_TYPES.has(a.action_type)) {
      total += Number(a.value || 0);
    }
  }
  return total;
}

/**
 * @returns {Promise<{rows: object[], error?: string}>}
 */
export async function fetchFacebookInsights(env, { since, until, level = "campaign" }) {
  const token = (env.FB_ACCESS_TOKEN || "").trim();
  let act = (env.FB_AD_ACCOUNT_ID || "").trim();
  const filter = (env.FB_CAMPAIGN_FILTER || "").trim().toLowerCase();
  const landing = (env.LANDING_URL || "https://votpickleball-prova.pages.dev/").replace(
    /^https?:\/\//,
    ""
  ).replace(/\/$/, "");

  if (!token || !act) {
    return { rows: [], skipped: true, reason: "Thiếu FB_ACCESS_TOKEN / FB_AD_ACCOUNT_ID" };
  }
  if (!act.startsWith("act_")) act = `act_${act}`;

  const rows = [];
  let url = new URL(`${GRAPH}/${act}/insights`);
  url.searchParams.set("access_token", token);
  url.searchParams.set("level", level);
  url.searchParams.set("fields", FB_FIELDS);
  url.searchParams.set("time_range", JSON.stringify({ since, until }));
  url.searchParams.set("time_increment", "1");
  url.searchParams.set("limit", "500");

  let guard = 0;
  while (url && guard < 40) {
    guard += 1;
    const r = await fetch(url.toString(), { method: "GET" });
    const data = await r.json();
    if (!r.ok) {
      return {
        rows: [],
        error: `Facebook API ${r.status}: ${JSON.stringify(data?.error || data).slice(0, 500)}`,
      };
    }
    for (const item of data.data || []) {
      const name = (item.campaign_name || "").toLowerCase();
      if (filter && !name.includes(filter)) continue;

      const leads = actionValue(item.actions);
      const spend = Number(item.spend || 0);
      const impressions = Number(item.impressions || 0);
      const clicks = Number(item.clicks || 0);
      const linkClicks = Number(item.inline_link_clicks || item.clicks || 0);

      rows.push({
        platform: "facebook",
        date: item.date_start,
        campaign_id: item.campaign_id,
        campaign_name: item.campaign_name,
        adset_name: item.adset_name || "",
        ad_name: item.ad_name || "",
        impressions,
        clicks,
        link_clicks: linkClicks,
        spend,
        ctr: Number(item.ctr || 0),
        cpc: Number(item.cpc || 0),
        cpm: Number(item.cpm || 0),
        leads_pixel: leads,
        cpl_pixel: leads > 0 ? spend / leads : null,
        landing,
      });
    }
    url = data.paging?.next ? new URL(data.paging.next) : null;
  }

  return { rows };
}
