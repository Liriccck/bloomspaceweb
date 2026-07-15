/*
 * BloomSpace AI demo chat — только логика, без вёрстки/дизайна.
 * Ожидает, что на странице уже есть такая разметка (id можно поменять —
 * тогда поменяйте и в блоке `els` ниже):
 *
 *   <div id="aiChatMessages"></div>          — сюда рендерятся сообщения
 *   <div id="aiChatChips"></div>             — чипы с быстрыми вопросами
 *   <div id="aiChatTyping" hidden>...</div>  — индикатор "печатает"
 *   <div id="aiChatRemaining"></div>         — "осталось N сообщений"
 *   <form id="aiChatForm">
 *     <input id="aiChatInput" maxlength="1000">
 *     <button type="submit" id="aiChatSend">Send</button>
 *   </form>
 *
 * Подключение на странице (после разметки чата, перед закрывающим </body>):
 *   <script src="https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@4/dist/fp.min.js"></script>
 *   <script src="chat-client.js"></script>
 */
(function () {
  var CONFIG = {
    workerBase: 'https://bloomspaceweb-chat.kiberpomosnik.workers.dev',
    catalogUrl: 'ceny.html',
    formUrl: 'index.html#form'
  };

  var els = {
    messages: document.getElementById('aiChatMessages'),
    chips: document.getElementById('aiChatChips'),
    typing: document.getElementById('aiChatTyping'),
    remaining: document.getElementById('aiChatRemaining'),
    form: document.getElementById('aiChatForm'),
    input: document.getElementById('aiChatInput'),
    send: document.getElementById('aiChatSend')
  };

  if (!els.messages || !els.form || !els.input) return; // разметки чата на этой странице нет

  var history = []; // { role: 'user'|'assistant', content }
  var visitorId = null;
  var locale = 'ru';
  var blocked = false;

  var STRINGS = {
    ru: {
      networkError: 'Не удалось отправить сообщение. Проверьте соединение и попробуйте ещё раз.',
      loadError: 'Не удалось загрузить чат. Обновите страницу.',
      limitCta: 'Добавьте нужную услугу в корзину и оформите заказ — он сразу попадёт менеджеру.',
      catalogBtn: 'Перейти к услугам',
      formBtn: 'Оставить заявку',
      remainingLabel: function (n) { return 'Осталось сообщений: ' + n; }
    },
    en: {
      networkError: 'Could not send the message. Check your connection and try again.',
      loadError: 'Could not load chat. Please refresh the page.',
      limitCta: 'Add the service to your cart and check out — it goes straight to a manager.',
      catalogBtn: 'Browse services',
      formBtn: 'Leave a request',
      remainingLabel: function (n) { return n + ' messages left'; }
    }
  };

  function addMessage(role, text) {
    var row = document.createElement('div');
    row.className = 'ai-chat-msg ai-chat-msg-' + role;
    row.textContent = text;
    els.messages.appendChild(row);
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  function setTyping(on) {
    if (els.typing) els.typing.hidden = !on;
  }

  function setRemaining(n) {
    if (!els.remaining) return;
    els.remaining.textContent = STRINGS[locale].remainingLabel(n);
    els.remaining.style.display = n > 0 ? '' : 'none';
  }

  function clearChips() {
    if (els.chips) els.chips.innerHTML = '';
  }

  function renderChips(list) {
    if (!els.chips) return;
    clearChips();
    list.forEach(function (q) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'ai-chat-chip';
      chip.textContent = q;
      chip.addEventListener('click', function () { sendMessage(q); });
      els.chips.appendChild(chip);
    });
  }

  function lockChat() {
    blocked = true;
    els.input.disabled = true;
    els.send.disabled = true;
  }

  function showLimitReached(message) {
    var s = STRINGS[locale];
    addMessage('assistant', message);

    var actions = document.createElement('div');
    actions.className = 'ai-chat-actions';

    var toCatalog = document.createElement('a');
    toCatalog.href = CONFIG.catalogUrl;
    toCatalog.className = 'ai-chat-action-primary';
    toCatalog.textContent = s.catalogBtn;

    var toForm = document.createElement('a');
    toForm.href = CONFIG.formUrl;
    toForm.className = 'ai-chat-action-secondary';
    toForm.textContent = s.formBtn;

    actions.appendChild(toCatalog);
    actions.appendChild(toForm);
    els.messages.appendChild(actions);
    els.messages.scrollTop = els.messages.scrollHeight;

    lockChat();
  }

  function sendMessage(text) {
    text = (text || '').trim();
    if (!text || blocked) return;

    clearChips();
    addMessage('user', text);
    history.push({ role: 'user', content: text });
    els.input.value = '';
    setTyping(true);
    els.send.disabled = true;

    fetch(CONFIG.workerBase + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: visitorId, messages: history })
    })
      .then(function (r) {
        if (r.status === 429) {
          return r.json().then(function (data) {
            var err = new Error('limit');
            err.limit = true;
            err.message = data.message;
            throw err;
          });
        }
        if (!r.ok) {
          return r.json().then(function (data) {
            throw new Error(data.message || 'request_failed');
          });
        }
        return r.json();
      })
      .then(function (data) {
        setTyping(false);
        els.send.disabled = false;
        addMessage('assistant', data.reply);
        history.push({ role: 'assistant', content: data.reply });
        setRemaining(data.remaining);
      })
      .catch(function (err) {
        setTyping(false);
        els.send.disabled = false;
        if (err && err.limit) {
          showLimitReached(err.message);
        } else {
          addMessage('assistant', (err && err.message) || STRINGS[locale].networkError);
        }
      });
  }

  els.form.addEventListener('submit', function (e) {
    e.preventDefault();
    sendMessage(els.input.value);
  });

  function init() {
    var fpReady = window.FingerprintJS ? window.FingerprintJS.load() : Promise.resolve(null);

    fpReady
      .then(function (agent) { return agent ? agent.get() : null; })
      .then(function (result) {
        visitorId = result ? result.visitorId : null;
        var qs = visitorId ? ('?visitorId=' + encodeURIComponent(visitorId)) : '';
        return fetch(CONFIG.workerBase + '/session' + qs);
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        locale = data.locale || 'ru';
        addMessage('assistant', data.greeting);
        renderChips(data.suggested || []);
        setRemaining(data.remaining);
        if (data.remaining <= 0) showLimitReached(STRINGS[locale].limitCta);
      })
      .catch(function () {
        addMessage('assistant', STRINGS[locale].loadError);
      });
  }

  init();
})();
