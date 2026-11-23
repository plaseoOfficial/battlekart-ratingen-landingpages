/* Öffentlicher Projektschlüssel und Ingestion-Host aus demselben BK-Projekt. */
(function () {
  'use strict';
  const projectToken = 'phc_yqTFHTEuhVjbJSFLvkw8cLeKj27bZqnyg9H8FyAbxrZU';
  const ingestionHost = 'https://eu.i.posthog.com';
  if (!projectToken || !ingestionHost) return;

  const page = document.currentScript.dataset.page;
  const params = new URLSearchParams(location.search);
  const isKart = page === 'kart';
  const variants = isKart
    ? ['jga', 'geburtstag', 'firma', 'weihnachtsfeier', 'gaming', 'freunde']
    : ['kart', 'gamer', 'erlebnis', 'lastminute'];
  const variant = params.get(isKart ? 'anlass' : 'gruppe');
  const context = {
    landing_page: page,
    variant: variants.includes(variant) ? variant : (isKart ? 'standard' : 'kart'),
    $geoip_disable: true,
    $process_person_profile: false
  };
  for (const name of ['utm_campaign', 'utm_source', 'utm_medium', 'utm_content']) {
    const value = params.get(name);
    if (value && /^[\p{L}\p{N} _.-]{1,120}$/u.test(value)) context[name] = value;
  }

  const consentKey = 'bk_posthog_consent_v1';
  let visitId = null;
  let calculatorUsed = false;
  function capture(event, properties) {
    if (!visitId) return;
    const body = JSON.stringify({
      api_key: projectToken, distinct_id: visitId, event,
      timestamp: new Date().toISOString(),
      properties: Object.assign({}, context, properties)
    });
    fetch(ingestionHost + '/i/v0/e/', {
      method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer',
      headers: { 'Content-Type': 'application/json' }, body, keepalive: true
    }).catch(function () { /* Tracking darf die Navigation nicht unterbrechen. */ });
  }

  function readChoice() {
    try { return localStorage.getItem(consentKey); } catch { return null; }
  }
  function setActive(granted) {
    if (!granted) {
      visitId = null;
      calculatorUsed = false;
    } else if (!visitId) {
      visitId = crypto.randomUUID();
      context.viewport = matchMedia('(max-width: 767px)').matches ? 'schmal' : 'breit';
      capture('bk_landing_view');
    }
  }
  function restore() {
    let googleChoice;
    try { googleChoice = localStorage.getItem('bk_consent'); } catch {}
    setActive(googleChoice === 'granted' && readChoice() === 'granted');
  }
  window.bkPostHog = {
    needsChoice: function () { return readChoice() === null; },
    choose: function (choice) {
      try { localStorage.setItem(consentKey, choice); } catch {}
      setActive(choice === 'granted');
    }
  };
  window.addEventListener('storage', restore);
  window.addEventListener('pageshow', function (e) { if (e.persisted) restore(); });
  restore();

  document.addEventListener('click', function (e) {
    if (!visitId || !e.isTrusted || !(e.target instanceof Element)) return;
    if (!calculatorUsed && e.target.closest('#a-plus, #a-minus, #k-plus, #k-minus, #games button')) {
      calculatorUsed = true;
      capture('bk_calculator_used');
    }
    const link = e.target.closest('a.js-book, a[href*="battlekart.com"][href*="/giftcards"]');
    if (link) {
      capture(link.classList.contains('js-book') ? 'bk_booking_click' : 'bk_gift_shop_click', {
        cta: link.dataset.cta, calculator_used: calculatorUsed
      });
    }
  });
})();
