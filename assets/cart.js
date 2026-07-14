// Cart state, backed by localStorage, shared across all pages.
// Item key format: "card:<cardId>" or "addon:<groupId>:<itemId>".
(function () {
  var STORAGE_KEY = 'bswCart';

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function save(keys) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(keys)); } catch (e) {}
  }

  function resolveItem(key) {
    var pricing = window.BSW_PRICING;
    if (!pricing) return null;
    var parts = key.split(':');
    if (parts[0] === 'card') {
      var card = pricing.cards.filter(function (c) { return c.id === parts[1]; })[0];
      if (!card) return null;
      return { key: key, kind: 'card', title: card.title, byn: card.byn, bynMonthly: card.bynMonthly, usd: card.usd, usdMonthly: card.usdMonthly, note: card.note };
    }
    if (parts[0] === 'addon') {
      var group = pricing.addonGroups.filter(function (g) { return g.id === parts[1]; })[0];
      var item = group && group.items.filter(function (i) { return i.id === parts[2]; })[0];
      if (!item) return null;
      return { key: key, kind: 'addon', title: item.title, byn: item.byn, bynMonthly: item.bynMonthly, usd: item.usd, usdMonthly: item.usdMonthly, note: item.note };
    }
    return null;
  }

  function formatPrice(byn, usd, currency, rates) {
    if (currency === 'BYN') {
      if (byn == null) return null;
      return Math.round(byn).toLocaleString('ru-RU') + ' BYN';
    }
    if (currency === 'USD') {
      if (usd == null) return null;
      return '$' + Math.round(usd).toLocaleString('en-US');
    }
    if (byn == null || !window.BSW) return null;
    return window.BSW.formatByn(byn, currency, rates);
  }

  function numericPrice(byn, usd, currency, rates) {
    if (currency === 'BYN') return byn == null ? null : Math.round(byn);
    if (currency === 'USD') return usd == null ? null : Math.round(usd);
    if (byn == null || !window.BSW) return null;
    return window.BSW.convertByn(byn, currency, rates);
  }

  var lastBadgeCount = null;

  function updateBadges() {
    var count = load().length;
    var changed = lastBadgeCount !== null && count !== lastBadgeCount;
    document.querySelectorAll('[data-cart-badge]').forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? '' : 'none';
      if (changed && count > 0) {
        el.classList.remove('bsw-badge-pop');
        void el.offsetWidth; // restart the animation even if it's already applied
        el.classList.add('bsw-badge-pop');
      }
    });
    lastBadgeCount = count;
  }

  window.BSW_CART = {
    isInCart: function (key) { return load().indexOf(key) !== -1; },

    toggle: function (key) {
      var keys = load();
      var idx = keys.indexOf(key);
      if (idx === -1) keys.push(key); else keys.splice(idx, 1);
      save(keys);
      updateBadges();
      return idx === -1; // true = now in cart
    },

    remove: function (key) {
      var keys = load().filter(function (k) { return k !== key; });
      save(keys);
      updateBadges();
    },

    clear: function () { save([]); updateBadges(); },

    getKeys: function () { return load(); },

    getCount: function () { return load().length; },

    // Resolved cart lines with a display-ready price, for a given currency/rates
    // (get these from window.BSW.onReady).
    getLines: function (currency, rates) {
      return load().map(resolveItem).filter(Boolean).map(function (item) {
        return {
          key: item.key,
          kind: item.kind,
          title: item.title,
          note: item.note,
          onceText: formatPrice(item.byn, item.usd, currency, rates),
          monthlyText: formatPrice(item.bynMonthly, item.usdMonthly, currency, rates),
          onceRaw: numericPrice(item.byn, item.usd, currency, rates),
          monthlyRaw: numericPrice(item.bynMonthly, item.usdMonthly, currency, rates)
        };
      });
    },

    getTotals: function (currency, rates) {
      var lines = this.getLines(currency, rates);
      var once = 0, monthly = 0;
      lines.forEach(function (l) {
        if (l.onceRaw) once += l.onceRaw;
        if (l.monthlyRaw) monthly += l.monthlyRaw;
      });
      var suffix = currency === 'BYN' ? ' BYN' : currency === 'USD' ? '' : (currency === 'RUB' ? ' ₽' : ' ' + currency);
      var prefix = currency === 'USD' ? '$' : '';
      var locale = currency === 'BYN' ? 'ru-RU' : 'en-US';
      return {
        onceRaw: once,
        monthlyRaw: monthly,
        onceText: once > 0 ? prefix + once.toLocaleString(locale) + suffix : null,
        monthlyText: monthly > 0 ? prefix + monthly.toLocaleString(locale) + suffix : null
      };
    },

    updateBadges: updateBadges
  };

  document.addEventListener('DOMContentLoaded', updateBadges);
  if (document.readyState !== 'loading') updateBadges();
})();
