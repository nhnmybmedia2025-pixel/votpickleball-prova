const TT_API = "https://business-api.tiktok.com/open_api/v1.3";

/**
 * @returns {Promise<{rows: object[], error?: string, skipped?: boolean, reason?: string}>}
 */
export async function fetchTikTokInsights(env, { since, until }) {
  const token = (env.TIKTOK_ACCESS_TOKEN || "").trim();
  const advertiserId = (env.TIKTOK_ADVERTISER_ID || "").trim();
  const filter = (env.TIKTOK_CAMPAIGN_FILTER || "").trim().toLowerCase();
  const landing = (env.LANDING_URL || "https://votpickleball-prova.pages.dev/")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  if (!token || !advertiserId) {
    return {
      rows: [],
      skipped: true,
      reason: "Thiếu TIKTOK_ACCESS_TOKEN / TIKTOK_ADVERTISER_ID",
    };
  }

  const metrics = [
    "spend",
    "impressions",
    "clicks",
    "ctr",
    "cpc",
    "cpm",
    "conversion",
    "cost_per_conversion",
    "result",
    "cost_per_result",
    "complete_payment",
    "form",
    "on_web_register",
    "on_web_subscribe",
    "button_click",
  ];
  const dimensions = ["stat_time_day", "campaign_id", "campaign_name"];
  const rows = [];
  let page = 1;

  while (page <= 50) {
    const body = {
      advertiser_id: String(advertiserId),
      report_type: "BASIC",
      data_level: "AUCTION_CAMPAIGN",
      dimensions,
      metrics,
      start_date: since,
      end_date: until,
      page,
      page_size: 100,
    };

    const r = await fetch(`${TT_API}/report/integrated/get/`, {
      method: "POST",
      headers: {
        "Access-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (data.code !== 0) {
      return {
        rows: [],
        error: `TikTok API: ${data.message || JSON.stringify(data).slice(0, 400)}`,
      };
    }

    const payload = data.data || {};
    const items = payload.list || [];
    for (const item of items) {
      const dims = item.dimensions || item;
      const mets = item.metrics || {};
      const g = (key, def = null) => {
        if (key in mets) return mets[key];
        if (key in dims) return dims[key];
        return item[key] ?? def;
      };

      const cname = String(g("campaign_name") || "");
      if (filter && !cname.toLowerCase().includes(filter)) continue;

      const spend = Number(g("spend") || 0);
      const impressions = Number(g("impressions") || 0);
      const clicks = Number(g("clicks") || 0);
      const leads = Number(
        g("form") || g("result") || g("conversion") || g("on_web_register") || 0
      );
      const day = String(g("stat_time_day") || g("stat_time") || "").slice(0, 10);

      rows.push({
        platform: "tiktok",
        date: day,
        campaign_id: g("campaign_id"),
        campaign_name: cname,
        adset_name: g("adgroup_name") || "",
        ad_name: g("ad_name") || "",
        impressions,
        clicks,
        link_clicks: clicks,
        spend,
        ctr: Number(g("ctr") || 0),
        cpc: Number(g("cpc") || 0),
        cpm: Number(g("cpm") || 0),
        leads_pixel: leads,
        cpl_pixel: leads > 0 ? spend / leads : null,
        landing,
      });
    }

    const totalPage = Number(payload.page_info?.total_page || 1);
    if (page >= totalPage || !items.length) break;
    page += 1;
  }

  return { rows };
}
