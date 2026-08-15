/**
 * TikTok Pixel – PageView
 * Event chuyển đổi (SubmitForm) bắn trên thank-you.html
 */
(function () {
  var cfg = window.PROVA_TRACKING || {};
  var id = cfg.TIKTOK_PIXEL_ID;
  if (!id || id === 'YOUR_TIKTOK_PIXEL_ID') {
    console.warn('[Prova] Chưa cấu hình TIKTOK_PIXEL_ID');
    return;
  }

  !(function (w, d, t) {
    w.TiktokAnalyticsObject = t;
    var ttq = (w[t] = w[t] || []);
    ttq.methods = [
      'page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once',
      'ready', 'alias', 'group', 'enableCookie', 'disableCookie',
      'holdConsent', 'revokeConsent', 'grantConsent'
    ];
    ttq.setAndDefer = function (t, e) {
      t[e] = function () {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (t) {
      for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
      return e;
    };
    ttq.load = function (e, n) {
      var r = 'https://analytics.tiktok.com/i18n/pixel/events.js';
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = r;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};
      var s = document.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.src = r + '?sdkid=' + e + '&lib=' + t;
      var first = document.getElementsByTagName('script')[0];
      first.parentNode.insertBefore(s, first);
    };

    ttq.load(String(id));
    ttq.page();

    // ViewContent trên landing (tắt: data-tt-view-content="0" trên <html>)
    try {
      var skipVc =
        document.documentElement.getAttribute('data-tt-view-content') === '0' ||
        (document.body && document.body.getAttribute('data-tt-view-content') === '0');
      if (!skipVc) {
        var p = (window.PROVA_TRACKING && window.PROVA_TRACKING.PRODUCT) || {};
        ttq.track('ViewContent', {
          contents: [
            {
              content_id: p.content_id || 'prova-ultimate-3.5',
              content_type: 'product',
              content_name: p.content_name || 'Prova Ultimate 3.5'
            }
          ],
          value: p.value != null ? p.value : 990000,
          currency: p.currency || 'VND'
        });
      }
    } catch (e) {}
  })(window, document, 'ttq');
})();
