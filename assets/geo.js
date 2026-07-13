(function () {
  var CIS = { RU: 'RUB', KZ: 'KZT', AM: 'AMD', AZ: 'AZN', KG: 'KGS', MD: 'MDL', TJ: 'TJS', TM: 'TMT', UZ: 'UZS' };

  // USD/EU market pricing is not a raw FX pass-through: local (BYN/CIS) prices reflect
  // local cost of living, which is far below what freelance work like this commands in
  // the US/EU. A flat multiplier plus psychological (…9) rounding keeps prices in line
  // with typical Western freelance rates instead of underselling the work.
  var USD_MULTIPLIER = 4;

  function fmt(byn, currency, rates) {
    if (!rates || !rates[currency]) return null;
    var raw = byn * rates[currency];
    if (currency === 'USD') raw *= USD_MULTIPLIER;
    // Psychological (charm) pricing: round to the nearest 10 and end in 9.
    var val = Math.round(raw / 10) * 10 - 1;
    if (val < 9) val = 9;
    if (!isFinite(val)) return null;
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

  function applyEnglish() {
    document.documentElement.setAttribute('lang', 'en');
    document.querySelectorAll('[data-en]').forEach(function (el) {
      el.innerHTML = el.getAttribute('data-en');
    });
    document.querySelectorAll('[data-en-placeholder]').forEach(function (el) {
      el.setAttribute('placeholder', el.getAttribute('data-en-placeholder'));
    });
  }

  function withRates(cb) {
    var cached = sessionStorage.getItem('bswRates');
    if (cached) { cb(JSON.parse(cached)); return; }
    fetch('https://open.er-api.com/v6/latest/BYN')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.rates) {
          sessionStorage.setItem('bswRates', JSON.stringify(data.rates));
          cb(data.rates);
        }
      })
      .catch(function () {});
  }

  function run(countryCode) {
    if (!countryCode || countryCode === 'BY') return;
    var currency = CIS[countryCode] || 'USD';
    if (!CIS[countryCode]) applyEnglish();
    withRates(function (rates) { applyPrices(currency, rates); });
  }

  var cachedCountry = sessionStorage.getItem('bswCountry');
  if (cachedCountry) { run(cachedCountry); return; }

  fetch('https://ipwho.is/')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var cc = (data && data.country_code) || '';
      sessionStorage.setItem('bswCountry', cc);
      run(cc);
    })
    .catch(function () {});
})();
