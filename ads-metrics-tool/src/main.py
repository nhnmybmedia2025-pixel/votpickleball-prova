#!/usr/bin/env python3
"""
CLI: fetch Facebook + TikTok ads insights for landing measurement.

Usage:
  python -m src.main --days 7
  python -m src.main --since 2026-07-01 --until 2026-07-19 --leads output/leads.csv
"""
from __future__ import annotations

import argparse
import sys
from datetime import date, datetime, timedelta

from src.config import Settings
from src.facebook_ads import fetch_insights as fb_fetch
from src.tiktok_ads import fetch_insights as tt_fetch
from src.leads import load_leads_csv, summarize_leads, attach_real_leads
from src.report import build_summary, save_outputs


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Pull FB + TikTok ads metrics for landing funnel")
    p.add_argument("--days", type=int, default=7, help="Last N days including today")
    p.add_argument("--since", type=str, default="", help="YYYY-MM-DD")
    p.add_argument("--until", type=str, default="", help="YYYY-MM-DD")
    p.add_argument("--facebook-only", action="store_true")
    p.add_argument("--tiktok-only", action="store_true")
    p.add_argument("--fb-level", default="campaign", choices=["campaign", "adset", "ad"])
    p.add_argument("--leads", type=str, default="", help="Path to Google Sheet export CSV")
    return p.parse_args()


def resolve_range(args: argparse.Namespace) -> tuple[str, str]:
    if args.since and args.until:
        return args.since, args.until
    until = date.today()
    since = until - timedelta(days=max(args.days - 1, 0))
    return since.isoformat(), until.isoformat()


def main() -> int:
    args = parse_args()
    settings = Settings.from_env()
    since, until = resolve_range(args)

    print(f"== Ads metrics {since} → {until} ==")
    print(f"Landing: {settings.landing_url}")

    rows = []
    errors = []

    if not args.tiktok_only:
        if settings.fb_token and settings.fb_ad_account_id:
            try:
                fb_rows = fb_fetch(
                    settings.fb_token,
                    settings.fb_ad_account_id,
                    since,
                    until,
                    level=args.fb_level,
                    campaign_filter=settings.fb_campaign_filter,
                )
                print(f"Facebook: {len(fb_rows)} rows")
                rows.extend(fb_rows)
            except Exception as e:
                errors.append(f"Facebook: {e}")
                print(f"[ERROR] Facebook: {e}", file=sys.stderr)
        else:
            print("[SKIP] Facebook – thiếu FB_ACCESS_TOKEN / FB_AD_ACCOUNT_ID")

    if not args.facebook_only:
        if settings.tt_token and settings.tt_advertiser_id:
            try:
                tt_rows = tt_fetch(
                    settings.tt_token,
                    settings.tt_advertiser_id,
                    since,
                    until,
                    campaign_filter=settings.tt_campaign_filter,
                )
                print(f"TikTok: {len(tt_rows)} rows")
                rows.extend(tt_rows)
            except Exception as e:
                errors.append(f"TikTok: {e}")
                print(f"[ERROR] TikTok: {e}", file=sys.stderr)
        else:
            print("[SKIP] TikTok – thiếu TIKTOK_ACCESS_TOKEN / TIKTOK_ADVERTISER_ID")

    leads_summary = None
    if args.leads:
        try:
            ldf = load_leads_csv(args.leads)
            leads_summary = summarize_leads(ldf)
            rows = attach_real_leads(rows, ldf)
            print(f"Leads sheet: {leads_summary.get('leads_total', 0)}")
        except Exception as e:
            errors.append(f"Leads: {e}")
            print(f"[ERROR] Leads: {e}", file=sys.stderr)

    summary = build_summary(rows, leads_summary)
    paths = save_outputs(rows, summary, settings.output_dir, since, until)

    print("\n== Summary ==")
    print(summary.get("totals"))
    print("\n== Files ==")
    for k, p in paths.items():
        print(f"  {k}: {p}")

    if errors:
        print("\n== Completed with errors ==")
        for e in errors:
            print(f"  - {e}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
