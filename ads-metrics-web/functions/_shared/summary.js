function emptyAgg() {
  return {
    spend: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    cpc: 0,
    leads_pixel: 0,
    cpl_pixel: 0,
  };
}

function agg(rows) {
  const a = emptyAgg();
  for (const r of rows) {
    a.spend += Number(r.spend || 0);
    a.impressions += Number(r.impressions || 0);
    a.clicks += Number(r.clicks || 0);
    a.leads_pixel += Number(r.leads_pixel || 0);
  }
  a.spend = Math.round(a.spend * 100) / 100;
  a.impressions = Math.round(a.impressions);
  a.clicks = Math.round(a.clicks);
  a.leads_pixel = Math.round(a.leads_pixel);
  a.ctr =
    a.impressions > 0
      ? Math.round((a.clicks / a.impressions) * 100000) / 1000
      : 0;
  a.cpc = a.clicks > 0 ? Math.round((a.spend / a.clicks) * 100) / 100 : 0;
  a.cpl_pixel =
    a.leads_pixel > 0 ? Math.round((a.spend / a.leads_pixel) * 100) / 100 : 0;
  return a;
}

export function buildSummary(rows) {
  const platforms = {};
  for (const r of rows) {
    const p = r.platform || "unknown";
    if (!platforms[p]) platforms[p] = [];
    platforms[p].push(r);
  }
  const platformStats = {};
  for (const [p, list] of Object.entries(platforms)) {
    platformStats[p] = agg(list);
  }
  return {
    generated_at: new Date().toISOString(),
    row_count: rows.length,
    totals: agg(rows),
    platforms: platformStats,
  };
}

/** Aggregate by campaign for table view */
export function byCampaign(rows) {
  const map = new Map();
  for (const r of rows) {
    const key = `${r.platform}::${r.campaign_id || r.campaign_name}`;
    if (!map.has(key)) {
      map.set(key, {
        platform: r.platform,
        campaign_id: r.campaign_id,
        campaign_name: r.campaign_name,
        spend: 0,
        impressions: 0,
        clicks: 0,
        leads_pixel: 0,
      });
    }
    const m = map.get(key);
    m.spend += Number(r.spend || 0);
    m.impressions += Number(r.impressions || 0);
    m.clicks += Number(r.clicks || 0);
    m.leads_pixel += Number(r.leads_pixel || 0);
  }
  return [...map.values()]
    .map((m) => ({
      ...m,
      spend: Math.round(m.spend * 100) / 100,
      ctr:
        m.impressions > 0
          ? Math.round((m.clicks / m.impressions) * 100000) / 1000
          : 0,
      cpc: m.clicks > 0 ? Math.round((m.spend / m.clicks) * 100) / 100 : 0,
      cpl_pixel:
        m.leads_pixel > 0
          ? Math.round((m.spend / m.leads_pixel) * 100) / 100
          : null,
    }))
    .sort((a, b) => b.spend - a.spend);
}
