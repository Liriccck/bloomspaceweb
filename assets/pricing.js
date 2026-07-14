// Single source of truth for all pricing shown on the site (ceny.html,
// index.html teaser, cart, and the Apps Script submission). CIS prices are
// a BYN base run through the existing geo.js conversion (BSW.formatByn).
// Rest-of-world prices are fixed USD amounts — no conversion applied.
window.BSW_PRICING = {
  cards: [
    {
      id: 'chat',
      relatesTo: 'chat',
      badge: null,
      title: { ru: 'AI-администратор (чат)', en: 'AI Administrator (Chat)' },
      desc: {
        ru: 'Работает на сайте, в Telegram и WhatsApp: отвечает клиентам, записывает на услугу и собирает заявки — сам, круглосуточно.',
        en: 'Works on your website, via SMS and WhatsApp: answers clients, books appointments and captures leads — on its own, around the clock.'
      },
      note: null,
      byn: 1500, bynMonthly: 200,
      usd: 1997, usdMonthly: 197
    },
    {
      id: 'phone',
      relatesTo: 'phone',
      badge: null,
      title: { ru: 'AI-администратор на телефон', en: 'AI Phone Receptionist' },
      desc: {
        ru: 'Голосовой ИИ принимает звонки, отвечает на вопросы и записывает клиентов 24/7. Сложный звонок вежливо переведёт на вас.',
        en: 'Voice AI answers calls, handles questions and books appointments around the clock. Tricky calls get transferred to you automatically.'
      },
      note: { ru: 'до 300 минут звонков/мес включено', en: 'up to 300 call minutes/mo included' },
      byn: 2500, bynMonthly: 250,
      usd: 2997, usdMonthly: 247
    },
    {
      id: 'landing',
      relatesTo: null,
      badge: null,
      title: { ru: 'Лендинг', en: 'Landing Page' },
      desc: {
        ru: 'Дизайн и сборка под ключ: адаптив под телефоны, формы заявок и кнопки мессенджеров, базовая SEO-настройка.',
        en: 'Custom-designed and built end to end: mobile-ready, lead forms and messenger buttons built in, basic SEO set up.'
      },
      note: null,
      byn: 1000, bynMonthly: null,
      usd: 1497, usdMonthly: null
    },
    {
      id: 'multipage',
      relatesTo: null,
      badge: null,
      title: { ru: 'Многостраничный сайт', en: 'Multi-Page Website' },
      desc: {
        ru: '5–8 страниц под ключ: адаптив, формы заявок, базовая SEO-настройка — под весь ваш бизнес, а не одну услугу.',
        en: '5–8 pages built end to end: mobile-ready, lead forms, basic SEO — covers your whole business, not just one offer.'
      },
      note: null,
      byn: 2500, bynMonthly: null,
      usd: 3497, usdMonthly: null
    },
    {
      id: 'bundle',
      relatesTo: 'chat',
      badge: { ru: 'Берут чаще всего', en: 'Most popular' },
      title: { ru: 'Лендинг + AI-администратор', en: 'Landing Page + AI Administrator' },
      desc: {
        ru: 'Сайт приводит клиента, ИИ доводит его до записи. Всё в одной связке — дешевле, чем по отдельности.',
        en: 'The site brings the client in, the AI closes the booking. One bundle, cheaper than buying separately.'
      },
      note: null,
      byn: 2200, bynMonthly: 200,
      usd: 2997, usdMonthly: 197
    }
  ],

  addonGroups: [
    {
      id: 'shared',
      label: { ru: 'Общие', en: 'Shared' },
      appliesTo: null,
      items: [
        { id: 'crm', title: { ru: 'Интеграция с CRM (amoCRM, Bitrix24)', en: 'CRM integration (HubSpot, GoHighLevel, etc.)' }, byn: 500, bynMonthly: null, usd: 297, usdMonthly: null },
        { id: 'reminders', title: { ru: 'Напоминания клиентам перед визитом', en: 'Appointment reminders' }, byn: 300, bynMonthly: null, usd: 147, usdMonthly: null },
        { id: 'reviews', title: { ru: 'Сбор отзывов после визита (Яндекс.Карты / Google)', en: 'Review collection (Google)' }, byn: 300, bynMonthly: null, usd: 147, usdMonthly: null },
        { id: 'careplan', title: { ru: 'Расширенное обслуживание (безлимит правок, приоритет, месячный отчёт)', en: 'Extended care plan (unlimited edits, priority, monthly report)' }, byn: null, bynMonthly: 350, usd: null, usdMonthly: 347, replacesBase: true, note: { ru: 'вместо базовой', en: 'instead of base' } }
      ]
    },
    {
      id: 'chat',
      label: { ru: 'Для AI-администратора (чат)', en: 'For the AI Administrator (chat)' },
      appliesTo: { ru: 'Работает с AI-администратором (чат)', en: 'Works with the AI Administrator (chat)' },
      items: [
        { id: 'extra-channel', title: { ru: 'Дополнительный канал (второй мессенджер или сайт)', en: 'Additional channel' }, byn: 350, bynMonthly: null, usd: 197, usdMonthly: null },
        { id: 'lead-recovery', title: { ru: 'Возврат «пропавших» клиентов (дожим лидов)', en: 'Lost-lead reactivation' }, byn: 500, bynMonthly: null, usd: 297, usdMonthly: null }
      ]
    },
    {
      id: 'phone',
      label: { ru: 'Для AI-администратора на телефон', en: 'For the AI Phone Receptionist' },
      appliesTo: { ru: 'Работает с AI-администратором на телефон', en: 'Works with the AI Phone Receptionist' },
      items: [
        { id: 'extra-minutes', title: { ru: 'Пакет минут +300/мес', en: 'Extra 300 minutes/mo' }, byn: null, bynMonthly: 100, usd: null, usdMonthly: 79 },
        { id: 'sms-confirm', title: { ru: 'SMS-подтверждение после звонка (детали записи клиенту)', en: 'SMS confirmations after calls' }, byn: 250, bynMonthly: null, usd: 197, usdMonthly: null },
        { id: 'call-summary', title: { ru: 'Сводки звонков владельцу (кто звонил, что хотел, чем закончилось)', en: 'Daily call summaries sent to you — who called, what they wanted, how it went' }, byn: 300, bynMonthly: null, usd: 197, usdMonthly: null },
        { id: 'outbound-reminders', title: { ru: 'Исходящие звонки-напоминания записанным за день до визита', en: 'Outbound reminder calls' }, byn: 500, bynMonthly: null, usd: 297, usdMonthly: null }
      ]
    }
  ]
};
