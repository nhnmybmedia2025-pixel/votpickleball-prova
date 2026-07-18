/**
 * Prova Ultimate 3.5 – Form → Google Sheet
 *
 * CÁCH DÙNG:
 * 1. Tạo Google Sheet mới
 * 2. Extensions → Apps Script → dán toàn bộ file này
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy Web App URL → dán vào GOOGLE_SCRIPT_URL trong index.html
 */

var SHEET_NAME = 'DonHang'; // tên sheet tab (tự tạo nếu chưa có)

function doPost(e) {
  try {
    var data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        'Thời gian',
        'Họ tên',
        'Số điện thoại',
        'Màu vợt',
        'Địa chỉ',
        'Nguồn (utm_source)',
        'Chiến dịch (utm_campaign)',
        'Medium (utm_medium)',
        'fbclid',
        'ttclid',
        'User Agent',
        'Trang'
      ]);
      sheet.setFrozenRows(1);
    }

    // Nếu sheet mới tạo nhưng đã có header từ lần trước — bỏ qua
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Thời gian',
        'Họ tên',
        'Số điện thoại',
        'Màu vợt',
        'Địa chỉ',
        'Nguồn (utm_source)',
        'Chiến dịch (utm_campaign)',
        'Medium (utm_medium)',
        'fbclid',
        'ttclid',
        'User Agent',
        'Trang'
      ]);
      sheet.setFrozenRows(1);
    }

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

    return jsonResponse({ result: 'success', message: 'OK' });
  } catch (err) {
    return jsonResponse({ result: 'error', message: String(err) });
  }
}

function doGet() {
  return jsonResponse({
    result: 'ok',
    message: 'Prova form endpoint đang chạy. Dùng POST để gửi đơn hàng.'
  });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
