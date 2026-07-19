import { json } from "../_shared/auth.js";

export async function onRequestGet(context) {
  const env = context.env;
  return json({
    ok: true,
    service: "prova-ads-metrics",
    facebook_configured: Boolean(
      (env.FB_ACCESS_TOKEN || "").trim() && (env.FB_AD_ACCOUNT_ID || "").trim()
    ),
    tiktok_configured: Boolean(
      (env.TIKTOK_ACCESS_TOKEN || "").trim() &&
        (env.TIKTOK_ADVERTISER_ID || "").trim()
    ),
    app_password_set: Boolean((env.APP_PASSWORD || "").trim()),
    landing: env.LANDING_URL || "https://votpickleball-prova.pages.dev/",
    fb_filter: env.FB_CAMPAIGN_FILTER || "",
    tt_filter: env.TIKTOK_CAMPAIGN_FILTER || "",
  });
}
