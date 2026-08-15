/**
 * Load Meta Pixel + PageView
 * Advanced Matching: set window.PROVA_PIXEL_USER = { ph, fn, ln } trước khi load (tuỳ chọn)
 */
(function () {
  var cfg = window.PROVA_TRACKING || {};
  var id = cfg.META_PIXEL_ID;
  if (!id || id === 'YOUR_META_PIXEL_ID' || !/^\d+$/.test(String(id))) {
    console.warn('[Prova] Chưa cấu hình META_PIXEL_ID trong assets/tracking-config.js');
    return;
  }

  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  var advanced = window.PROVA_PIXEL_USER || {};
  var initPayload = {};
  if (advanced.ph) initPayload.ph = advanced.ph;
  if (advanced.fn) initPayload.fn = advanced.fn;
  if (advanced.ln) initPayload.ln = advanced.ln;
  if (advanced.em) initPayload.em = advanced.em;

  if (Object.keys(initPayload).length) {
    fbq('init', String(id), initPayload);
  } else {
    fbq('init', String(id));
  }
  fbq('track', 'PageView');

  // ViewContent trên landing (tắt: data-meta-view-content="0" trên <html>)
  try {
    var skipVc =
      document.documentElement.getAttribute('data-meta-view-content') === '0' ||
      document.body.getAttribute('data-meta-view-content') === '0';
    if (!skipVc) {
      var p = (cfg.PRODUCT) || {};
      fbq('track', 'ViewContent', {
        content_ids: [p.content_id || 'prova-ultimate-3.5'],
        content_name: p.content_name || 'Prova Ultimate 3.5',
        content_type: 'product',
        content_category: p.content_category || 'Pickleball Paddle',
        value: p.value != null ? p.value : 990000,
        currency: p.currency || 'VND'
      });
    }
  } catch (e) {}
})();
