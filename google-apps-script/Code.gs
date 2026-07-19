/**
 * Prova Ultimate 3.5 – Form → Sheet + Telegram + TikTok Events API + Meta CAPI
 *
 * ===== SCRIPT PROPERTIES =====
 * TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID     (bắt buộc Telegram)
 * TIKTOK_ACCESS_TOKEN                     (Events API access token)
 * TIKTOK_PIXEL_ID = D9DSLURC77U79CKF57FG  (mặc định trong code nếu trống)
 * META_ACCESS_TOKEN, META_DATASET_ID      (tuỳ chọn)
 *
 * Sau sửa code: Deploy → New version
 * Lần đầu: Run testTelegram / testTikTok → Allow UrlFetch
 */

var SHEET_NAME = 'DonHang';
var LEAD_EVENT_SOURCE = 'Prova Landing CRM';
var HOTLINE = '0868.93.16.91';
var DEFAULT_TIKTOK_PIXEL = 'D9DSLURC77U79CKF57FG';
var SALE_VALUE = 1060000;

function doPost(e) {
  try {
    var data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    }

    var sheet = getOrCreateSheet_();
    var tz = Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh';
    var now = Utilities.formatDate(new Date(), tz, 'dd/MM/yyyy HH:mm:ss');

    sheet.appendRow([
      now,
      data.name || '',
      data.phone || '',
      data.color || '',
      data.address || '',
      data.utm_source || '',
      data.utm_campaign || '',
      data.utm_medium || '',
      data.fbclid || '',
      data.ttclid || '',
      data.user_agent || '',
      data.page || ''
    ]);

    var tgResult = { skipped: true };
    try { tgResult = sendTelegramOrder_(data, now); }
    catch (tgErr) { tgResult = { ok: false, error: String(tgErr) }; }

    var ttResult = { skipped: true };
    try { ttResult = sendTikTokSubmitForm_(data); }
    catch (ttErr) { ttResult = { ok: false, error: String(ttErr) }; }

    var metaResult = { skipped: true };
    try { metaResult = sendMetaCrmLead_(data); }
    catch (metaErr) { metaResult = { ok: false, error: String(metaErr) }; }

    var gaResult = { skipped: true };
    try { gaResult = sendGa4Lead_(data); }
    catch (gaErr) { gaResult = { ok: false, error: String(gaErr) }; }

    return jsonResponse({
      result: 'success',
      message: 'OK',
      telegram: tgResult,
      tiktok: ttResult,
      meta: metaResult,
      ga4: gaResult
    });
  } catch (err) {
    try { sendTelegramText_('⚠️ Lỗi form Prova: ' + String(err)); } catch (e2) {}
    return jsonResponse({ result: 'error', message: String(err) });
  }
}

function doGet() {
  return jsonResponse({
    result: 'ok',
    message: 'Prova form endpoint. POST = Sheet + Telegram + TikTok + Meta.'
  });
}

/** Run trong editor để test Telegram */
function testTelegram() {
  var r = sendTelegramOrder_({
    name: 'Test Telegram',
    phone: '0868931691',
    color: 'Xanh mint',
    address: 'Test – TP.HCM',
    utm_source: 'test',
    utm_campaign: 'setup'
  }, Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss'));
  Logger.log(JSON.stringify(r));
}

/** Run để lấy chat_id: nhắn bất kỳ cho bot trước, rồi chạy getTelegramUpdates */
function getTelegramUpdates() {
  var token = PropertiesService.getScriptProperties().getProperty('TELEGRAM_BOT_TOKEN');
  if (!token) {
    Logger.log('Chưa có TELEGRAM_BOT_TOKEN');
    return;
  }
  var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/getUpdates');
  Logger.log(res.getContentText());
}

/** Test TikTok Events API – Run trong editor sau khi set TIKTOK_ACCESS_TOKEN */
function testTikTok() {
  var r = sendTikTokSubmitForm_({
    name: 'Test TikTok API',
    phone: '0868931691',
    color: 'Xanh mint',
    address: 'Test HCM',
    ttclid: '',
    user_agent: 'AppsScript-testTikTok',
    page: 'https://votpickleball-prova.pages.dev/thank-you'
  });
  Logger.log(JSON.stringify(r));
}

// ─── Telegram ───────────────────────────────────────────────

function sendTelegramOrder_(data, timeStr) {
  var name = data.name || '(không tên)';
  var phone = data.phone || '';
  var color = data.color || '';
  var address = data.address || '';
  var src = data.utm_source || 'trực tiếp';
  var camp = data.utm_campaign || '';

  // Plain text (tránh lỗi parse Markdown)
  var lines = [
    '🏓 ĐƠN MỚI – Prova Ultimate 3.5',
    '',
    '⏰ ' + (timeStr || ''),
    '👤 ' + name,
    '📱 ' + phone,
    '🎨 Màu: ' + color,
    '📍 ' + address,
    '',
    '📣 Nguồn: ' + src + (camp ? ' / ' + camp : ''),
    '',
    '☎️ Gọi ngay: ' + HOTLINE
  ];

  return sendTelegramText_(lines.join('\n'));
}

function sendTelegramText_(text) {
  var props = PropertiesService.getScriptProperties();
  var token = (props.getProperty('TELEGRAM_BOT_TOKEN') || '').trim();
  var chatId = (props.getProperty('TELEGRAM_CHAT_ID') || '').trim();

  if (!token || !chatId) {
    return {
      ok: false,
      error: 'Chưa set TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong Script properties.'
    };
  }

  var payload = {
    chat_id: chatId,
    text: String(text).substring(0, 4000),
    disable_web_page_preview: true
  };

  var url = 'https://api.telegram.org/bot' + token + '/sendMessage';
  var res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var code = res.getResponseCode();
  var body = res.getContentText();
  console.log('Telegram HTTP ' + code + ': ' + body);

  return { ok: code >= 200 && code < 300, http: code, body: body };
}

// ─── Google Sheet ───────────────────────────────────────────

function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  var headers = [
    'Thời gian', 'Họ tên', 'Số điện thoại', 'Màu vợt', 'Địa chỉ',
    'Nguồn (utm_source)', 'Chiến dịch (utm_campaign)', 'Medium (utm_medium)',
    'fbclid', 'ttclid', 'User Agent', 'Trang'
  ];
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ─── Google Analytics 4 Measurement Protocol (server-side) ──

/**
 * Gửi generate_lead server-side (không bị adblock chặn).
 * Script properties:
 *   GA4_MEASUREMENT_ID = G-YBRL7V8BTM  (optional, default below)
 *   GA4_API_SECRET     = secret từ GA Admin → Data stream → Measurement Protocol
 *
 * Tạo secret: GA4 → Admin → Data streams → prova-pick → Measurement Protocol API secrets → Create
 */
function sendGa4Lead_(data) {
  var props = PropertiesService.getScriptProperties();
  var measurementId = (props.getProperty('GA4_MEASUREMENT_ID') || 'G-YBRL7V8BTM').trim();
  var apiSecret = (props.getProperty('GA4_API_SECRET') || '').trim();

  if (!apiSecret) {
    return { ok: false, error: 'Chưa set GA4_API_SECRET (Admin → Data stream → Measurement Protocol API secrets)' };
  }

  var clientId = Utilities.getUuid();
  var payload = {
    client_id: clientId,
    events: [{
      name: 'generate_lead',
      params: {
        currency: 'VND',
        value: SALE_VALUE,
        item_name: 'Prova Ultimate 3.5',
        engagement_time_msec: 100,
        session_id: String(Math.floor(Date.now() / 1000)),
        page_location: data.page || 'https://votpickleball-prova.pages.dev/thank-you',
        source: data.utm_source || '(direct)',
        medium: data.utm_medium || '(none)',
        campaign: data.utm_campaign || ''
      }
    }]
  };

  var url = 'https://www.google-analytics.com/mp/collect?measurement_id=' +
    encodeURIComponent(measurementId) + '&api_secret=' + encodeURIComponent(apiSecret);

  var res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var code = res.getResponseCode();
  // MP returns 204 No Content on success
  return { ok: code >= 200 && code < 300, http: code, body: res.getContentText() };
}

function testGa4() {
  var r = sendGa4Lead_({
    page: 'https://votpickleball-prova.pages.dev/thank-you',
    utm_source: 'test',
    utm_medium: 'apps_script',
    utm_campaign: 'ga4_mp_test'
  });
  Logger.log(JSON.stringify(r));
}

// ─── TikTok Events API (server-side) ────────────────────────

/**
 * Gửi event SubmitForm lên TikTok Events API (web).
 * Docs: POST /open_api/v1.3/event/track/
 * Header: Access-Token
 */
function sendTikTokSubmitForm_(data) {
  var props = PropertiesService.getScriptProperties();
  var accessToken = (props.getProperty('TIKTOK_ACCESS_TOKEN') || '').trim();
  var pixelId = (props.getProperty('TIKTOK_PIXEL_ID') || DEFAULT_TIKTOK_PIXEL).trim();

  if (!accessToken) {
    return { ok: false, error: 'Chưa set TIKTOK_ACCESS_TOKEN trong Script properties' };
  }

  var phoneNorm = normalizePhone_(data.phone || ''); // 84xxxxxxxxx
  var eventTime = Math.floor(Date.now() / 1000);
  var eventId = 'tt_prova_' + eventTime + '_' + (phoneNorm.slice(-6) || Utilities.getUuid().slice(0, 8));

  var user = {};
  if (phoneNorm) {
    // TikTok: SHA256 of E.164 with leading +
    user.phone = sha256Hex_('+' + phoneNorm);
  }
  if (data.user_agent) user.user_agent = String(data.user_agent);
  if (data.ttclid) user.ttclid = String(data.ttclid);
  if (data.ip) user.ip = String(data.ip);
  // external_id optional from phone hash
  if (phoneNorm) user.external_id = sha256Hex_(phoneNorm);

  var pageUrl = data.page || 'https://votpickleball-prova.pages.dev/thank-you';
  var payload = {
    event_source: 'web',
    event_source_id: pixelId,
    data: [{
      event: 'SubmitForm',
      event_time: eventTime,
      event_id: eventId,
      user: user,
      page: {
        url: pageUrl
      },
      properties: {
        currency: 'VND',
        value: SALE_VALUE,
        content_type: 'product',
        contents: [{
          content_id: 'prova-ultimate-3.5',
          content_name: 'Prova Ultimate 3.5',
          content_category: 'Pickleball',
          quantity: 1,
          price: SALE_VALUE
        }]
      }
    }]
  };

  // Test events (tuỳ chọn): set TIKTOK_TEST_EVENT_CODE trong properties
  var testCode = (props.getProperty('TIKTOK_TEST_EVENT_CODE') || '').trim();
  if (testCode) {
    payload.test_event_code = testCode;
  }

  var url = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';
  var res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Access-Token': accessToken
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var code = res.getResponseCode();
  var body = res.getContentText();
  console.log('TikTok Events API HTTP ' + code + ': ' + body);

  var ok = false;
  try {
    var parsed = JSON.parse(body);
    ok = code >= 200 && code < 300 && (parsed.code === 0 || parsed.message === 'OK' || parsed.code === undefined);
    // TikTok success usually { code: 0, message: "OK", ... }
    if (parsed.code === 0) ok = true;
  } catch (e) {
    ok = code >= 200 && code < 300;
  }

  return { ok: ok, http: code, event_id: eventId, body: body };
}

// ─── Meta CRM / CAPI (tuỳ chọn) ─────────────────────────────

function sendMetaCrmLead_(data) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('META_ACCESS_TOKEN');
  var datasetId = props.getProperty('META_DATASET_ID') || '1700938823637870';

  if (!token) {
    return { ok: false, error: 'Chưa set META_ACCESS_TOKEN (bỏ qua nếu chỉ dùng Telegram)' };
  }

  var phoneNorm = normalizePhone_(data.phone || '');
  var userData = {};
  if (phoneNorm) userData.ph = [sha256Hex_(phoneNorm)];
  var nameParts = splitName_(data.name || '');
  if (nameParts.first) userData.fn = [sha256Hex_(nameParts.first)];
  if (nameParts.last) userData.ln = [sha256Hex_(nameParts.last)];
  if (data.user_agent) userData.client_user_agent = String(data.user_agent);
  if (data.fbclid) userData.fbc = 'fb.1.' + Math.floor(Date.now() / 1000) + '.' + data.fbclid;
  if (data.fbp) userData.fbp = String(data.fbp);

  var eventTime = Math.floor(Date.now() / 1000);
  var payload = {
    data: [{
      event_name: 'Lead',
      event_time: eventTime,
      event_id: 'prova_' + eventTime + '_' + (phoneNorm.slice(-4) || '0'),
      action_source: 'system_generated',
      custom_data: {
        event_source: 'crm',
        lead_event_source: LEAD_EVENT_SOURCE,
        content_name: 'Prova Ultimate 3.5',
        currency: 'VND',
        value: 1060000
      },
      user_data: userData
    }]
  };

  var testCode = props.getProperty('META_TEST_EVENT_CODE');
  if (testCode) payload.test_event_code = testCode;

  var url = 'https://graph.facebook.com/v25.0/' + datasetId + '/events?access_token=' + encodeURIComponent(token);
  var res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  return {
    ok: res.getResponseCode() >= 200 && res.getResponseCode() < 300,
    http: res.getResponseCode(),
    body: res.getContentText()
  };
}

function normalizePhone_(phone) {
  if (!phone) return '';
  var d = String(phone).replace(/\D/g, '');
  if (!d) return '';
  if (d.charAt(0) === '0') d = '84' + d.substring(1);
  else if (d.length === 9) d = '84' + d;
  return d;
}

function splitName_(full) {
  full = String(full || '').trim().toLowerCase();
  if (!full) return { first: '', last: '' };
  var parts = full.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[parts.length - 1], last: parts.slice(0, -1).join(' ') };
}

function sha256Hex_(value) {
  var normalized = String(value).trim().toLowerCase();
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, normalized, Utilities.Charset.UTF_8);
  return raw.map(function (b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
