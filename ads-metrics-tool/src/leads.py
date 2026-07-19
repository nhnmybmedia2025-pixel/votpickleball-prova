"""Join ads metrics with landing form leads (Google Sheet export CSV)."""
from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd


def load_leads_csv(path: str | Path) -> pd.DataFrame:
    """
    Expect columns from landing Apps Script sheet, e.g.:
    Thời gian, Họ tên, Số điện thoại, Màu vợt, Địa chỉ,
    Nguồn (utm_source), Chiến dịch (utm_campaign), Medium (utm_medium), ...
    """
    df = pd.read_csv(path)
    # normalize column names
    colmap = {}
    for c in df.columns:
        cl = c.strip().lower()
        if "utm_source" in cl or cl == "nguồn (utm_source)" or "nguồn" in cl:
            colmap[c] = "utm_source"
        elif "utm_campaign" in cl or "chiến dịch" in cl:
            colmap[c] = "utm_campaign"
        elif "utm_medium" in cl or "medium" in cl:
            colmap[c] = "utm_medium"
        elif "thời gian" in cl or cl == "time" or "date" in cl:
            colmap[c] = "created_at"
    df = df.rename(columns=colmap)
    if "utm_source" not in df.columns:
        df["utm_source"] = ""
    if "utm_campaign" not in df.columns:
        df["utm_campaign"] = ""
    if "created_at" in df.columns:
        df["date"] = pd.to_datetime(df["created_at"], dayfirst=True, errors="coerce").dt.strftime("%Y-%m-%d")
    else:
        df["date"] = ""
    df["utm_source"] = df["utm_source"].fillna("").astype(str).str.lower().str.strip()
    df["utm_campaign"] = df["utm_campaign"].fillna("").astype(str).str.strip()
    return df


def summarize_leads(df: pd.DataFrame) -> dict[str, Any]:
    total = len(df)
    by_source = df.groupby("utm_source").size().to_dict() if total else {}
    by_campaign = df.groupby("utm_campaign").size().to_dict() if total else {}
    return {
        "leads_total": total,
        "leads_by_source": by_source,
        "leads_by_campaign": by_campaign,
    }


def attach_real_leads(ads_rows: list[dict], leads_df: pd.DataFrame) -> list[dict]:
    """
    Best-effort: match by date + platform guessed from utm_source.
    """
    if leads_df is None or leads_df.empty:
        return ads_rows

    # daily counts by source
    daily = (
        leads_df.groupby(["date", "utm_source"]).size().reset_index(name="leads_sheet")
        if "date" in leads_df.columns
        else pd.DataFrame()
    )

    out = []
    for row in ads_rows:
        r = dict(row)
        platform = (r.get("platform") or "").lower()
        day = r.get("date") or ""
        source_keys = ["facebook", "fb"] if platform == "facebook" else ["tiktok", "tt"]
        sheet_leads = 0
        if not daily.empty and day:
            for _, x in daily.iterrows():
                if x["date"] == day and any(k in str(x["utm_source"]) for k in source_keys):
                    sheet_leads += int(x["leads_sheet"])
        r["leads_sheet"] = sheet_leads
        spend = float(r.get("spend") or 0)
        r["cpl_sheet"] = (spend / sheet_leads) if sheet_leads > 0 else None
        out.append(r)
    return out
