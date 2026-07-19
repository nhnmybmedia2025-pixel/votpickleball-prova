"""
Facebook Marketing API – Campaign / Ad set insights.

Docs: https://developers.facebook.com/docs/marketing-api/insights
"""
from __future__ import annotations

from typing import Any

import requests

GRAPH = "https://graph.facebook.com/v21.0"

# Metrics useful for landing-page lead funnels
FB_FIELDS = [
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
]


def _action_value(actions: list | None, action_types: list[str]) -> float:
    if not actions:
        return 0.0
    total = 0.0
    for a in actions:
        if a.get("action_type") in action_types:
            try:
                total += float(a.get("value") or 0)
            except (TypeError, ValueError):
                pass
    return total


def fetch_insights(
    access_token: str,
    ad_account_id: str,
    since: str,
    until: str,
    level: str = "campaign",
    campaign_filter: str = "",
) -> list[dict[str, Any]]:
    """
    Pull insights for date range [since, until] inclusive (YYYY-MM-DD).
    level: campaign | adset | ad
    """
    if not access_token or not ad_account_id:
        raise ValueError("FB_ACCESS_TOKEN và FB_AD_ACCOUNT_ID là bắt buộc")

    act = ad_account_id if ad_account_id.startswith("act_") else f"act_{ad_account_id}"
    url = f"{GRAPH}/{act}/insights"
    params = {
        "access_token": access_token,
        "level": level,
        "fields": ",".join(FB_FIELDS),
        "time_range": f'{{"since":"{since}","until":"{until}"}}',
        "time_increment": 1,  # daily breakdown
        "limit": 500,
    }

    rows: list[dict[str, Any]] = []
    while url:
        r = requests.get(url, params=params, timeout=60)
        params = None  # next page uses full URL
        data = r.json()
        if r.status_code >= 400:
            raise RuntimeError(f"Facebook API error {r.status_code}: {data}")

        for item in data.get("data", []):
            name = (item.get("campaign_name") or "").lower()
            if campaign_filter and campaign_filter not in name:
                continue

            leads = _action_value(
                item.get("actions"),
                [
                    "lead",
                    "onsite_conversion.lead_grouped",
                    "offsite_conversion.fb_pixel_lead",
                    "leadgen_grouped",
                ],
            )
            link_clicks = float(item.get("inline_link_clicks") or item.get("clicks") or 0)
            spend = float(item.get("spend") or 0)
            impressions = float(item.get("impressions") or 0)
            clicks = float(item.get("clicks") or 0)

            rows.append(
                {
                    "platform": "facebook",
                    "date": item.get("date_start"),
                    "campaign_id": item.get("campaign_id"),
                    "campaign_name": item.get("campaign_name"),
                    "adset_name": item.get("adset_name"),
                    "ad_name": item.get("ad_name"),
                    "impressions": impressions,
                    "clicks": clicks,
                    "link_clicks": link_clicks,
                    "spend": spend,
                    "ctr": float(item.get("ctr") or 0),
                    "cpc": float(item.get("cpc") or 0),
                    "cpm": float(item.get("cpm") or 0),
                    "leads_pixel": leads,
                    "cpl_pixel": (spend / leads) if leads > 0 else None,
                    "landing": "votpickleball-prova.pages.dev",
                }
            )

        url = (data.get("paging") or {}).get("next")

    return rows
