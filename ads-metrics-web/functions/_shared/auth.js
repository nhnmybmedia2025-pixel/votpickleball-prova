/**
 * Simple password gate. Client sends X-App-Password header.
 * Set APP_PASSWORD in Cloudflare env (Production + Preview).
 */
export function checkAuth(request, env) {
  const expected = (env.APP_PASSWORD || "").trim();
  if (!expected) {
    return {
      ok: false,
      status: 503,
      body: {
        error:
          "Chưa cấu hình APP_PASSWORD trên Cloudflare. Vào Settings → Environment variables.",
      },
    };
  }
  const got =
    (request.headers.get("X-App-Password") || "").trim() ||
    (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!got || got !== expected) {
    return {
      ok: false,
      status: 401,
      body: { error: "Sai mật khẩu dashboard" },
    };
  }
  return { ok: true };
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 0), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}
