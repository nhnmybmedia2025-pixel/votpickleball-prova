"""Load config from environment."""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")


@dataclass
class Settings:
    fb_token: str
    fb_ad_account_id: str
    fb_campaign_filter: str
    tt_token: str
    tt_advertiser_id: str
    tt_campaign_filter: str
    timezone: str
    landing_url: str
    output_dir: Path

    @classmethod
    def from_env(cls) -> "Settings":
        out = ROOT / "output"
        out.mkdir(parents=True, exist_ok=True)
        return cls(
            fb_token=os.getenv("FB_ACCESS_TOKEN", "").strip(),
            fb_ad_account_id=os.getenv("FB_AD_ACCOUNT_ID", "").strip(),
            fb_campaign_filter=os.getenv("FB_CAMPAIGN_FILTER", "").strip().lower(),
            tt_token=os.getenv("TIKTOK_ACCESS_TOKEN", "").strip(),
            tt_advertiser_id=os.getenv("TIKTOK_ADVERTISER_ID", "").strip(),
            tt_campaign_filter=os.getenv("TIKTOK_CAMPAIGN_FILTER", "").strip().lower(),
            timezone=os.getenv("TIMEZONE", "Asia/Ho_Chi_Minh"),
            landing_url=os.getenv("LANDING_URL", "https://votpickleball-prova.pages.dev/"),
            output_dir=out,
        )
