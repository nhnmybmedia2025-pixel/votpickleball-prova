/**
 * Prova Ultimate 3.5 – Form → Google Sheet + Meta CRM / Conversions API
 *
 * SETUP:
 * 1. Dán code này vào Apps Script (gắn với Sheet đơn hàng)
 * 2. Project Settings (bánh răng) → Script properties → Add:
 *      META_ACCESS_TOKEN  = <mã từ nút "Tạo mã truy cập" trong Events Manager>
 *      META_DATASET_ID    = 1700938823637870
 *      META_PIXEL_ID      = 4340331656281072   (tuỳ chọn, log)
 * 3. Deploy → Manage deployments → Edit → New version → Deploy
 *    (Execute as: Me | Who has access: Anyone)
 */

var SHEET_NAME = 'DonHang';
var LEAD_EVENT_SOURCE = 'Prova Landing CRM'; // tên CRM hiển thị trên Meta

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

    // Gửi sự kiện Lead lên Meta (CRM / CAPI) — không chặn form nếu Meta lỗi
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
      meta: metaResult
    });
  } catch (err) {
    return jsonResponse({ result: 'error', message: String(err) });
  }
}

function doGet() {
  return jsonResponse({
    result: 'ok',
    message: 'Prova form endpoint. POST = đơn hàng → Sheet + Meta Lead CRM.'
  });
}

/** Test nhanh trong Apps Script editor: Run → testMetaLead */
function testMetaLead() {
  var r = sendMetaCrmLead_({
    name: 'Test Meta CAPI',
    phone: '0901234567',
    color: 'Red',
    address: 'Test',
    fbclid: '',
    user_agent: 'AppsScript-test',
    page: 'https://votpickleball-prova.pages.dev/thank-you.html'
  });
  Logger.log(JSON.stringify(r));
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

// ─── Meta CRM / Conversions API ─────────────────────────────

/**
 * Payload theo hướng dẫn Meta "Gửi sự kiện CRM":
 * action_source = system_generated
 * custom_data.event_source = crm
 * user_data.ph = SHA256(số điện thoại chuẩn hoá)
 */
function sendMetaCrmLead_(data) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('META_ACCESS_TOKEN');
  var datasetId = props.getProperty('META_DATASET_ID') || '1700938823637870';

  if (!token) {
    return {
      ok: false,
      error: 'Chưa set Script property META_ACCESS_TOKEN. Xem HUONG-DAN-META-CRM.md'
    };
  }

  var phoneNorm = normalizePhone_(data.phone || '');
  var userData = {};

  if (phoneNorm) {
    userData.ph = [sha256Hex_(phoneNorm)];
  }

  // Tách họ / tên nếu có (Advanced Matching – trung bình)
  var nameParts = splitName_(data.name || '');
  if (nameParts.first) userData.fn = [sha256Hex_(nameParts.first)];
  if (nameParts.last) userData.ln = [sha256Hex_(nameParts.last)];

  if (data.user_agent) {
    userData.client_user_agent = String(data.user_agent);
  }

  // fbc từ fbclid (giúp khớp click ads)
  if (data.fbclid) {
    userData.fbc = 'fb.1.' + Math.floor(Date.now() / 1000) + '.' + data.fbclid;
  }
  if (data.fbp) {
    userData.fbp = String(data.fbp);
  }

  var eventTime = Math.floor(Date.now() / 1000);
  var eventId = 'prova_' + eventTime + '_' + phoneNorm.slice(-4);

  var payload = {
    data: [
      {
        event_name: 'Lead',
        event_time: eventTime,
        event_id: eventId, // dedupe với browser pixel nếu dùng cùng event_id
        action_source: 'system_generated',
        custom_data: {
          event_source: 'crm',
          lead_event_source: LEAD_EVENT_SOURCE,
          content_name: 'Prova Ultimate 3.5',
          currency: 'VND',
          value: 1060000
        },
        user_data: userData
      }
    ]
  };

  // Test events (tuỳ chọn): set property META_TEST_EVENT_CODE
  var testCode = props.getProperty('META_TEST_EVENT_CODE');
  if (testCode) {
    payload.test_event_code = testCode;
  }

  var url = 'https://graph.facebook.com/v25.0/' + datasetId + '/events?access_token=' + encodeURIComponent(token);

  var res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var code = res.getResponseCode();
  var body = res.getContentText();
  var ok = code >= 200 && code < 300;

  console.log('Meta CAPI HTTP ' + code + ': ' + body);

  return {
    ok: ok,
    http: code,
    event_id: eventId,
    body: body
  };
}

function normalizePhone_(phone) {
  if (!phone) return '';
  var d = String(phone).replace(/\D/g, '');
  if (!d) return '';
  // VN: 0xxxxxxxxx → 84xxxxxxxxx
  if (d.charAt(0) === '0') {
    d = '84' + d.substring(1);
  } else if (d.length === 9) {
    d = '84' + d;
  }
  return d;
}

function splitName_(full) {
  full = String(full || '').trim().toLowerCase();
  if (!full) return { first: '', last: '' };
  var parts = full.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  return {
    first: parts[parts.length - 1], // tên (VN: cuối)
    last: parts.slice(0, -1).join(' ') // họ đệm
  };
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
