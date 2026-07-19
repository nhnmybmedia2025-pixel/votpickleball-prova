const STORAGE_KEY = "prova_metrics_pw";

const $ = (id) => document.getElementById(id);

function fmtNum(n, digits = 0) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString("vi-VN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function fmtMoney(n) {
  return fmtNum(n, 0);
}

function todayYMD() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}

function daysAgoYMD(days) {
  const d = new Date();
  d.setDate(d.getDate() - (days - 1));
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}

function setGate(open) {
  $("gate").classList.toggle("hidden", open);
  $("app").classList.toggle("hidden", !open);
}

function getPassword() {
  return sessionStorage.getItem(STORAGE_KEY) || "";
}

function setPassword(pw) {
  sessionStorage.setItem(STORAGE_KEY, pw);
}

function showMsg(el, text, type = "error") {
  el.textContent = text || "";
  el.className = `msg ${type}`;
  el.classList.toggle("hidden", !text);
}

async function checkHealth() {
  try {
    const r = await fetch("/api/health");
    const data = await r.json();
    $("health-line").textContent = [
      data.facebook_configured ? "FB ✓" : "FB chưa cấu hình",
      data.tiktok_configured ? "TT ✓" : "TT chưa cấu hình",
      data.app_password_set ? "Mật khẩu ✓" : "Thiếu APP_PASSWORD",
    ].join(" · ");
    return data;
  } catch {
    $("health-line").textContent = "Không kết nối API (deploy Functions?)";
    return null;
  }
}

async function login(e) {
  e.preventDefault();
  const pw = $("password").value.trim();
  showMsg($("gate-msg"), "");
  if (!pw) {
    showMsg($("gate-msg"), "Nhập mật khẩu dashboard");
    return;
  }
  // Probe with metrics 1 day
  try {
    const r = await fetch("/api/metrics?days=1&platform=facebook", {
      headers: { "X-App-Password": pw },
    });
    const data = await r.json();
    if (r.status === 401) {
      showMsg($("gate-msg"), data.error || "Sai mật khẩu");
      return;
    }
    if (r.status === 503) {
      showMsg($("gate-msg"), data.error || "Chưa cấu hình APP_PASSWORD");
      return;
    }
    setPassword(pw);
    setGate(true);
    await runReport();
  } catch (err) {
    showMsg($("gate-msg"), "Lỗi mạng: " + err.message);
  }
}

function logout() {
  sessionStorage.removeItem(STORAGE_KEY);
  setGate(false);
  $("password").value = "";
}

function renderCards(totals) {
  $("card-spend").textContent = fmtMoney(totals.spend);
  $("card-impr").textContent = fmtNum(totals.impressions);
  $("card-clicks").textContent = fmtNum(totals.clicks);
  $("card-ctr").textContent = fmtNum(totals.ctr, 2) + "%";
  $("card-cpc").textContent = fmtMoney(totals.cpc);
  $("card-leads").textContent = fmtNum(totals.leads_pixel);
  $("card-cpl").textContent =
    totals.leads_pixel > 0 ? fmtMoney(totals.cpl_pixel) : "—";
}

function renderPlatform(platforms) {
  const box = $("platform-cards");
  box.innerHTML = "";
  const entries = Object.entries(platforms || {});
  if (!entries.length) {
    box.innerHTML = `<p class="muted">Chưa có dữ liệu theo nền tảng.</p>`;
    return;
  }
  for (const [name, m] of entries) {
    const el = document.createElement("div");
    el.className = "plat-card";
    el.innerHTML = `
      <div class="plat-title">${name === "facebook" ? "Facebook" : name === "tiktok" ? "TikTok" : name}</div>
      <div class="plat-row"><span>Spend</span><strong>${fmtMoney(m.spend)}</strong></div>
      <div class="plat-row"><span>Impr.</span><strong>${fmtNum(m.impressions)}</strong></div>
      <div class="plat-row"><span>Clicks</span><strong>${fmtNum(m.clicks)}</strong></div>
      <div class="plat-row"><span>CTR</span><strong>${fmtNum(m.ctr, 2)}%</strong></div>
      <div class="plat-row"><span>Leads px</span><strong>${fmtNum(m.leads_pixel)}</strong></div>
    `;
    box.appendChild(el);
  }
}

function renderCampaigns(list) {
  const tbody = $("campaign-body");
  tbody.innerHTML = "";
  if (!list?.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="muted center">Không có campaign (filter / ngày trống)</td></tr>`;
    return;
  }
  for (const c of list) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="badge badge-${c.platform}">${c.platform}</span></td>
      <td class="name">${escapeHtml(c.campaign_name || "—")}</td>
      <td class="num">${fmtMoney(c.spend)}</td>
      <td class="num">${fmtNum(c.impressions)}</td>
      <td class="num">${fmtNum(c.clicks)}</td>
      <td class="num">${fmtNum(c.ctr, 2)}%</td>
      <td class="num">${fmtMoney(c.cpc)}</td>
      <td class="num">${c.leads_pixel ? fmtNum(c.leads_pixel) : "—"}</td>
    `;
    tbody.appendChild(tr);
  }
}

function renderDaily(rows) {
  const tbody = $("daily-body");
  tbody.innerHTML = "";
  if (!rows?.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="muted center">Không có dòng chi tiết</td></tr>`;
    return;
  }
  // sort date desc
  const sorted = [...rows].sort((a, b) =>
    String(b.date).localeCompare(String(a.date))
  );
  for (const r of sorted) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(r.date || "")}</td>
      <td><span class="badge badge-${r.platform}">${r.platform}</span></td>
      <td class="name">${escapeHtml(r.campaign_name || "")}</td>
      <td class="num">${fmtMoney(r.spend)}</td>
      <td class="num">${fmtNum(r.impressions)}</td>
      <td class="num">${fmtNum(r.clicks)}</td>
      <td class="num">${r.leads_pixel ? fmtNum(r.leads_pixel) : "—"}</td>
    `;
    tbody.appendChild(tr);
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toCsv(rows) {
  if (!rows?.length) return "";
  const keys = [
    "platform",
    "date",
    "campaign_name",
    "spend",
    "impressions",
    "clicks",
    "ctr",
    "cpc",
    "leads_pixel",
    "cpl_pixel",
  ];
  const lines = [keys.join(",")];
  for (const r of rows) {
    lines.push(
      keys
        .map((k) => {
          const v = r[k] ?? "";
          const s = String(v).replace(/"/g, '""');
          return `"${s}"`;
        })
        .join(",")
    );
  }
  return lines.join("\n");
}

let lastPayload = null;

async function runReport() {
  const pw = getPassword();
  if (!pw) {
    setGate(false);
    return;
  }

  const since = $("since").value;
  const until = $("until").value;
  const platform = $("platform").value;
  const btn = $("btn-run");
  btn.disabled = true;
  btn.textContent = "Đang tải…";
  showMsg($("app-msg"), "");

  try {
    const qs = new URLSearchParams({ since, until, platform });
    const r = await fetch(`/api/metrics?${qs}`, {
      headers: { "X-App-Password": pw },
    });
    const data = await r.json();
    if (r.status === 401) {
      logout();
      showMsg($("gate-msg"), "Phiên hết hạn / sai mật khẩu");
      return;
    }
    if (!r.ok && data.error) {
      showMsg($("app-msg"), data.error);
      return;
    }

    lastPayload = data;
    $("range-label").textContent = `${data.since} → ${data.until}`;
    renderCards(data.summary?.totals || {});
    renderPlatform(data.summary?.platforms || {});
    renderCampaigns(data.campaigns || []);
    renderDaily(data.rows || []);

    const notes = [];
    (data.notes || []).forEach((n) => notes.push(`${n.platform}: ${n.message}`));
    (data.errors || []).forEach((n) => notes.push(`LỖI ${n.platform}: ${n.message}`));
    if (notes.length) {
      showMsg($("app-msg"), notes.join(" | "), data.errors?.length ? "error" : "warn");
    } else {
      showMsg(
        $("app-msg"),
        `OK · ${data.summary?.row_count || 0} dòng · cập nhật ${data.summary?.generated_at || ""}`,
        "ok"
      );
    }
  } catch (err) {
    showMsg($("app-msg"), "Lỗi: " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Chạy báo cáo";
  }
}

function downloadCsv() {
  if (!lastPayload?.rows?.length) {
    showMsg($("app-msg"), "Chưa có dữ liệu để tải CSV", "warn");
    return;
  }
  const blob = new Blob([toCsv(lastPayload.rows)], {
    type: "text/csv;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ads-metrics_${lastPayload.since}_${lastPayload.until}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function presetDays(n) {
  $("until").value = todayYMD();
  $("since").value = daysAgoYMD(n);
}

document.addEventListener("DOMContentLoaded", async () => {
  $("until").value = todayYMD();
  $("since").value = daysAgoYMD(7);

  $("form-login").addEventListener("submit", login);
  $("btn-logout").addEventListener("click", logout);
  $("btn-run").addEventListener("click", runReport);
  $("btn-csv").addEventListener("click", downloadCsv);
  $("preset-7").addEventListener("click", () => {
    presetDays(7);
  });
  $("preset-14").addEventListener("click", () => {
    presetDays(14);
  });
  $("preset-30").addEventListener("click", () => {
    presetDays(30);
  });

  await checkHealth();

  if (getPassword()) {
    setGate(true);
    await runReport();
  }
});
