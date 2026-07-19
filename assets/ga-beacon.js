/**
 * GA4 robust collector:
 * 1) Official gtag (if not already)
 * 2) Direct /g/collect beacon (works even when gtag script is delayed)
 * Does NOT replace gtag — complements it.
 */
(function () {
  var MEASUREMENT_ID = (window.PROVA_TRACKING && window.PROVA_TRACKING.GA_MEASUREMENT_ID) || 'G-YBRL7V8BTM';

  function uuid() {
    try {
      if (crypto && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) {}
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function getCid() {
    var key = '_ga_cid';
    try {
      var existing = localStorage.getItem(key);
      if (existing) return existing;
      var id = uuid();
      localStorage.setItem(key, id);
      return id;
    } catch (e) {
      return uuid();
    }
  }

  function sendCollect(eventName, extra) {
    var cid = getCid();
    var params = new URLSearchParams();
    params.set('v', '2');
    params.set('tid', MEASUREMENT_ID);
    params.set('cid', cid);
    params.set('en', eventName || 'page_view');
    params.set('dl', location.href);
    params.set('dr', document.referrer || '');
    params.set('dt', document.title || '');
    params.set('ul', (navigator.language || 'vi').toLowerCase());
    params.set('sr', (screen.width || 0) + 'x' + (screen.height || 0));
    params.set('sid', String(Math.floor(Date.now() / 1000)));
    params.set('sct', '1');
    params.set('seg', '1');
    params.set('_s', '1');
    if (extra) {
      Object.keys(extra).forEach(function (k) {
        if (extra[k] != null && extra[k] !== '') params.set(k, String(extra[k]));
      });
    }
    var url = 'https://www.google-analytics.com/g/collect?' + params.toString();
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url);
      } else {
        var img = new Image();
        img.src = url;
      }
    } catch (e) {
      fetch(url, { method: 'POST', mode: 'no-cors', keepalive: true }).catch(function () {});
    }
  }

  // Ensure gtag exists
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function () { window.dataLayer.push(arguments); };
  }

  // Page view via beacon (always)
  sendCollect('page_view');

  // Also nudge gtag if loaded
  try {
    if (typeof gtag === 'function') {
      gtag('event', 'page_view', {
        page_title: document.title,
        page_location: location.href
      });
    }
  } catch (e) {}

  // Expose for thank-you / form
  window.provaGaEvent = function (name, extra) {
    sendCollect(name, extra);
    try {
      if (typeof gtag === 'function') gtag('event', name, extra || {});
    } catch (e) {}
  };
})();
