"""
TikTok Marketing API – Integrated reporting.

Docs: https://business-api.tiktok.com/portal/docs
Report endpoint (v1.3): /open_api/v1.3/report/integrated/get/
"""
from __future__ import annotations

from typing import Any

import requests

TT_API = "https://business-api.tiktok.com/open_api/v1.3"


def fetch_insights(
    access_token: str,
    advertiser_id: str,
    since: str,
    until: str,
    data_level: str = "AUCTION_CAMPAIGN",
    campaign_filter: str = "",
) -> list[dict[str, Any]]:
    """
    Pull daily campaign (or ad) metrics.
    data_level: AUCTION_CAMPAIGN | AUCTION_ADGROUP | AUCTION_AD
    """
    if not access_token or not advertiser_id:
        raise ValueError("TIKTOK_ACCESS_TOKEN và TIKTOK_ADVERTISER_ID là bắt buộc")

    # Metrics for lead landing funnels
    metrics = [
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
        # pixel web events (names may vary by account setup)
        "complete_payment",
        "form",
        "on_web_register",
        "on_web_subscribe",
        "button_click",
    ]

    dimensions = ["stat_time_day", "campaign_id", "campaign_name"]
    if "ADGROUP" in data_level:
        dimensions += ["adgroup_id", "adgroup_name"]
    if data_level.endswith("_AD"):
        dimensions += ["ad_id", "ad_name"]

    url = f"{TT_API}/report/integrated/get/"
    headers = {"Access-Token": access_token, "Content-Type": "application/json"}

    page = 1
    rows: list[dict[str, Any]] = []

    while True:
        body = {
            "advertiser_id": str(advertiser_id),
            "report_type": "BASIC",
            "data_level": data_level,
            "dimensions": dimensions,
            "metrics": metrics,
            "start_date": since,
            "end_date": until,
            "page": page,
            "page_size": 100,
        }
        r = requests.post(url, headers=headers, json=body, timeout=60)
        data = r.json()

        # TikTok success: code == 0
        if data.get("code") != 0:
            raise RuntimeError(f"TikTok API error: {data}")

        payload = data.get("data") or {}
        items = payload.get("list") or []
        for item in items:
            dims = item.get("dimensions") or item
            mets = item.get("metrics") or {}

            # flatten either nested or flat structure
            def g(key: str, default: Any = None) -> Any:
                if key in mets:
                    return mets[key]
                if key in dims:
                    return dims[key]
                return item.get(key, default)

            cname = str(g("campaign_name") or "")
            if campaign_filter and campaign_filter not in cname.lower():
                continue

            spend = float(g("spend") or 0)
            impressions = float(g("impressions") or 0)
            clicks = float(g("clicks") or 0)
            # Prefer form-related results if available
            leads = float(
                g("form")
                or g("result")
                or g("conversion")
                or g("on_web_register")
                or 0
            )

            day = str(g("stat_time_day") or g("stat_time") or "")[:10]

            rows.append(
                {
                    "platform": "tiktok",
                    "date": day,
                    "campaign_id": g("campaign_id"),
                    "campaign_name": cname,
                    "adset_name": g("adgroup_name"),
                    "ad_name": g("ad_name"),
                    "impressions": impressions,
                    "clicks": clicks,
                    "link_clicks": clicks,
                    "spend": spend,
                    "ctr": float(g("ctr") or 0),
                    "cpc": float(g("cpc") or 0),
                    "cpm": float(g("cpm") or 0),
                    "leads_pixel": leads,
                    "cpl_pixel": (spend / leads) if leads > 0 else None,
                    "landing": "votpickleball-prova.pages.dev",
                }
            )

        page_info = payload.get("page_info") or {}
        total_page = int(page_info.get("total_page") or 1)
        if page >= total_page or not items:
            break
        page += 1

    return rows
