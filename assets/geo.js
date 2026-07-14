(function () {
  var CIS = { RU: 'RUB', KZ: 'KZT', AM: 'AMD', AZ: 'AZN', KG: 'KGS', MD: 'MDL', TJ: 'TJS', TM: 'TMT', UZ: 'UZS' };
  var readyCallbacks = [];
  var resolved = null; // { country, currency, rates } once known

  // USD/EU market pricing is not a raw FX pass-through: local (BYN/CIS) prices reflect
  // local cost of living, which is far below what freelance work like this commands in
  // the US/EU. A flat multiplier plus psychological (…9) rounding keeps prices in line
  // with typical Western freelance rates instead of underselling the work.
  var USD_MULTIPLIER = 4;

  function convertByn(byn, currency, rates) {
    if (!rates || !rates[currency]) return null;
    var raw = byn * rates[currency];
    if (currency === 'USD') raw *= USD_MULTIPLIER;
    // Psychological (charm) pricing: round to the nearest 10 and end in 9.
    var val = Math.round(raw / 10) * 10 - 1;
    if (val < 9) val = 9;
    if (!isFinite(val)) return null;
    return val;
  }

  function fmt(byn, currency, rates) {
    var val = convertByn(byn, currency, rates);
    if (val === null) return null;
    var num = val.toLocaleString('en-US');
    if (currency === 'USD') return '$' + num;
    if (currency === 'RUB') return num + ' ₽';
    return num + ' ' + currency;
  }

  function applyPrices(currency, rates) {
    document.querySelectorAll('[data-byn]').forEach(function (el) {
      var byn = parseFloat(el.getAttribute('data-byn'));
      var text = fmt(byn, currency, rates);
      if (text === null) return;
      var cur = el.nextElementSibling;
      if (cur && cur.hasAttribute('data-cur')) {
        var spaceIdx = text.indexOf(' ');
        if (spaceIdx === -1) { el.textContent = text; cur.textContent = ''; }
        else { el.textContent = text.slice(0, spaceIdx); cur.textContent = text.slice(spaceIdx + 1); }
      } else {
        el.textContent = text;
      }
    });
  }

  function localizeDemoPrices(currency, rates) {
    document.querySelectorAll('[data-usd]').forEach(function (el) {
      if (currency === 'USD') return;
      if (!rates || !rates[currency] || !rates['USD']) return;
      var local = parseFloat(el.getAttribute('data-usd')) * (rates[currency] / rates['USD']);
      var val = local >= 100 ? Math.round(local / 10) * 10 : Math.round(local);
      if (!isFinite(val) || val <= 0) return;
      var num = val.toLocaleString('en-US');
      el.textContent = currency === 'RUB' ? num + ' ₽' : num + ' ' + currency;
    });
  }

  function applyEnglish() {
    document.documentElement.setAttribute('lang', 'en');
    document.querySelectorAll('[data-en]').forEach(function (el) {
      el.innerHTML = el.getAttribute('data-en');
    });
    document.querySelectorAll('[data-en-placeholder]').forEach(function (el) {
      el.setAttribute('placeholder', el.getAttribute('data-en-placeholder'));
    });
  }

  // localStorage (not sessionStorage) so the detected country/rates survive
  // navigating between pages reliably, with a TTL so they don't go stale.
  var CACHE_TTL_MS = 24 * 60 * 60 * 1000;

  function cacheGet(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      var entry = JSON.parse(raw);
      if (!entry || Date.now() - entry.t > CACHE_TTL_MS) return null;
      return entry.v;
    } catch (e) { return null; }
  }

  function cacheSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify({ v: value, t: Date.now() })); } catch (e) {}
  }

  function withRates(cb) {
    var cached = cacheGet('bswRates');
    if (cached) { cb(cached); return; }
    fetch('https://open.er-api.com/v6/latest/BYN')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.rates) {
          cacheSet('bswRates', data.rates);
          cb(data.rates);
        }
      })
      .catch(function () {});
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function resolve(country, currency, rates) {
    ready(function () {
      resolved = { country: country || 'BY', currency: currency, rates: rates || null };
      readyCallbacks.forEach(function (cb) { cb(resolved.currency, resolved.rates, resolved.country); });
      readyCallbacks.length = 0;
    });
  }

  function run(countryCode) {
    if (!countryCode || countryCode === 'BY') { resolve(countryCode, 'BYN', null); return; }
    var currency = CIS[countryCode] || 'USD';
    ready(function () {
      if (!CIS[countryCode]) applyEnglish();
      withRates(function (rates) {
        applyPrices(currency, rates);
        localizeDemoPrices(currency, rates);
        resolve(countryCode, currency, rates);
      });
    });
  }

  window.BSW = {
    // Registers cb(currency, rates, country) to run once the region/rates are
    // known (immediately if already resolved). currency is 'BYN' for BY/unknown
    // visitors (show base prices as-is), a CIS currency code, or 'USD'.
    onReady: function (cb) {
      if (resolved) { ready(function () { cb(resolved.currency, resolved.rates, resolved.country); }); }
      else { readyCallbacks.push(cb); }
    },
    // Same BYN->currency formula used for all existing on-page prices.
    formatByn: fmt,
    convertByn: convertByn,
    isCIS: function (countryCode) { return !!CIS[countryCode]; }
  };

  var cachedCountry = cacheGet('bswCountry');
  if (cachedCountry) { run(cachedCountry); return; }

  fetch('https://ipwho.is/')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var cc = (data && data.country_code) || '';
      cacheSet('bswCountry', cc);
      run(cc);
    })
    .catch(function () { resolve('', 'BYN', null); });
})();
