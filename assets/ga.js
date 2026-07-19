/**
 * Google Analytics 4 (gtag) – config only
 * Event generate_lead bắn trên thank-you.html
 */
(function () {
  var cfg = window.PROVA_TRACKING || {};
  var id = cfg.GA_MEASUREMENT_ID || 'G-YBRL7V8BTM';
  if (!id || id.indexOf('G-') !== 0) return;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', id, { send_page_view: true });
})();
