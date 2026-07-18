/**
 * Prova Ultimate 3.5 – Form → Google Sheet + Telegram + Meta CAPI (tuỳ chọn)
 *
 * ===== SCRIPT PROPERTIES (bắt buộc cho Telegram) =====
 * Project Settings (bánh răng) → Script properties:
 *
 *   TELEGRAM_BOT_TOKEN  = 123456:ABC-DEF...   (từ @BotFather)
 *   TELEGRAM_CHAT_ID    = 123456789           (số chat_id của bạn)
 *
 * Tuỳ chọn Meta:
 *   META_ACCESS_TOKEN, META_DATASET_ID=1700938823637870
 *
 * Sau khi sửa code: Deploy → Manage deployments → Edit → New version → Deploy
 * Execute as: Me | Who has access: Anyone
 */

var SHEET_NAME = 'DonHang';
var LEAD_EVENT_SOURCE = 'Prova Landing CRM';
var HOTLINE = '0868.93.16.91';

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

    // 1) Telegram – báo đơn mới (ưu tiên)
    var tgResult = { skipped: true };
    try {
      tgResult = sendTelegramOrder_(data, now);
    } catch (tgErr) {
      tgResult = { ok: false, error: String(tgErr) };
      console.error('Telegram error: ' + tgErr);
    }

    // 2) Meta CAPI (tuỳ chọn – không chặn đơn)
    var metaResult = { skipped: true };
    try {
      metaResult = sendMetaCrmLead_(data);
    } catch (metaErr) {
      metaResult = { ok: false, error: String(metaErr) };
      console.error('Meta CAPI error: ' + metaErr);
    }

    return jsonResponse({
      result: 'success',
      message: 'OK',
      telegram: tgResult,
      meta: metaResult
    });
  } catch (err) {
    // Cố gắng báo lỗi qua Telegram
    try {
      sendTelegramText_('⚠️ Lỗi form Prova: ' + String(err));
    } catch (e2) {}
    return jsonResponse({ result: 'error', message: String(err) });
  }
}

function doGet() {
  return jsonResponse({
    result: 'ok',
    message: 'Prova form endpoint. POST = Sheet + Telegram + Meta.'
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

// ─── Telegram ───────────────────────────────────────────────

function sendTelegramOrder_(data, timeStr) {
  var name = data.name || '(không tên)';
  var phone = data.phone || '';
  var color = data.color || '';
  var address = data.address || '';
  var src = data.utm_source || 'trực tiếp';
  var camp = data.utm_campaign || '';

  var lines = [
    '🏓 *ĐƠN MỚI – Prova Ultimate 3.5*',
    '',
    '⏰ ' + escapeMd_(timeStr || ''),
    '👤 ' + escapeMd_(name),
    '📱 `' + escapeMd_(phone) + '`',
    '🎨 Màu: ' + escapeMd_(color),
    '📍 ' + escapeMd_(address),
    '',
    '📣 Nguồn: ' + escapeMd_(src) + (camp ? ' / ' + escapeMd_(camp) : ''),
    '',
    '☎️ Gọi ngay: ' + escapeMd_(HOTLINE)
  ];

  return sendTelegramText_(lines.join('\n'), true);
}

function sendTelegramText_(text, useMarkdown) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('TELEGRAM_BOT_TOKEN');
  var chatId = props.getProperty('TELEGRAM_CHAT_ID');

  if (!token || !chatId) {
    return {
      ok: false,
      error: 'Chưa set TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong Script properties. Xem HUONG-DAN-TELEGRAM.md'
    };
  }

  var payload = {
    chat_id: chatId,
    text: text,
    disable_web_page_preview: true
  };
  if (useMarkdown) {
    payload.parse_mode = 'Markdown';
  }

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

function escapeMd_(s) {
  return String(s || '').replace(/([_*`\[])/g, '\\$1');
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
