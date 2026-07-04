/* Sparblick — lokale Verwaltung von Einnahmen, Verträgen und Zahlungen.
 * Keine externen Abhängigkeiten. Daten liegen im localStorage des Geräts. */
(function () {
  "use strict";

  const STORAGE_KEY = "tyb_data_v1";
  const LANG_KEY = "tyb_lang";
  const CURRENCY = "EUR";

  /* ---------- Sprache / i18n ---------- */
  const I18N = {
    de: {
      // Chrome / Navigation
      view: "Ansicht", filter_by_person: "Nach Person filtern", all_combined: "Alle zusammen",
      tab_uebersicht: "Übersicht", tab_einnahmen: "Einnahmen", tab_zahlungen: "Zahlungen",
      tab_sparen: "Sparen", tab_kategorien: "Kategorien", tab_personen: "Personen", tab_daten: "Daten",
      // Aktionen / generisch
      cancel: "Abbrechen", save_btn: "Speichern", edit: "Bearbeiten", delete: "Löschen",
      pause: "Pausieren", activate: "Aktivieren", saved: "Gespeichert", deleted: "Gelöscht",
      name_required: "Bitte Name angeben", amount_required: "Bitte Betrag angeben",
      save_failed: "Speichern fehlgeschlagen",
      // Felder
      label_name: "Bezeichnung", label_amount: "Betrag (€)", label_interval: "Intervall",
      label_person: "Person", label_category: "Kategorie", label_next_due: "Nächste Fälligkeit (optional)",
      label_note: "Notiz (optional)", label_name_plain: "Name", label_color: "Farbe", label_type: "Art",
      // Intervalle
      iv_woechentlich: "wöchentlich", iv_monatlich: "monatlich", iv_quartalsweise: "quartalsweise",
      iv_halbjaehrlich: "halbjährlich", iv_jaehrlich: "jährlich",
      // Spararten
      art_etf: "ETF / Fonds", art_aktien: "Aktien", art_sparkonto: "Tagesgeld / Sparkonto",
      art_altersvorsorge: "Altersvorsorge", art_krypto: "Krypto", art_sonstiges: "Sonstiges",
      // Übersicht
      per_month: "Monat", per_year: "Jahr",
      amounts_note_month: "Alle Beträge pro Monat", amounts_note_year: "Alle Beträge pro Jahr",
      income: "Einkommen", fixed_costs: "Fixkosten", savings: "Sparen", free_available: "Frei verfügbar",
      after_costs_savings: "nach Kosten & Sparen", savings_rate: "Sparquote {pct}",
      donut_month: "pro Monat", donut_year: "pro Jahr",
      split_fixed_costs: "Aufteilung der Fixkosten", by_category: "Nach Kategorie",
      pct_of_income: "{pct} vom Einkommen", pct_of_costs: "{pct} der Kosten",
      no_payments_yet_title: "Noch keine Zahlungen erfasst.",
      no_payments_yet_text: "Lege unter Zahlungen deine Verträge und Abos an, um die Aufteilung zu sehen.",
      upcoming_due: "Demnächst fällig", per_person: "Pro Person",
      per_person_sub: "Grundlage für spätere getrennte Budgets",
      pp_costs: "Kosten", free_short: "Frei", no_category: "Ohne Kategorie",
      // Fälligkeit
      due_today: "heute fällig", due_tomorrow: "morgen fällig", due_in_days: "in {n} Tagen",
      due_prefix: "fällig {date}",
      // Einnahmen
      income_sub: "Dein monatliches Einkommen — auch pro Person erfassbar.", add_income: "+ Einnahme",
      no_income_title: "Noch keine Einnahmen.", no_income_text: "Trage z. B. dein Gehalt ein.",
      per_month_slash: "/ Monat", new_income: "Neue Einnahme", edit_income: "Einnahme bearbeiten",
      income_added: "Einnahme hinzugefügt", delete_income_confirm: "Diese Einnahme löschen?",
      default_income_name: "Einnahme", ph_income: "z. B. Gehalt",
      // Zahlungen
      payments_title: "Zahlungen & Verträge", payments_sub: "Abos, Verträge und feste monatliche Ausgaben.",
      add_payment: "+ Zahlung", no_payments_title: "Noch keine Zahlungen.",
      no_payments_text: "Lege deinen ersten Vertrag oder ein Abo an.", all_categories: "Alle Kategorien",
      sort_amount_desc: "Betrag absteigend", sort_amount_asc: "Betrag aufsteigend", sort_name: "Name (A–Z)",
      search_ph: "Suchen …", reset: "Zurücksetzen",
      count_payments: "{n} Zahlung(en)", sum_line: "{m}/Monat · {y}/Jahr (aktive)",
      no_payments_filter: "Keine Zahlungen für diesen Filter.", tag_paused: "pausiert",
      new_payment: "Neue Zahlung", edit_payment: "Zahlung bearbeiten", payment_added: "Zahlung hinzugefügt",
      delete_payment_confirm: "Diese Zahlung löschen?", default_payment_name: "Zahlung",
      ph_payment: "z. B. Netflix, Miete, Fitnessstudio", ph_note_contract: "z. B. Vertragsende 12/2026",
      // Sparen
      savings_title: "Sparen & Anlegen",
      savings_sub: "Regelmäßige Sparraten – z. B. ETF-Sparpläne, Tagesgeld oder Altersvorsorge.",
      add_savings: "+ Sparrate", no_savings_title: "Noch keine Sparraten.",
      no_savings_text: "Lege z. B. deinen ETF-Sparplan an.", count_savings: "{n} Sparrate(n)",
      new_savings: "Neue Sparrate", edit_savings: "Sparrate bearbeiten", savings_added: "Sparrate hinzugefügt",
      delete_savings_confirm: "Diese Sparrate löschen?", default_savings_name: "Sparrate",
      ph_savings: "z. B. MSCI World ETF", ph_note_depot: "z. B. Depot bei …",
      // Kategorien
      categories_sub: "Ordne deine Zahlungen thematisch — Farben erscheinen im Diagramm.",
      add_category: "+ Kategorie", payment_one: "{n} Zahlung", payment_many: "{n} Zahlungen",
      new_category: "Neue Kategorie", edit_category: "Kategorie bearbeiten",
      category_added: "Kategorie hinzugefügt", min_one_category: "Mindestens eine Kategorie muss bleiben",
      category_reassign_confirm: "Diese Kategorie hat {n} Zahlung(en). Sie werden zu {fallback} verschoben. Fortfahren?",
      delete_category_confirm: "Diese Kategorie löschen?", ph_category: "z. B. Freizeit",
      // Personen
      people_sub: "Wer teilt sich das Budget? Grundlage für später getrennte Profile.",
      add_person: "+ Person", person_counts: "{e} Einnahme(n) · {z} Zahlung(en)",
      new_person: "Neue Person", edit_person: "Person bearbeiten", person_added: "Person hinzugefügt",
      min_one_person: "Mindestens eine Person muss bleiben",
      person_reassign_confirm: "Diese Person ist {n}× zugeordnet. Ihre Einträge werden {fallback} zugewiesen. Fortfahren?",
      delete_person_confirm: "Diese Person löschen?", ph_person: "z. B. dein Name oder der deiner Frau",
      // Daten
      data_sub: "Alle Daten liegen lokal auf diesem Gerät. Sichere oder übertrage sie per Datei.",
      backup_title: "Sichern & Übertragen (JSON)",
      backup_text: "Vollständiges Backup als JSON-Datei – enthält alle Einnahmen, Zahlungen, Sparraten, Kategorien und Personen. Ideal zum Übertragen zwischen Handy und PC. Beim Import kannst du wählen: bestehende Daten ersetzen oder mit den importierten zusammenführen.",
      export_json: " Export (JSON)", import_json: " Import (JSON)",
      current_status: "Aktueller Stand", st_income: "Einnahmen", st_payments: "Zahlungen",
      st_savings: "Sparraten", st_categories: "Kategorien", st_income_month: "Einkommen / Monat",
      st_costs_month: "Fixkosten / Monat", st_savings_month: "Sparen / Monat",
      reset_title: "Zurücksetzen",
      reset_text: "Löscht alle Einnahmen, Zahlungen und Sparraten und stellt die Standardkategorien wieder her.",
      reset_btn: "Alle Daten löschen",
      reset_confirm: "Wirklich ALLE Daten löschen? Das kann nicht rückgängig gemacht werden.",
      reset_done: "Zurückgesetzt",
      export_done: "Export erstellt", export_failed: "Export fehlgeschlagen",
      import_failed: "Import fehlgeschlagen", file_unreadable: "Datei konnte nicht gelesen werden",
      file_label: "Datei", import_title: "Daten importieren",
      import_question: "Wie sollen die importierten Daten übernommen werden?",
      merge: "Zusammenführen", replace: "Ersetzen", merged: "Daten zusammengeführt", replaced: "Daten ersetzt",
      // Standarddaten
      seed_p_ich: "Ich", seed_p_partner: "Partnerin", seed_p_gemeinsam: "Gemeinsam",
      seed_k_wohnen: "Wohnen & Miete", seed_k_versicherung: "Versicherungen", seed_k_sport: "Sport & Fitness",
      seed_k_abos: "Abos & Streaming", seed_k_mobilitaet: "Mobilität & Auto", seed_k_telekom: "Telefon & Internet",
      seed_k_lebensmittel: "Lebensmittel (pauschal)", seed_k_sonstiges: "Sonstiges",
    },
    en: {
      view: "View", filter_by_person: "Filter by person", all_combined: "All combined",
      tab_uebersicht: "Overview", tab_einnahmen: "Income", tab_zahlungen: "Payments",
      tab_sparen: "Savings", tab_kategorien: "Categories", tab_personen: "People", tab_daten: "Data",
      cancel: "Cancel", save_btn: "Save", edit: "Edit", delete: "Delete",
      pause: "Pause", activate: "Activate", saved: "Saved", deleted: "Deleted",
      name_required: "Please enter a name", amount_required: "Please enter an amount",
      save_failed: "Saving failed",
      label_name: "Label", label_amount: "Amount (€)", label_interval: "Interval",
      label_person: "Person", label_category: "Category", label_next_due: "Next due date (optional)",
      label_note: "Note (optional)", label_name_plain: "Name", label_color: "Color", label_type: "Type",
      iv_woechentlich: "weekly", iv_monatlich: "monthly", iv_quartalsweise: "quarterly",
      iv_halbjaehrlich: "half-yearly", iv_jaehrlich: "yearly",
      art_etf: "ETF / Funds", art_aktien: "Stocks", art_sparkonto: "Savings account",
      art_altersvorsorge: "Pension", art_krypto: "Crypto", art_sonstiges: "Other",
      per_month: "Month", per_year: "Year",
      amounts_note_month: "All amounts per month", amounts_note_year: "All amounts per year",
      income: "Income", fixed_costs: "Fixed costs", savings: "Savings", free_available: "Available",
      after_costs_savings: "after costs & savings", savings_rate: "Savings rate {pct}",
      donut_month: "per month", donut_year: "per year",
      split_fixed_costs: "Breakdown of fixed costs", by_category: "By category",
      pct_of_income: "{pct} of income", pct_of_costs: "{pct} of costs",
      no_payments_yet_title: "No payments yet.",
      no_payments_yet_text: "Add your contracts and subscriptions under Payments to see the breakdown.",
      upcoming_due: "Upcoming", per_person: "Per person",
      per_person_sub: "Basis for separate budgets later",
      pp_costs: "Costs", free_short: "Available", no_category: "No category",
      due_today: "due today", due_tomorrow: "due tomorrow", due_in_days: "in {n} days",
      due_prefix: "due {date}",
      income_sub: "Your monthly income — also per person.", add_income: "+ Income",
      no_income_title: "No income yet.", no_income_text: "Add your salary, for example.",
      per_month_slash: "/ month", new_income: "New income", edit_income: "Edit income",
      income_added: "Income added", delete_income_confirm: "Delete this income?",
      default_income_name: "Income", ph_income: "e.g. Salary",
      payments_title: "Payments & contracts", payments_sub: "Subscriptions, contracts and fixed monthly expenses.",
      add_payment: "+ Payment", no_payments_title: "No payments yet.",
      no_payments_text: "Add your first contract or subscription.", all_categories: "All categories",
      sort_amount_desc: "Amount ↓", sort_amount_asc: "Amount ↑", sort_name: "Name (A–Z)",
      search_ph: "Search …", reset: "Reset",
      count_payments: "{n} payment(s)", sum_line: "{m}/month · {y}/year (active)",
      no_payments_filter: "No payments for this filter.", tag_paused: "paused",
      new_payment: "New payment", edit_payment: "Edit payment", payment_added: "Payment added",
      delete_payment_confirm: "Delete this payment?", default_payment_name: "Payment",
      ph_payment: "e.g. Netflix, rent, gym", ph_note_contract: "e.g. contract ends 12/2026",
      savings_title: "Saving & investing",
      savings_sub: "Recurring savings – e.g. ETF plans, savings accounts or pension.",
      add_savings: "+ Savings", no_savings_title: "No savings yet.",
      no_savings_text: "Add your ETF plan, for example.", count_savings: "{n} savings plan(s)",
      new_savings: "New savings plan", edit_savings: "Edit savings plan", savings_added: "Savings plan added",
      delete_savings_confirm: "Delete this savings plan?", default_savings_name: "Savings",
      ph_savings: "e.g. MSCI World ETF", ph_note_depot: "e.g. broker …",
      categories_sub: "Group your payments — colors appear in the chart.",
      add_category: "+ Category", payment_one: "{n} payment", payment_many: "{n} payments",
      new_category: "New category", edit_category: "Edit category",
      category_added: "Category added", min_one_category: "At least one category must remain",
      category_reassign_confirm: "This category has {n} payment(s). They will be moved to {fallback}. Continue?",
      delete_category_confirm: "Delete this category?", ph_category: "e.g. Leisure",
      people_sub: "Who shares the budget? Basis for separate profiles later.",
      add_person: "+ Person", person_counts: "{e} income · {z} payment(s)",
      new_person: "New person", edit_person: "Edit person", person_added: "Person added",
      min_one_person: "At least one person must remain",
      person_reassign_confirm: "This person is assigned {n}×. Their entries will be reassigned to {fallback}. Continue?",
      delete_person_confirm: "Delete this person?", ph_person: "e.g. your name or your partner's",
      data_sub: "All data is stored locally on this device. Back up or transfer it via file.",
      backup_title: "Backup & transfer (JSON)",
      backup_text: "Full backup as a JSON file – includes all income, payments, savings, categories and people. Ideal for transferring between phone and PC. On import you can choose: replace existing data or merge it with the imported data.",
      export_json: " Export (JSON)", import_json: " Import (JSON)",
      current_status: "Current status", st_income: "Income entries", st_payments: "Payments",
      st_savings: "Savings plans", st_categories: "Categories", st_income_month: "Income / month",
      st_costs_month: "Fixed costs / month", st_savings_month: "Savings / month",
      reset_title: "Reset",
      reset_text: "Deletes all income, payments and savings and restores the default categories.",
      reset_btn: "Delete all data",
      reset_confirm: "Really delete ALL data? This cannot be undone.",
      reset_done: "Reset done",
      export_done: "Export created", export_failed: "Export failed",
      import_failed: "Import failed", file_unreadable: "The file could not be read",
      file_label: "File", import_title: "Import data",
      import_question: "How should the imported data be applied?",
      merge: "Merge", replace: "Replace", merged: "Data merged", replaced: "Data replaced",
      seed_p_ich: "Me", seed_p_partner: "Partner", seed_p_gemeinsam: "Shared",
      seed_k_wohnen: "Housing & rent", seed_k_versicherung: "Insurance", seed_k_sport: "Sports & fitness",
      seed_k_abos: "Subscriptions & streaming", seed_k_mobilitaet: "Mobility & car", seed_k_telekom: "Phone & internet",
      seed_k_lebensmittel: "Groceries (lump sum)", seed_k_sonstiges: "Other",
    },
  };

  let lang = pickLang();
  function pickLang() {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored === "de" || stored === "en") return stored;
    } catch (e) { /* ignore */ }
    return (navigator.language || "de").toLowerCase().startsWith("de") ? "de" : "en";
  }
  function t(key, vars) {
    let s = (I18N[lang] && I18N[lang][key]) || I18N.de[key] || key;
    if (vars) for (const k in vars) s = s.replace("{" + k + "}", vars[k]);
    return s;
  }

  /* ---------- Intervalle: Umrechnung auf Monatsbetrag ---------- */
  const INTERVALS = {
    woechentlich: { perMonth: 52 / 12 },
    monatlich: { perMonth: 1 },
    quartalsweise: { perMonth: 1 / 3 },
    halbjaehrlich: { perMonth: 1 / 6 },
    jaehrlich: { perMonth: 1 / 12 },
  };
  function intervalLabel(key) { return t("iv_" + key); }

  const PALETTE = [
    "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6",
    "#ec4899", "#14b8a6", "#8b5cf6", "#f97316", "#64748b",
  ];

  // Arten von Sparplänen/Anlagen (Keys; Anzeige über t)
  const SPAR_ARTEN = ["etf", "aktien", "sparkonto", "altersvorsorge", "krypto", "sonstiges"];
  function sparArtLabel(a) { return t("art_" + (SPAR_ARTEN.indexOf(a) >= 0 ? a : "sonstiges")); }
  function sparArtOptions() { return SPAR_ARTEN.map((a) => [a, sparArtLabel(a)]); }

  /* ---------- Standarddaten für den ersten Start ---------- */
  function defaultData() {
    return {
      version: 1,
      personen: [
        { id: "p_ich", name: t("seed_p_ich") },
        { id: "p_partner", name: t("seed_p_partner") },
        { id: "p_gemeinsam", name: t("seed_p_gemeinsam") },
      ],
      kategorien: [
        { id: "k_wohnen", name: t("seed_k_wohnen"), farbe: "#6366f1" },
        { id: "k_versicherung", name: t("seed_k_versicherung"), farbe: "#3b82f6" },
        { id: "k_sport", name: t("seed_k_sport"), farbe: "#10b981" },
        { id: "k_abos", name: t("seed_k_abos"), farbe: "#ec4899" },
        { id: "k_mobilitaet", name: t("seed_k_mobilitaet"), farbe: "#f59e0b" },
        { id: "k_telekom", name: t("seed_k_telekom"), farbe: "#14b8a6" },
        { id: "k_lebensmittel", name: t("seed_k_lebensmittel"), farbe: "#f97316" },
        { id: "k_sonstiges", name: t("seed_k_sonstiges"), farbe: "#64748b" },
      ],
      einnahmen: [],
      zahlungen: [],
      sparplaene: [],
    };
  }

  /* ---------- State ---------- */
  let state = loadData();
  let currentView = "uebersicht";
  let personFilter = "all"; // "all" oder eine person-id
  let period = "monat"; // "monat" oder "jahr" (Anzeige auf der Übersicht)
  let zahlungFilter = { kategorie: "all", suche: "", sort: "betrag_desc" };

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultData();
      const parsed = JSON.parse(raw);
      return migrate(parsed);
    } catch (e) {
      console.error("Konnte Daten nicht laden:", e);
      return defaultData();
    }
  }

  function migrate(d) {
    const base = defaultData();
    return {
      version: 1,
      personen: Array.isArray(d.personen) && d.personen.length ? d.personen : base.personen,
      kategorien: Array.isArray(d.kategorien) && d.kategorien.length ? d.kategorien : base.kategorien,
      einnahmen: Array.isArray(d.einnahmen) ? d.einnahmen : [],
      zahlungen: Array.isArray(d.zahlungen) ? d.zahlungen : [],
      sparplaene: Array.isArray(d.sparplaene) ? d.sparplaene : [],
    };
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      toast(t("save_failed"));
    }
  }

  /* ---------- Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else if (v !== null && v !== undefined && v !== false) n.setAttribute(k, v);
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      n.appendChild(typeof kid === "string" ? document.createTextNode(kid) : kid);
    }
    return n;
  };

  function uid(prefix) {
    return prefix + "_" + Math.floor(performance.now() * 1000).toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  }

  /* Inline-SVG-Icons (rendern plattformübergreifend gleich, erben Buttonfarbe) */
  const ICONS = {
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
    download: '<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/>',
    upload: '<path d="M12 21V9"/><path d="M7 14l5-5 5 5"/><path d="M5 3h14"/>',
  };
  function icon(name) {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    Object.entries({ viewBox: "0 0 24 24", width: 17, height: 17, fill: "none",
      stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" })
      .forEach(([k, v]) => svg.setAttribute(k, v));
    svg.innerHTML = ICONS[name];
    return svg;
  }

  /* ---------- Formatierung (sprachabhängig) ---------- */
  const _nf = {}, _df = {};
  function locale() { return lang === "de" ? "de-DE" : "en-GB"; }
  function fmt(n) {
    const l = locale();
    if (!_nf[l]) _nf[l] = new Intl.NumberFormat(l, { style: "currency", currency: CURRENCY });
    return _nf[l].format(n || 0);
  }
  function fmtPct(n) {
    return (n * 100).toFixed(n < 0.1 ? 1 : 0) + (lang === "de" ? " %" : "%");
  }
  function dateFmtFn(d) {
    const l = locale();
    if (!_df[l]) _df[l] = new Intl.DateTimeFormat(l, { day: "2-digit", month: "2-digit", year: "numeric" });
    return _df[l].format(d);
  }

  function monthly(entry) {
    const iv = INTERVALS[entry.intervall] || INTERVALS.monatlich;
    return (Number(entry.betrag) || 0) * iv.perMonth;
  }

  /* ---------- Datum / Fälligkeiten ---------- */
  const MONTHS_PER_INTERVAL = { monatlich: 1, quartalsweise: 3, halbjaehrlich: 6, jaehrlich: 12 };

  function todayMidnight() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  function parseISO(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return isNaN(d.getTime()) ? null : d;
  }
  function advanceDate(d, intervall) {
    const nd = new Date(d);
    if (intervall === "woechentlich") nd.setDate(nd.getDate() + 7);
    else nd.setMonth(nd.getMonth() + (MONTHS_PER_INTERVAL[intervall] || 1));
    return nd;
  }
  // Nächste Fälligkeit >= heute (rollt vom gespeicherten Datum vorwärts)
  function nextDue(entry) {
    const base = parseISO(entry.faellig);
    if (!base) return null;
    const today = todayMidnight();
    let d = base;
    let guard = 0;
    while (d < today && guard < 2000) { d = advanceDate(d, entry.intervall); guard++; }
    return d;
  }
  function daysUntil(d) {
    return Math.round((d - todayMidnight()) / 86400000);
  }
  function faelligkeitText(days) {
    if (days <= 0) return t("due_today");
    if (days === 1) return t("due_tomorrow");
    return t("due_in_days", { n: days });
  }

  function personName(id) {
    const p = state.personen.find((x) => x.id === id);
    return p ? p.name : "—";
  }
  function kategorieById(id) {
    return state.kategorien.find((k) => k.id === id);
  }

  function matchesPerson(entry) {
    return personFilter === "all" || entry.person === personFilter;
  }

  function toast(msg) {
    const el2 = $("#toast");
    el2.textContent = msg;
    el2.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el2.classList.remove("show"), 2200);
  }

  /* ---------- Berechnungen ---------- */
  function calc() {
    const einnahmen = state.einnahmen.filter(matchesPerson);
    const zahlungen = state.zahlungen.filter((z) => z.aktiv !== false).filter(matchesPerson);
    const sparplaene = state.sparplaene.filter((s) => s.aktiv !== false).filter(matchesPerson);
    const income = einnahmen.reduce((s, e) => s + monthly(e), 0);
    const costs = zahlungen.reduce((s, z) => s + monthly(z), 0);
    const savings = sparplaene.reduce((s, sp) => s + monthly(sp), 0);

    const perCat = {};
    for (const z of zahlungen) {
      const key = z.kategorieId || "k_sonstiges";
      perCat[key] = (perCat[key] || 0) + monthly(z);
    }
    const catRows = Object.entries(perCat)
      .map(([id, amount]) => {
        const k = kategorieById(id);
        return {
          id,
          name: k ? k.name : t("no_category"),
          farbe: k ? k.farbe : "#64748b",
          amount,
          pctIncome: income > 0 ? amount / income : 0,
          pctCosts: costs > 0 ? amount / costs : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return { income, costs, savings, rest: income - costs - savings, catRows };
  }

  /* ---------- Rendering: Navigation ---------- */
  function localizeChrome() {
    document.documentElement.lang = lang;
    const tabKeys = {
      uebersicht: "tab_uebersicht", einnahmen: "tab_einnahmen", zahlungen: "tab_zahlungen",
      sparen: "tab_sparen", kategorien: "tab_kategorien", personen: "tab_personen", daten: "tab_daten",
    };
    document.querySelectorAll(".tab").forEach((tab) => { tab.textContent = t(tabKeys[tab.dataset.view] || tab.dataset.view); });
    const vl = document.querySelector(".view-filter > span");
    if (vl) vl.textContent = t("view");
    const pf = $("#personFilter");
    if (pf) pf.setAttribute("aria-label", t("filter_by_person"));
  }

  function renderPersonFilter() {
    const sel = $("#personFilter");
    sel.innerHTML = "";
    sel.appendChild(el("option", { value: "all" }, t("all_combined")));
    for (const p of state.personen) sel.appendChild(el("option", { value: p.id }, p.name));
    sel.value = personFilter;
  }

  function render() {
    localizeChrome();
    renderPersonFilter();
    document.querySelectorAll(".tab").forEach((tab) =>
      tab.classList.toggle("is-active", tab.dataset.view === currentView)
    );
    const app = $("#app");
    app.innerHTML = "";
    ({
      uebersicht: renderUebersicht,
      einnahmen: renderEinnahmen,
      zahlungen: renderZahlungen,
      sparen: renderSparen,
      kategorien: renderKategorien,
      personen: renderPersonen,
      daten: renderDaten,
    }[currentView])(app);
  }

  /* ---------- View: Übersicht ---------- */
  function renderUebersicht(root) {
    const c = calc();
    const savingRate = c.income > 0 ? c.savings / c.income : 0; // echte Sparquote
    const f = period === "jahr" ? 12 : 1;               // Faktor Monat -> Jahr
    const per = period === "jahr" ? t("per_year") : t("per_month");

    // Umschalter Monat / Jahr
    root.appendChild(el("div", { class: "section-head", style: "margin-bottom:14px" },
      el("div", {}, el("h2", { style: "font-size:1.15rem" }, t("tab_uebersicht")),
        el("p", {}, period === "jahr" ? t("amounts_note_year") : t("amounts_note_month"))),
      el("div", { class: "seg" },
        el("button", { class: period === "monat" ? "active" : "", onclick: () => { period = "monat"; render(); } }, t("per_month")),
        el("button", { class: period === "jahr" ? "active" : "", onclick: () => { period = "jahr"; render(); } }, t("per_year")))
    ));

    root.appendChild(
      el("div", { class: "kpi-grid" },
        kpiCard(t("income") + " / " + per, fmt(c.income * f), "accent"),
        kpiCard(t("fixed_costs") + " / " + per, fmt(c.costs * f)),
        kpiCard(t("savings") + " / " + per, fmt(c.savings * f), "pos",
          c.income > 0 ? t("savings_rate", { pct: fmtPct(savingRate) }) : ""),
        kpiCard(t("free_available"), fmt(c.rest * f), c.rest >= 0 ? "" : "neg",
          t("after_costs_savings"))
      )
    );

    renderFaelligkeiten(root);

    if (c.costs === 0) {
      root.appendChild(emptyState(t("no_payments_yet_title"), t("no_payments_yet_text")));
    } else {
      root.appendChild(
        el("div", { class: "dash-grid" },
          el("div", { class: "card donut-wrap" },
            donut(c.catRows, c.costs, f, period === "jahr" ? t("donut_year") : t("donut_month")),
            el("div", { class: "hint" }, t("split_fixed_costs"))
          ),
          el("div", { class: "card" },
            el("div", { class: "section-head" }, el("h2", { style: "font-size:1.05rem" }, t("by_category"))),
            el("div", { class: "cat-list" }, ...c.catRows.map((r) => catRow(r, c.income, f)))
          )
        )
      );
    }

    // Pro-Person-Aufschlüsselung (nur wenn "Alle" gewählt)
    if (personFilter === "all") {
      const cards = state.personen.map((p) => {
        const inc = state.einnahmen.filter((e) => e.person === p.id).reduce((s, e) => s + monthly(e), 0);
        const cost = state.zahlungen.filter((z) => z.aktiv !== false && z.person === p.id).reduce((s, z) => s + monthly(z), 0);
        const sav = state.sparplaene.filter((s) => s.aktiv !== false && s.person === p.id).reduce((s, sp) => s + monthly(sp), 0);
        if (inc === 0 && cost === 0 && sav === 0) return null;
        return el("div", { class: "card person-card" },
          el("h4", {}, p.name),
          el("div", { class: "line" }, el("span", {}, t("income")), el("b", {}, fmt(inc * f))),
          el("div", { class: "line" }, el("span", {}, t("pp_costs")), el("b", {}, fmt(cost * f))),
          el("div", { class: "line" }, el("span", {}, t("savings")), el("b", {}, fmt(sav * f))),
          el("div", { class: "line" }, el("span", {}, t("free_short")), el("b", {}, fmt((inc - cost - sav) * f)))
        );
      }).filter(Boolean);
      if (cards.length) {
        root.appendChild(el("div", { class: "section-head", style: "margin-top:26px" },
          el("div", {}, el("h2", { style: "font-size:1.05rem" }, t("per_person")),
            el("p", {}, t("per_person_sub")))));
        root.appendChild(el("div", { class: "person-cards" }, ...cards));
      }
    }
  }

  // Bereich "Demnächst fällig" (Zahlungen mit Fälligkeitsdatum)
  function renderFaelligkeiten(root) {
    const items = state.zahlungen
      .filter((z) => z.aktiv !== false).filter(matchesPerson)
      .map((z) => ({ z, due: nextDue(z) }))
      .filter((x) => x.due)
      .sort((a, b) => a.due - b.due)
      .slice(0, 8);
    if (!items.length) return;

    root.appendChild(el("div", { class: "card", style: "margin-top:20px" },
      el("div", { class: "section-head", style: "margin-bottom:14px" },
        el("h2", { style: "font-size:1.05rem" }, t("upcoming_due"))),
      el("div", { class: "due-list" }, ...items.map(({ z, due }) => {
        const days = daysUntil(due);
        const k = kategorieById(z.kategorieId);
        const urg = days <= 3 ? "due-soon" : days <= 10 ? "due-near" : "";
        return el("div", { class: "due-row" },
          el("span", { class: "dot", style: "background:" + (k ? k.farbe : "#64748b") }),
          el("div", { class: "due-main" },
            el("div", { class: "due-name" }, z.bezeichnung || t("default_payment_name")),
            el("div", { class: "meta" }, dateFmtFn(due) + " · " + intervalLabel(z.intervall))),
          el("span", { class: "due-badge " + urg }, faelligkeitText(days)),
          el("span", { class: "due-amount" }, fmt(Number(z.betrag) || 0)));
      })))
    );
  }

  function kpiCard(label, value, mod, sub) {
    return el("div", { class: "card kpi " + (mod || "") },
      el("div", { class: "kpi-label" }, label),
      el("div", { class: "kpi-value" }, value),
      sub ? el("div", { class: "kpi-sub" }, sub) : null
    );
  }

  function catRow(r, income, f) {
    f = f || 1;
    const widthPct = Math.max(2, Math.round(r.pctCosts * 100));
    return el("div", { class: "cat-row" },
      el("div", { class: "name" }, el("span", { class: "dot", style: "background:" + r.farbe }), r.name),
      el("div", { class: "amount" }, fmt(r.amount * f)),
      el("div", { class: "bar" }, el("span", { style: `width:${widthPct}%;background:${r.farbe}` })),
      el("div", { class: "pct" }, income > 0 ? t("pct_of_income", { pct: fmtPct(r.pctIncome) }) : t("pct_of_costs", { pct: fmtPct(r.pctCosts) }))
    );
  }

  /* SVG-Donut-Diagramm */
  function donut(rows, total, f, centerLabel) {
    f = f || 1;
    const NS = "http://www.w3.org/2000/svg";
    const size = 210, cx = size / 2, cy = size / 2, r = 82, stroke = 30;
    const circ = 2 * Math.PI * r;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);

    const track = document.createElementNS(NS, "circle");
    Object.entries({ cx, cy, r, fill: "none", stroke: "var(--surface-2)", "stroke-width": stroke }).forEach(([k, v]) => track.setAttribute(k, v));
    svg.appendChild(track);

    let offset = 0;
    for (const row of rows) {
      const frac = total > 0 ? row.amount / total : 0;
      const seg = document.createElementNS(NS, "circle");
      const attrs = {
        cx, cy, r, fill: "none", stroke: row.farbe, "stroke-width": stroke,
        "stroke-dasharray": `${frac * circ} ${circ}`,
        "stroke-dashoffset": -offset * circ,
        transform: `rotate(-90 ${cx} ${cy})`,
      };
      Object.entries(attrs).forEach(([k, v]) => seg.setAttribute(k, v));
      svg.appendChild(seg);
      offset += frac;
    }

    return el("div", { class: "donut" }, svg,
      el("div", { class: "donut-center" },
        el("div", { class: "big" }, fmt(total * f)),
        el("div", { class: "small" }, centerLabel || t("donut_month"))));
  }

  /* ---------- View: Einnahmen ---------- */
  function renderEinnahmen(root) {
    root.appendChild(sectionHead(t("tab_einnahmen"), t("income_sub"),
      el("button", { class: "btn primary", onclick: () => openEinnahmeModal() }, t("add_income"))));

    const list = state.einnahmen.filter(matchesPerson);
    if (!list.length) {
      root.appendChild(emptyState(t("no_income_title"), t("no_income_text")));
      return;
    }
    root.appendChild(el("div", { class: "list" }, ...list.map((e) =>
      el("div", { class: "item" },
        el("span", { class: "swatch", style: "background:var(--success)" }),
        el("div", { class: "main" },
          el("div", { class: "title" }, e.bezeichnung || t("default_income_name"),
            el("span", { class: "tag muted" }, personName(e.person))),
          el("div", { class: "meta" }, intervalLabel(e.intervall))),
        el("div", { class: "value" }, fmt(monthly(e)),
          el("small", {}, e.intervall !== "monatlich" ? fmt(e.betrag) + " " + intervalLabel(e.intervall) : t("per_month_slash"))),
        el("div", { class: "actions" },
          el("button", { class: "btn ghost icon", title: t("edit"), onclick: () => openEinnahmeModal(e) }, icon("edit")),
          el("button", { class: "btn danger icon", title: t("delete"), onclick: () => removeEinnahme(e.id) }, icon("trash")))
      )
    )));
  }

  function openEinnahmeModal(entry) {
    const isNew = !entry;
    const e = entry || { id: uid("e"), bezeichnung: "", betrag: "", intervall: "monatlich", person: state.personen[0].id };
    openModal(isNew ? t("new_income") : t("edit_income"), [
      textField("bezeichnung", t("label_name"), e.bezeichnung, t("ph_income")),
      el("div", { class: "field-row" },
        numField("betrag", t("label_amount"), e.betrag),
        selectField("intervall", t("label_interval"), intervalOptions(), e.intervall)),
      selectField("person", t("label_person"), personOptions(), e.person),
    ], (vals) => {
      if (!vals.betrag) { toast(t("amount_required")); return false; }
      const rec = { id: e.id, bezeichnung: vals.bezeichnung.trim() || t("default_income_name"), betrag: Number(vals.betrag), intervall: vals.intervall, person: vals.person };
      const i = state.einnahmen.findIndex((x) => x.id === e.id);
      if (i >= 0) state.einnahmen[i] = rec; else state.einnahmen.push(rec);
      save(); render(); toast(isNew ? t("income_added") : t("saved"));
    });
  }

  function removeEinnahme(id) {
    if (!confirm(t("delete_income_confirm"))) return;
    state.einnahmen = state.einnahmen.filter((x) => x.id !== id);
    save(); render(); toast(t("deleted"));
  }

  /* ---------- View: Zahlungen ---------- */
  function filteredZahlungen() {
    let list = state.zahlungen.filter(matchesPerson);
    if (zahlungFilter.kategorie !== "all") {
      list = list.filter((z) => (z.kategorieId || "k_sonstiges") === zahlungFilter.kategorie);
    }
    const q = zahlungFilter.suche.trim().toLowerCase();
    if (q) {
      list = list.filter((z) =>
        (z.bezeichnung || "").toLowerCase().includes(q) || (z.notiz || "").toLowerCase().includes(q));
    }
    const sorters = {
      betrag_desc: (a, b) => monthly(b) - monthly(a),
      betrag_asc: (a, b) => monthly(a) - monthly(b),
      name: (a, b) => (a.bezeichnung || "").localeCompare(b.bezeichnung || "", lang),
    };
    return list.slice().sort(sorters[zahlungFilter.sort] || sorters.betrag_desc);
  }

  function renderZahlungen(root) {
    if (zahlungFilter.kategorie !== "all" && !kategorieById(zahlungFilter.kategorie)) {
      zahlungFilter.kategorie = "all";
    }
    root.appendChild(sectionHead(t("payments_title"), t("payments_sub"),
      el("button", { class: "btn primary", onclick: () => openZahlungModal() }, t("add_payment"))));

    if (!state.zahlungen.filter(matchesPerson).length) {
      root.appendChild(emptyState(t("no_payments_title"), t("no_payments_text")));
      return;
    }

    // Filterleiste
    const katSelect = el("select", { onchange: (e) => { zahlungFilter.kategorie = e.target.value; paintZahlungList(); } },
      el("option", { value: "all" }, t("all_categories")),
      ...state.kategorien.map((k) => {
        const o = el("option", { value: k.id }, k.name);
        if (k.id === zahlungFilter.kategorie) o.selected = true;
        return o;
      }));
    const sortSelect = el("select", { onchange: (e) => { zahlungFilter.sort = e.target.value; paintZahlungList(); } },
      ...[["betrag_desc", t("sort_amount_desc")], ["betrag_asc", t("sort_amount_asc")], ["name", t("sort_name")]].map(([v, l]) => {
        const o = el("option", { value: v }, l);
        if (v === zahlungFilter.sort) o.selected = true;
        return o;
      }));
    const search = el("input", { type: "text", class: "search", placeholder: t("search_ph"), value: zahlungFilter.suche,
      oninput: (e) => { zahlungFilter.suche = e.target.value; paintZahlungList(); } });

    root.appendChild(el("div", { class: "filter-bar" }, search, katSelect, sortSelect,
      el("button", { class: "btn ghost small", onclick: () => { zahlungFilter = { kategorie: "all", suche: "", sort: "betrag_desc" }; render(); } }, t("reset"))));

    root.appendChild(el("p", { class: "filter-summary", id: "zahlungSummary" }));
    root.appendChild(el("div", { class: "list", id: "zahlungList" }));
    paintZahlungList();
  }

  function paintZahlungList() {
    const container = $("#zahlungList");
    if (!container) return;
    const list = filteredZahlungen();
    const sum = list.filter((z) => z.aktiv !== false).reduce((s, z) => s + monthly(z), 0);
    const summary = $("#zahlungSummary");
    if (summary) {
      summary.textContent = t("count_payments", { n: list.length }) +
        (list.length ? " · " + t("sum_line", { m: fmt(sum), y: fmt(sum * 12) }) : "");
    }
    container.innerHTML = "";
    if (!list.length) {
      container.appendChild(el("div", { class: "empty" }, t("no_payments_filter")));
      return;
    }
    for (const z of list) {
      const k = kategorieById(z.kategorieId);
      const due = z.aktiv !== false ? nextDue(z) : null;
      const dueDays = due ? daysUntil(due) : null;
      container.appendChild(el("div", { class: "item" + (z.aktiv === false ? " inactive" : "") },
        el("span", { class: "swatch", style: "background:" + (k ? k.farbe : "#64748b") }),
        el("div", { class: "main" },
          el("div", { class: "title" }, z.bezeichnung || t("default_payment_name"),
            k ? el("span", { class: "tag" }, k.name) : null,
            z.aktiv === false ? el("span", { class: "tag muted" }, t("tag_paused")) : null,
            due && dueDays <= 7 ? el("span", { class: "tag warn" }, faelligkeitText(dueDays)) : null,
            el("span", { class: "tag muted" }, personName(z.person))),
          el("div", { class: "meta" }, intervalLabel(z.intervall)
            + (due ? " · " + t("due_prefix", { date: dateFmtFn(due) }) : "")
            + (z.notiz ? " · " + z.notiz : ""))),
        el("div", { class: "value" }, fmt(monthly(z)),
          el("small", {}, z.intervall !== "monatlich" ? fmt(z.betrag) + " " + intervalLabel(z.intervall) : t("per_month_slash"))),
        el("div", { class: "actions" },
          el("button", { class: "btn ghost icon", title: z.aktiv === false ? t("activate") : t("pause"), onclick: () => toggleZahlung(z.id) }, icon(z.aktiv === false ? "play" : "pause")),
          el("button", { class: "btn ghost icon", title: t("edit"), onclick: () => openZahlungModal(z) }, icon("edit")),
          el("button", { class: "btn danger icon", title: t("delete"), onclick: () => removeZahlung(z.id) }, icon("trash")))
      ));
    }
  }

  function openZahlungModal(entry) {
    const isNew = !entry;
    const z = entry || { id: uid("z"), bezeichnung: "", betrag: "", intervall: "monatlich",
      kategorieId: state.kategorien[0].id, person: state.personen[state.personen.length - 1].id, notiz: "", aktiv: true };
    openModal(isNew ? t("new_payment") : t("edit_payment"), [
      textField("bezeichnung", t("label_name"), z.bezeichnung, t("ph_payment")),
      el("div", { class: "field-row" },
        numField("betrag", t("label_amount"), z.betrag),
        selectField("intervall", t("label_interval"), intervalOptions(), z.intervall)),
      el("div", { class: "field-row" },
        selectField("kategorieId", t("label_category"), state.kategorien.map((k) => [k.id, k.name]), z.kategorieId),
        selectField("person", t("label_person"), personOptions(), z.person)),
      el("div", { class: "field-row" },
        dateField("faellig", t("label_next_due"), z.faellig),
        textField("notiz", t("label_note"), z.notiz, t("ph_note_contract"))),
    ], (vals) => {
      if (!vals.betrag) { toast(t("amount_required")); return false; }
      const rec = { id: z.id, bezeichnung: vals.bezeichnung.trim() || t("default_payment_name"), betrag: Number(vals.betrag),
        intervall: vals.intervall, kategorieId: vals.kategorieId, person: vals.person, notiz: vals.notiz.trim(),
        faellig: vals.faellig || "", aktiv: z.aktiv !== false };
      const i = state.zahlungen.findIndex((x) => x.id === z.id);
      if (i >= 0) state.zahlungen[i] = rec; else state.zahlungen.push(rec);
      save(); render(); toast(isNew ? t("payment_added") : t("saved"));
    });
  }

  function toggleZahlung(id) {
    const z = state.zahlungen.find((x) => x.id === id);
    if (!z) return;
    z.aktiv = z.aktiv === false;
    save(); render();
  }
  function removeZahlung(id) {
    if (!confirm(t("delete_payment_confirm"))) return;
    state.zahlungen = state.zahlungen.filter((x) => x.id !== id);
    save(); render(); toast(t("deleted"));
  }

  /* ---------- View: Sparen ---------- */
  function renderSparen(root) {
    root.appendChild(sectionHead(t("savings_title"), t("savings_sub"),
      el("button", { class: "btn primary", onclick: () => openSparModal() }, t("add_savings"))));

    const list = state.sparplaene.filter(matchesPerson);
    if (!list.length) {
      root.appendChild(emptyState(t("no_savings_title"), t("no_savings_text")));
      return;
    }
    const total = list.filter((s) => s.aktiv !== false).reduce((s, sp) => s + monthly(sp), 0);
    root.appendChild(el("p", { class: "filter-summary" },
      t("count_savings", { n: list.length }) + " · " + t("sum_line", { m: fmt(total), y: fmt(total * 12) })));

    root.appendChild(el("div", { class: "list" }, ...list
      .slice().sort((a, b) => monthly(b) - monthly(a)).map((sp) =>
        el("div", { class: "item" + (sp.aktiv === false ? " inactive" : "") },
          el("span", { class: "swatch", style: "background:var(--success)" }),
          el("div", { class: "main" },
            el("div", { class: "title" }, sp.bezeichnung || t("default_savings_name"),
              el("span", { class: "tag" }, sparArtLabel(sp.art)),
              sp.aktiv === false ? el("span", { class: "tag muted" }, t("tag_paused")) : null,
              el("span", { class: "tag muted" }, personName(sp.person))),
            el("div", { class: "meta" }, intervalLabel(sp.intervall) + (sp.notiz ? " · " + sp.notiz : ""))),
          el("div", { class: "value" }, fmt(monthly(sp)),
            el("small", {}, sp.intervall !== "monatlich" ? fmt(sp.betrag) + " " + intervalLabel(sp.intervall) : t("per_month_slash"))),
          el("div", { class: "actions" },
            el("button", { class: "btn ghost icon", title: sp.aktiv === false ? t("activate") : t("pause"), onclick: () => toggleSpar(sp.id) }, icon(sp.aktiv === false ? "play" : "pause")),
            el("button", { class: "btn ghost icon", title: t("edit"), onclick: () => openSparModal(sp) }, icon("edit")),
            el("button", { class: "btn danger icon", title: t("delete"), onclick: () => removeSpar(sp.id) }, icon("trash")))
        ))));
  }

  function openSparModal(entry) {
    const isNew = !entry;
    const sp = entry || { id: uid("s"), bezeichnung: "", betrag: "", intervall: "monatlich",
      art: "etf", person: state.personen[0].id, notiz: "", aktiv: true };
    openModal(isNew ? t("new_savings") : t("edit_savings"), [
      textField("bezeichnung", t("label_name"), sp.bezeichnung, t("ph_savings")),
      el("div", { class: "field-row" },
        numField("betrag", t("label_amount"), sp.betrag),
        selectField("intervall", t("label_interval"), intervalOptions(), sp.intervall)),
      el("div", { class: "field-row" },
        selectField("art", t("label_type"), sparArtOptions(), sp.art),
        selectField("person", t("label_person"), personOptions(), sp.person)),
      textField("notiz", t("label_note"), sp.notiz, t("ph_note_depot")),
    ], (vals) => {
      if (!vals.betrag) { toast(t("amount_required")); return false; }
      const rec = { id: sp.id, bezeichnung: vals.bezeichnung.trim() || t("default_savings_name"), betrag: Number(vals.betrag),
        intervall: vals.intervall, art: vals.art, person: vals.person, notiz: vals.notiz.trim(), aktiv: sp.aktiv !== false };
      const i = state.sparplaene.findIndex((x) => x.id === sp.id);
      if (i >= 0) state.sparplaene[i] = rec; else state.sparplaene.push(rec);
      save(); render(); toast(isNew ? t("savings_added") : t("saved"));
    });
  }

  function toggleSpar(id) {
    const sp = state.sparplaene.find((x) => x.id === id);
    if (!sp) return;
    sp.aktiv = sp.aktiv === false;
    save(); render();
  }
  function removeSpar(id) {
    if (!confirm(t("delete_savings_confirm"))) return;
    state.sparplaene = state.sparplaene.filter((x) => x.id !== id);
    save(); render(); toast(t("deleted"));
  }

  /* ---------- View: Kategorien ---------- */
  function renderKategorien(root) {
    root.appendChild(sectionHead(t("tab_kategorien"), t("categories_sub"),
      el("button", { class: "btn primary", onclick: () => openKategorieModal() }, t("add_category"))));

    root.appendChild(el("div", { class: "list" }, ...state.kategorien.map((k) => {
      const count = state.zahlungen.filter((z) => z.kategorieId === k.id).length;
      return el("div", { class: "item" },
        el("span", { class: "swatch", style: "background:" + k.farbe }),
        el("div", { class: "main" },
          el("div", { class: "title" }, k.name),
          el("div", { class: "meta" }, count === 1 ? t("payment_one", { n: count }) : t("payment_many", { n: count }))),
        el("div", { class: "value" }, ""),
        el("div", { class: "actions" },
          el("button", { class: "btn ghost icon", title: t("edit"), onclick: () => openKategorieModal(k) }, icon("edit")),
          el("button", { class: "btn danger icon", title: t("delete"), onclick: () => removeKategorie(k.id) }, icon("trash")))
      );
    })));
  }

  function openKategorieModal(entry) {
    const isNew = !entry;
    const k = entry || { id: uid("k"), name: "", farbe: PALETTE[state.kategorien.length % PALETTE.length] };
    openModal(isNew ? t("new_category") : t("edit_category"), [
      textField("name", t("label_name_plain"), k.name, t("ph_category")),
      colorField("farbe", t("label_color"), k.farbe),
    ], (vals) => {
      if (!vals.name.trim()) { toast(t("name_required")); return false; }
      const rec = { id: k.id, name: vals.name.trim(), farbe: vals.farbe };
      const i = state.kategorien.findIndex((x) => x.id === k.id);
      if (i >= 0) state.kategorien[i] = rec; else state.kategorien.push(rec);
      save(); render(); toast(isNew ? t("category_added") : t("saved"));
    });
  }

  function removeKategorie(id) {
    if (state.kategorien.length <= 1) { toast(t("min_one_category")); return; }
    const count = state.zahlungen.filter((z) => z.kategorieId === id).length;
    const fallback = state.kategorien.find((k) => k.id !== id);
    const msg = count > 0
      ? t("category_reassign_confirm", { n: count, fallback: fallback.name })
      : t("delete_category_confirm");
    if (!confirm(msg)) return;
    state.zahlungen.forEach((z) => { if (z.kategorieId === id) z.kategorieId = fallback.id; });
    state.kategorien = state.kategorien.filter((k) => k.id !== id);
    save(); render(); toast(t("deleted"));
  }

  /* ---------- View: Personen ---------- */
  function renderPersonen(root) {
    root.appendChild(sectionHead(t("tab_personen"), t("people_sub"),
      el("button", { class: "btn primary", onclick: () => openPersonModal() }, t("add_person"))));

    root.appendChild(el("div", { class: "list" }, ...state.personen.map((p) => {
      const einn = state.einnahmen.filter((e) => e.person === p.id).length;
      const zahl = state.zahlungen.filter((z) => z.person === p.id).length;
      return el("div", { class: "item" },
        el("span", { class: "swatch", style: "background:var(--primary)" }),
        el("div", { class: "main" },
          el("div", { class: "title" }, p.name),
          el("div", { class: "meta" }, t("person_counts", { e: einn, z: zahl }))),
        el("div", { class: "value" }, ""),
        el("div", { class: "actions" },
          el("button", { class: "btn ghost icon", title: t("edit"), onclick: () => openPersonModal(p) }, icon("edit")),
          el("button", { class: "btn danger icon", title: t("delete"), onclick: () => removePerson(p.id) }, icon("trash")))
      );
    })));
  }

  function openPersonModal(entry) {
    const isNew = !entry;
    const p = entry || { id: uid("p"), name: "" };
    openModal(isNew ? t("new_person") : t("edit_person"), [
      textField("name", t("label_name_plain"), p.name, t("ph_person")),
    ], (vals) => {
      const name = vals.name.trim();
      if (!name) { toast(t("name_required")); return false; }
      const rec = { id: p.id, name };
      const i = state.personen.findIndex((x) => x.id === p.id);
      if (i >= 0) state.personen[i] = rec; else state.personen.push(rec);
      save(); render(); toast(isNew ? t("person_added") : t("saved"));
    });
  }

  function removePerson(id) {
    if (state.personen.length <= 1) { toast(t("min_one_person")); return; }
    const count = state.einnahmen.filter((e) => e.person === id).length +
      state.zahlungen.filter((z) => z.person === id).length;
    const fallback = state.personen.find((p) => p.id !== id);
    const msg = count > 0
      ? t("person_reassign_confirm", { n: count, fallback: fallback.name })
      : t("delete_person_confirm");
    if (!confirm(msg)) return;
    state.einnahmen.forEach((e) => { if (e.person === id) e.person = fallback.id; });
    state.zahlungen.forEach((z) => { if (z.person === id) z.person = fallback.id; });
    state.sparplaene.forEach((s) => { if (s.person === id) s.person = fallback.id; });
    state.personen = state.personen.filter((p) => p.id !== id);
    if (personFilter === id) personFilter = "all";
    save(); render(); toast(t("deleted"));
  }

  /* ---------- View: Daten ---------- */
  function renderDaten(root) {
    root.appendChild(sectionHead(t("tab_daten"), t("data_sub")));

    root.appendChild(el("div", { class: "card" },
      el("h3", { style: "margin:0 0 6px" }, t("backup_title")),
      el("p", { class: "hint", style: "margin:0" }, t("backup_text")),
      el("div", { class: "data-actions" },
        el("button", { class: "btn primary", onclick: exportData }, icon("download"), t("export_json")),
        el("button", { class: "btn", onclick: startImport }, icon("upload"), t("import_json")))
    ));

    const c = calc();
    root.appendChild(el("div", { class: "card", style: "margin-top:18px" },
      el("h3", { style: "margin:0 0 10px" }, t("current_status")),
      el("div", { class: "person-card", style: "padding:0" },
        el("div", { class: "line" }, el("span", {}, t("st_income")), el("b", {}, String(state.einnahmen.length))),
        el("div", { class: "line" }, el("span", {}, t("st_payments")), el("b", {}, String(state.zahlungen.length))),
        el("div", { class: "line" }, el("span", {}, t("st_savings")), el("b", {}, String(state.sparplaene.length))),
        el("div", { class: "line" }, el("span", {}, t("st_categories")), el("b", {}, String(state.kategorien.length))),
        el("div", { class: "line" }, el("span", {}, t("st_income_month")), el("b", {}, fmt(c.income))),
        el("div", { class: "line" }, el("span", {}, t("st_costs_month")), el("b", {}, fmt(c.costs))),
        el("div", { class: "line" }, el("span", {}, t("st_savings_month")), el("b", {}, fmt(c.savings))))
    ));

    root.appendChild(el("div", { class: "card", style: "margin-top:18px" },
      el("h3", { style: "margin:0 0 6px" }, t("reset_title")),
      el("p", { class: "hint", style: "margin:0" }, t("reset_text")),
      el("div", { class: "data-actions" },
        el("button", { class: "btn danger", onclick: resetData }, t("reset_btn")))
    ));
  }

  // Tauri stellt beim Desktop-Build native Datei-Dialoge bereit (window.__TAURI__).
  // Im normalen Browser wird auf Blob-Download / Datei-Auswahl zurückgegriffen.
  function tauriFs() {
    const t2 = window.__TAURI__;
    return t2 && t2.dialog && t2.fs ? t2 : null;
  }

  // Text-Datei speichern (Tauri-Dialog oder Browser-Download)
  async function saveTextFile(defaultName, mime, text) {
    const ext = defaultName.split(".").pop();
    const tf = tauriFs();
    if (tf) {
      try {
        const path = await tf.dialog.save({ defaultPath: defaultName, filters: [{ name: ext.toUpperCase(), extensions: [ext] }] });
        if (!path) return false;
        await tf.fs.writeTextFile(path, text);
        return true;
      } catch (e) { console.error(e); toast(t("export_failed")); return false; }
    }
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = el("a", { href: url, download: defaultName });
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    return true;
  }

  // Text-Datei einlesen (Tauri-Dialog oder Browser-Dateiauswahl)
  async function openTextFile(extensions, cb) {
    const tf = tauriFs();
    if (tf) {
      try {
        const path = await tf.dialog.open({ multiple: false, filters: [{ name: t("file_label"), extensions }] });
        if (!path) return;
        cb(await tf.fs.readTextFile(path));
      } catch (e) { console.error(e); toast(t("import_failed")); }
      return;
    }
    const input = el("input", { type: "file", accept: extensions.map((e) => "." + e).join(","), style: "display:none" });
    input.addEventListener("change", () => {
      const f = input.files && input.files[0];
      if (!f) { input.remove(); return; }
      const r = new FileReader();
      r.onload = () => { cb(String(r.result)); input.remove(); };
      r.readAsText(f, "utf-8");
    });
    document.body.appendChild(input);
    input.click();
  }

  /* ----- JSON: vollständiges Backup ----- */
  async function exportData() {
    if (await saveTextFile("sparblick-export.json", "application/json", JSON.stringify(state, null, 2))) {
      toast(t("export_done"));
    }
  }
  function startImport() {
    openTextFile(["json"], (text) => {
      let incoming;
      try {
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== "object") throw new Error("ungültig");
        incoming = migrate(parsed);
      } catch (e) {
        toast(t("file_unreadable"));
        return;
      }
      openChoice(t("import_title"), t("import_question"), [
        { label: t("cancel"), cls: "ghost" },
        { label: t("merge"), onClick: () => { state = mergeState(state, incoming); save(); render(); toast(t("merged")); } },
        { label: t("replace"), cls: "primary", onClick: () => { state = incoming; save(); render(); toast(t("replaced")); } },
      ]);
    });
  }

  // Importierte Daten mit den bestehenden zusammenführen (ohne Duplikate):
  // Personen/Kategorien werden über den Namen abgeglichen, Einträge über ihre id.
  function mergeState(current, incoming) {
    const result = {
      version: 1,
      personen: current.personen.slice(),
      kategorien: current.kategorien.slice(),
      einnahmen: current.einnahmen.slice(),
      zahlungen: current.zahlungen.slice(),
      sparplaene: current.sparplaene.slice(),
    };

    const personIdMap = {}; // id aus Import -> gültige id im Ergebnis
    for (const p of incoming.personen) {
      const existing = result.personen.find((x) => x.name.toLowerCase() === p.name.toLowerCase());
      if (existing) { personIdMap[p.id] = existing.id; continue; }
      let id = p.id;
      if (result.personen.some((x) => x.id === id)) id = uid("p");
      result.personen.push({ id, name: p.name });
      personIdMap[p.id] = id;
    }

    const katIdMap = {};
    for (const k of incoming.kategorien) {
      const existing = result.kategorien.find((x) => x.name.toLowerCase() === k.name.toLowerCase());
      if (existing) { katIdMap[k.id] = existing.id; continue; }
      let id = k.id;
      if (result.kategorien.some((x) => x.id === id)) id = uid("k");
      result.kategorien.push({ id, name: k.name, farbe: k.farbe });
      katIdMap[k.id] = id;
    }

    // Einträge übernehmen, deren id noch nicht existiert; Referenzen umschreiben.
    const addEntries = (target, source) => {
      const ids = new Set(target.map((e) => e.id));
      for (const e of source) {
        if (ids.has(e.id)) continue; // gleiche id -> bereits vorhanden (Re-Import)
        const copy = Object.assign({}, e);
        if (copy.person) copy.person = personIdMap[copy.person] || copy.person;
        if (copy.kategorieId) copy.kategorieId = katIdMap[copy.kategorieId] || copy.kategorieId;
        target.push(copy);
        ids.add(copy.id);
      }
    };
    addEntries(result.einnahmen, incoming.einnahmen);
    addEntries(result.zahlungen, incoming.zahlungen);
    addEntries(result.sparplaene, incoming.sparplaene);

    return result;
  }

  function resetData() {
    if (!confirm(t("reset_confirm"))) return;
    state = defaultData();
    save(); render(); toast(t("reset_done"));
  }

  /* ---------- Gemeinsame UI-Bausteine ---------- */
  function sectionHead(title, subtitle, action) {
    return el("div", { class: "section-head" },
      el("div", {}, el("h2", {}, title), subtitle ? el("p", {}, subtitle) : null),
      action || null);
  }

  function emptyState(title, text) {
    return el("div", { class: "card empty" },
      el("div", { style: "font-size:2rem" }, "📋"),
      el("div", { style: "font-weight:600;color:var(--text)" }, title),
      el("div", {}, text));
  }

  function intervalOptions() {
    return Object.keys(INTERVALS).map((k) => [k, intervalLabel(k)]);
  }
  function personOptions() {
    return state.personen.map((p) => [p.id, p.name]);
  }

  function textField(name, label, value, placeholder) {
    return el("div", { class: "field" },
      el("label", { for: "f_" + name }, label),
      el("input", { type: "text", id: "f_" + name, name, value: value || "", placeholder: placeholder || "" }));
  }
  function numField(name, label, value) {
    return el("div", { class: "field" },
      el("label", { for: "f_" + name }, label),
      el("input", { type: "number", id: "f_" + name, name, value: value === "" || value == null ? "" : value, min: "0", step: "0.01", placeholder: "0,00" }));
  }
  function dateField(name, label, value) {
    return el("div", { class: "field" },
      el("label", { for: "f_" + name }, label),
      el("input", { type: "date", id: "f_" + name, name, value: value || "" }));
  }
  function selectField(name, label, options, value) {
    const s = el("select", { id: "f_" + name, name });
    for (const [v, l] of options) {
      const o = el("option", { value: v }, l);
      if (v === value) o.selected = true;
      s.appendChild(o);
    }
    return el("div", { class: "field" }, el("label", { for: "f_" + name }, label), s);
  }
  function colorField(name, label, value) {
    const wrap = el("div", { class: "color-picker" });
    PALETTE.forEach((color, i) => {
      const id = "c_" + name + "_" + i;
      const input = el("input", { type: "radio", name, id, value: color });
      if (color === value) input.checked = true;
      wrap.appendChild(input);
      wrap.appendChild(el("label", { for: id, style: "background:" + color }));
    });
    // sicherstellen, dass ein Wert gewählt ist
    if (!PALETTE.includes(value)) wrap.querySelector("input").checked = true;
    return el("div", { class: "field" }, el("label", {}, label), wrap);
  }

  /* ---------- Modal ---------- */
  function openModal(title, fields, onSave) {
    closeModal();
    const form = el("form", { class: "modal-body" }, ...fields);
    const backdrop = el("div", { class: "modal-backdrop", onclick: (e) => { if (e.target === backdrop) closeModal(); } },
      el("div", { class: "modal", role: "dialog" },
        el("div", { class: "modal-head" }, title),
        form,
        el("div", { class: "modal-foot" },
          el("button", { type: "button", class: "btn ghost", onclick: closeModal }, t("cancel")),
          el("button", { type: "submit", class: "btn primary", form: "__modalForm" }, t("save_btn")))));
    form.id = "__modalForm";
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const vals = {};
      new FormData(form).forEach((v, k) => { vals[k] = v; });
      const res = onSave(vals);
      if (res !== false) closeModal();
    });
    $("#modalRoot").appendChild(backdrop);
    const first = form.querySelector("input, select, textarea");
    if (first) first.focus();
    document.addEventListener("keydown", escClose);
  }
  function escClose(e) { if (e.key === "Escape") closeModal(); }
  function closeModal() {
    $("#modalRoot").innerHTML = "";
    document.removeEventListener("keydown", escClose);
  }

  // Auswahldialog mit mehreren Aktionsknöpfen (z. B. Zusammenführen / Ersetzen).
  function openChoice(title, message, actions) {
    closeModal();
    const buttons = actions.map((a) =>
      el("button", { class: "btn " + (a.cls || ""), onclick: () => { closeModal(); if (a.onClick) a.onClick(); } }, a.label));
    const backdrop = el("div", { class: "modal-backdrop", onclick: (e) => { if (e.target === backdrop) closeModal(); } },
      el("div", { class: "modal", role: "dialog" },
        el("div", { class: "modal-head" }, title),
        el("div", { class: "modal-body" }, el("p", { class: "hint", style: "margin:0" }, message)),
        el("div", { class: "modal-foot" }, ...buttons)));
    $("#modalRoot").appendChild(backdrop);
    document.addEventListener("keydown", escClose);
  }

  /* ---------- Sprachumschalter ---------- */
  function buildLangToggle() {
    const hc = document.querySelector(".header-controls");
    if (!hc) return;
    const seg = el("div", { class: "seg lang-seg" },
      el("button", { "data-lang": "de", onclick: () => setLang("de") }, "DE"),
      el("button", { "data-lang": "en", onclick: () => setLang("en") }, "EN"));
    hc.insertBefore(seg, hc.firstChild);
    updateLangToggle();
  }
  function updateLangToggle() {
    document.querySelectorAll(".lang-seg button").forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
  }
  function setLang(l) {
    if (l === lang) return;
    lang = l;
    try { localStorage.setItem(LANG_KEY, l); } catch (e) { /* ignore */ }
    updateLangToggle();
    render();
  }

  /* ---------- Init ---------- */
  document.querySelectorAll(".tab").forEach((tab) =>
    tab.addEventListener("click", () => { currentView = tab.dataset.view; render(); })
  );
  $("#personFilter").addEventListener("change", (e) => { personFilter = e.target.value; render(); });

  buildLangToggle();
  render();

  // PWA: Service Worker registrieren (nur im Browser über https/localhost;
  // im Desktop-Build/Tauri und unter file:// wird bewusst übersprungen).
  if ("serviceWorker" in navigator && !window.__TAURI__ && location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch((e) => console.warn("SW-Registrierung fehlgeschlagen:", e));
    });
  }
})();
