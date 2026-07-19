"""Build summary JSON + Markdown report."""
from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any

import pandas as pd


def build_summary(rows: list[dict[str, Any]], leads_summary: dict | None = None) -> dict[str, Any]:
    if not rows:
        return {"platforms": {}, "totals": {}, "leads": leads_summary or {}}

    df = pd.DataFrame(rows)
    for col in ["spend", "impressions", "clicks", "link_clicks", "leads_pixel"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    def agg(g: pd.DataFrame) -> dict:
        spend = float(g["spend"].sum())
        clicks = float(g["clicks"].sum())
        imps = float(g["impressions"].sum())
        leads = float(g["leads_pixel"].sum()) if "leads_pixel" in g else 0
        return {
            "spend": round(spend, 2),
            "impressions": int(imps),
            "clicks": int(clicks),
            "ctr": round((clicks / imps * 100) if imps else 0, 3),
            "cpc": round((spend / clicks) if clicks else 0, 2),
            "leads_pixel": int(leads),
            "cpl_pixel": round((spend / leads) if leads else 0, 2),
        }

    platforms = {}
    for p, g in df.groupby("platform"):
        platforms[str(p)] = agg(g)

    totals = agg(df)
    return {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "platforms": platforms,
        "totals": totals,
        "leads_sheet": leads_summary or {},
        "row_count": len(df),
    }


def to_markdown(summary: dict[str, Any], since: str, until: str) -> str:
    lines = [
        f"# Ads report {since} → {until}",
        "",
        f"Generated: `{summary.get('generated_at')}`",
        "",
        "## Totals",
        "",
        "| Metric | Value |",
        "|--------|-------|",
    ]
    t = summary.get("totals") or {}
    for k, v in t.items():
        lines.append(f"| {k} | {v} |")

    lines += ["", "## By platform", ""]
    for p, m in (summary.get("platforms") or {}).items():
        lines.append(f"### {p}")
        lines.append("")
        lines.append("| Metric | Value |")
        lines.append("|--------|-------|")
        for k, v in m.items():
            lines.append(f"| {k} | {v} |")
        lines.append("")

    ls = summary.get("leads_sheet") or {}
    if ls:
        lines += ["## Landing leads (Sheet)", ""]
        lines.append(f"- Total leads: **{ls.get('leads_total', 0)}**")
        lines.append(f"- By source: `{ls.get('leads_by_source')}`")
        lines.append(f"- By campaign: `{ls.get('leads_by_campaign')}`")
        lines.append("")

    lines += [
        "## How to read (landing form)",
        "",
        "1. **cpl_pixel** = spend / pixel leads (FB Lead / TT SubmitForm)",
        "2. **leads_sheet** = đơn thật trên Google Sheet (utm_source)",
        "3. Nếu pixel >> sheet → kiểm tra thank-you, form, spam click",
        "4. Nếu sheet >> pixel → pixel miss (adblock) hoặc organic/Telegram",
        "",
    ]
    return "\n".join(lines)


def save_outputs(
    rows: list[dict[str, Any]],
    summary: dict[str, Any],
    output_dir: Path,
    since: str,
    until: str,
) -> dict[str, Path]:
    stamp = datetime.now().strftime("%Y%m%d_%H%M")
    output_dir.mkdir(parents=True, exist_ok=True)

    paths = {}
    df = pd.DataFrame(rows)
    if not df.empty:
        for platform in df["platform"].unique():
            p = output_dir / f"{platform}_insights_{stamp}.csv"
            df[df["platform"] == platform].to_csv(p, index=False)
            paths[f"{platform}_csv"] = p

        all_p = output_dir / f"all_insights_{stamp}.csv"
        df.to_csv(all_p, index=False)
        paths["all_csv"] = all_p

    import json

    jp = output_dir / f"summary_{stamp}.json"
    jp.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    paths["summary_json"] = jp

    md = output_dir / f"report_{stamp}.md"
    md.write_text(to_markdown(summary, since, until), encoding="utf-8")
    paths["report_md"] = md
    return paths
