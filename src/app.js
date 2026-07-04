/* Sparblick — lokale Verwaltung von Einnahmen, Verträgen und Zahlungen.
 * Keine externen Abhängigkeiten. Daten liegen im localStorage des Geräts. */
(function () {
  "use strict";

  const STORAGE_KEY = "tyb_data_v1";
  const CURRENCY = "EUR";

  /* ---------- Intervalle: Umrechnung auf Monatsbetrag ---------- */
  const INTERVALS = {
    woechentlich: { label: "wöchentlich", perMonth: 52 / 12 },
    monatlich:    { label: "monatlich",   perMonth: 1 },
    quartalsweise:{ label: "quartalsweise", perMonth: 1 / 3 },
    halbjaehrlich:{ label: "halbjährlich", perMonth: 1 / 6 },
    jaehrlich:    { label: "jährlich",    perMonth: 1 / 12 },
  };

  const PALETTE = [
    "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6",
    "#ec4899", "#14b8a6", "#8b5cf6", "#f97316", "#64748b",
  ];

  /* ---------- Standarddaten für den ersten Start ---------- */
  function defaultData() {
    return {
      version: 1,
      // Personen sind bewusst als Liste modelliert, damit später echte
      // Profile mit getrennten Budgets ergänzt werden können.
      personen: [
        { id: "p_ich", name: "Ich" },
        { id: "p_partner", name: "Partnerin" },
        { id: "p_gemeinsam", name: "Gemeinsam" },
      ],
      kategorien: [
        { id: "k_wohnen", name: "Wohnen & Miete", farbe: "#6366f1" },
        { id: "k_versicherung", name: "Versicherungen", farbe: "#3b82f6" },
        { id: "k_sport", name: "Sport & Fitness", farbe: "#10b981" },
        { id: "k_abos", name: "Abos & Streaming", farbe: "#ec4899" },
        { id: "k_mobilitaet", name: "Mobilität & Auto", farbe: "#f59e0b" },
        { id: "k_telekom", name: "Telefon & Internet", farbe: "#14b8a6" },
        { id: "k_lebensmittel", name: "Lebensmittel (pauschal)", farbe: "#f97316" },
        { id: "k_sonstiges", name: "Sonstiges", farbe: "#64748b" },
      ],
      einnahmen: [],
      zahlungen: [],
      sparplaene: [],
    };
  }

  // Arten von Sparplänen/Anlagen
  const SPAR_ARTEN = [
    ["etf", "ETF / Fonds"],
    ["aktien", "Aktien"],
    ["sparkonto", "Tagesgeld / Sparkonto"],
    ["altersvorsorge", "Altersvorsorge"],
    ["krypto", "Krypto"],
    ["sonstiges", "Sonstiges"],
  ];
  const sparArtLabel = (a) => (SPAR_ARTEN.find((x) => x[0] === a) || SPAR_ARTEN[SPAR_ARTEN.length - 1])[1];

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
      toast("Speichern fehlgeschlagen");
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

  const eur = new Intl.NumberFormat("de-DE", { style: "currency", currency: CURRENCY });
  const fmt = (n) => eur.format(n || 0);
  const fmtPct = (n) => (n * 100).toFixed(n < 0.1 ? 1 : 0) + " %";

  function monthly(entry) {
    const iv = INTERVALS[entry.intervall] || INTERVALS.monatlich;
    return (Number(entry.betrag) || 0) * iv.perMonth;
  }

  /* ---------- Datum / Fälligkeiten ---------- */
  const MONTHS_PER_INTERVAL = { monatlich: 1, quartalsweise: 3, halbjaehrlich: 6, jaehrlich: 12 };
  const dateFmt = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

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
    if (days <= 0) return "heute fällig";
    if (days === 1) return "morgen fällig";
    return "in " + days + " Tagen";
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
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2200);
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
          name: k ? k.name : "Ohne Kategorie",
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
  function renderPersonFilter() {
    const sel = $("#personFilter");
    sel.innerHTML = "";
    sel.appendChild(el("option", { value: "all" }, "Alle zusammen"));
    for (const p of state.personen) sel.appendChild(el("option", { value: p.id }, p.name));
    sel.value = personFilter;
  }

  function render() {
    renderPersonFilter();
    document.querySelectorAll(".tab").forEach((t) =>
      t.classList.toggle("is-active", t.dataset.view === currentView)
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
    const per = period === "jahr" ? "Jahr" : "Monat";

    // Umschalter Monat / Jahr
    root.appendChild(el("div", { class: "section-head", style: "margin-bottom:14px" },
      el("div", {}, el("h2", { style: "font-size:1.15rem" }, "Übersicht"),
        el("p", {}, "Alle Beträge " + (period === "jahr" ? "pro Jahr" : "pro Monat"))),
      el("div", { class: "seg" },
        el("button", { class: period === "monat" ? "active" : "", onclick: () => { period = "monat"; render(); } }, "Monat"),
        el("button", { class: period === "jahr" ? "active" : "", onclick: () => { period = "jahr"; render(); } }, "Jahr"))
    ));

    root.appendChild(
      el("div", { class: "kpi-grid" },
        kpiCard("Einkommen / " + per, fmt(c.income * f), "accent"),
        kpiCard("Fixkosten / " + per, fmt(c.costs * f)),
        kpiCard("Sparen / " + per, fmt(c.savings * f), "pos",
          c.income > 0 ? "Sparquote " + fmtPct(savingRate) : ""),
        kpiCard("Frei verfügbar", fmt(c.rest * f), c.rest >= 0 ? "" : "neg",
          "nach Kosten & Sparen")
      )
    );

    renderFaelligkeiten(root);

    if (c.costs === 0) {
      root.appendChild(emptyState("Noch keine Zahlungen erfasst.",
        "Lege unter „Zahlungen“ deine Verträge und Abos an, um die Aufteilung zu sehen."));
    } else {
      root.appendChild(
        el("div", { class: "dash-grid" },
          el("div", { class: "card donut-wrap" },
            donut(c.catRows, c.costs, f, per),
            el("div", { class: "hint" }, "Aufteilung der Fixkosten")
          ),
          el("div", { class: "card" },
            el("div", { class: "section-head" }, el("h2", { style: "font-size:1.05rem" }, "Nach Kategorie")),
            el("div", { class: "cat-list" }, ...c.catRows.map((r) => catRow(r, c.income, f)))
          )
        )
      );
    }

    // Pro-Person-Aufschlüsselung (nur wenn „Alle“ gewählt)
    if (personFilter === "all") {
      const cards = state.personen.map((p) => {
        const inc = state.einnahmen.filter((e) => e.person === p.id).reduce((s, e) => s + monthly(e), 0);
        const cost = state.zahlungen.filter((z) => z.aktiv !== false && z.person === p.id).reduce((s, z) => s + monthly(z), 0);
        const save = state.sparplaene.filter((s) => s.aktiv !== false && s.person === p.id).reduce((s, sp) => s + monthly(sp), 0);
        if (inc === 0 && cost === 0 && save === 0) return null;
        return el("div", { class: "card person-card" },
          el("h4", {}, p.name),
          el("div", { class: "line" }, el("span", {}, "Einkommen"), el("b", {}, fmt(inc * f))),
          el("div", { class: "line" }, el("span", {}, "Kosten"), el("b", {}, fmt(cost * f))),
          el("div", { class: "line" }, el("span", {}, "Sparen"), el("b", {}, fmt(save * f))),
          el("div", { class: "line" }, el("span", {}, "Frei"), el("b", {}, fmt((inc - cost - save) * f)))
        );
      }).filter(Boolean);
      if (cards.length) {
        root.appendChild(el("div", { class: "section-head", style: "margin-top:26px" },
          el("div", {}, el("h2", { style: "font-size:1.05rem" }, "Pro Person"),
            el("p", {}, "Grundlage für spätere getrennte Budgets"))));
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
        el("h2", { style: "font-size:1.05rem" }, "Demnächst fällig")),
      el("div", { class: "due-list" }, ...items.map(({ z, due }) => {
        const days = daysUntil(due);
        const k = kategorieById(z.kategorieId);
        const urg = days <= 3 ? "due-soon" : days <= 10 ? "due-near" : "";
        return el("div", { class: "due-row" },
          el("span", { class: "dot", style: "background:" + (k ? k.farbe : "#64748b") }),
          el("div", { class: "due-main" },
            el("div", { class: "due-name" }, z.bezeichnung || "Zahlung"),
            el("div", { class: "meta" }, dateFmt.format(due) + " · " + (INTERVALS[z.intervall] || INTERVALS.monatlich).label)),
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
      el("div", { class: "pct" }, income > 0 ? fmtPct(r.pctIncome) + " vom Einkommen" : fmtPct(r.pctCosts) + " der Kosten")
    );
  }

  /* SVG-Donut-Diagramm */
  function donut(rows, total, f, per) {
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
        el("div", { class: "small" }, "pro " + (per || "Monat"))));
  }

  /* ---------- View: Einnahmen ---------- */
  function renderEinnahmen(root) {
    root.appendChild(sectionHead("Einnahmen", "Dein monatliches Einkommen — auch pro Person erfassbar.",
      el("button", { class: "btn primary", onclick: () => openEinnahmeModal() }, "+ Einnahme")));

    const list = state.einnahmen.filter(matchesPerson);
    if (!list.length) {
      root.appendChild(emptyState("Noch keine Einnahmen.", "Trage z. B. dein Gehalt ein."));
      return;
    }
    root.appendChild(el("div", { class: "list" }, ...list.map((e) =>
      el("div", { class: "item" },
        el("span", { class: "swatch", style: "background:var(--success)" }),
        el("div", { class: "main" },
          el("div", { class: "title" }, e.bezeichnung || "Einnahme",
            el("span", { class: "tag muted" }, personName(e.person))),
          el("div", { class: "meta" }, INTERVALS[e.intervall].label)),
        el("div", { class: "value" }, fmt(monthly(e)),
          el("small", {}, e.intervall !== "monatlich" ? fmt(e.betrag) + " " + INTERVALS[e.intervall].label : "/ Monat")),
        el("div", { class: "actions" },
          el("button", { class: "btn ghost icon", title: "Bearbeiten", onclick: () => openEinnahmeModal(e) }, icon("edit")),
          el("button", { class: "btn danger icon", title: "Löschen", onclick: () => removeEinnahme(e.id) }, icon("trash")))
      )
    )));
  }

  function openEinnahmeModal(entry) {
    const isNew = !entry;
    const e = entry || { id: uid("e"), bezeichnung: "", betrag: "", intervall: "monatlich", person: state.personen[0].id };
    openModal(isNew ? "Neue Einnahme" : "Einnahme bearbeiten", [
      textField("bezeichnung", "Bezeichnung", e.bezeichnung, "z. B. Gehalt"),
      el("div", { class: "field-row" },
        numField("betrag", "Betrag (€)", e.betrag),
        selectField("intervall", "Intervall", intervalOptions(), e.intervall)),
      selectField("person", "Person", personOptions(), e.person),
    ], (vals) => {
      if (!vals.betrag) { toast("Bitte Betrag angeben"); return false; }
      const rec = { id: e.id, bezeichnung: vals.bezeichnung.trim() || "Einnahme", betrag: Number(vals.betrag), intervall: vals.intervall, person: vals.person };
      const i = state.einnahmen.findIndex((x) => x.id === e.id);
      if (i >= 0) state.einnahmen[i] = rec; else state.einnahmen.push(rec);
      save(); render(); toast(isNew ? "Einnahme hinzugefügt" : "Gespeichert");
    });
  }

  function removeEinnahme(id) {
    if (!confirm("Diese Einnahme löschen?")) return;
    state.einnahmen = state.einnahmen.filter((x) => x.id !== id);
    save(); render(); toast("Gelöscht");
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
      name: (a, b) => (a.bezeichnung || "").localeCompare(b.bezeichnung || "", "de"),
    };
    return list.slice().sort(sorters[zahlungFilter.sort] || sorters.betrag_desc);
  }

  function renderZahlungen(root) {
    if (zahlungFilter.kategorie !== "all" && !kategorieById(zahlungFilter.kategorie)) {
      zahlungFilter.kategorie = "all";
    }
    root.appendChild(sectionHead("Zahlungen & Verträge", "Abos, Verträge und feste monatliche Ausgaben.",
      el("button", { class: "btn primary", onclick: () => openZahlungModal() }, "+ Zahlung")));

    if (!state.zahlungen.filter(matchesPerson).length) {
      root.appendChild(emptyState("Noch keine Zahlungen.", "Lege deinen ersten Vertrag oder ein Abo an."));
      return;
    }

    // Filterleiste
    const katSelect = el("select", { onchange: (e) => { zahlungFilter.kategorie = e.target.value; paintZahlungList(); } },
      el("option", { value: "all" }, "Alle Kategorien"),
      ...state.kategorien.map((k) => {
        const o = el("option", { value: k.id }, k.name);
        if (k.id === zahlungFilter.kategorie) o.selected = true;
        return o;
      }));
    const sortSelect = el("select", { onchange: (e) => { zahlungFilter.sort = e.target.value; paintZahlungList(); } },
      ...[["betrag_desc", "Betrag absteigend"], ["betrag_asc", "Betrag aufsteigend"], ["name", "Name (A–Z)"]].map(([v, l]) => {
        const o = el("option", { value: v }, l);
        if (v === zahlungFilter.sort) o.selected = true;
        return o;
      }));
    const search = el("input", { type: "text", class: "search", placeholder: "Suchen …", value: zahlungFilter.suche,
      oninput: (e) => { zahlungFilter.suche = e.target.value; paintZahlungList(); } });

    root.appendChild(el("div", { class: "filter-bar" }, search, katSelect, sortSelect,
      el("button", { class: "btn ghost small", onclick: () => { zahlungFilter = { kategorie: "all", suche: "", sort: "betrag_desc" }; render(); } }, "Zurücksetzen")));

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
      summary.textContent = `${list.length} Zahlung(en)` +
        (list.length ? ` · ${fmt(sum)}/Monat · ${fmt(sum * 12)}/Jahr (aktive)` : "");
    }
    container.innerHTML = "";
    if (!list.length) {
      container.appendChild(el("div", { class: "empty" }, "Keine Zahlungen für diesen Filter."));
      return;
    }
    for (const z of list) {
      const k = kategorieById(z.kategorieId);
      const due = z.aktiv !== false ? nextDue(z) : null;
      const dueDays = due ? daysUntil(due) : null;
      container.appendChild(el("div", { class: "item" + (z.aktiv === false ? " inactive" : "") },
        el("span", { class: "swatch", style: "background:" + (k ? k.farbe : "#64748b") }),
        el("div", { class: "main" },
          el("div", { class: "title" }, z.bezeichnung || "Zahlung",
            k ? el("span", { class: "tag" }, k.name) : null,
            z.aktiv === false ? el("span", { class: "tag muted" }, "pausiert") : null,
            due && dueDays <= 7 ? el("span", { class: "tag warn" }, faelligkeitText(dueDays)) : null,
            el("span", { class: "tag muted" }, personName(z.person))),
          el("div", { class: "meta" }, INTERVALS[z.intervall].label
            + (due ? " · fällig " + dateFmt.format(due) : "")
            + (z.notiz ? " · " + z.notiz : ""))),
        el("div", { class: "value" }, fmt(monthly(z)),
          el("small", {}, z.intervall !== "monatlich" ? fmt(z.betrag) + " " + INTERVALS[z.intervall].label : "/ Monat")),
        el("div", { class: "actions" },
          el("button", { class: "btn ghost icon", title: z.aktiv === false ? "Aktivieren" : "Pausieren", onclick: () => toggleZahlung(z.id) }, icon(z.aktiv === false ? "play" : "pause")),
          el("button", { class: "btn ghost icon", title: "Bearbeiten", onclick: () => openZahlungModal(z) }, icon("edit")),
          el("button", { class: "btn danger icon", title: "Löschen", onclick: () => removeZahlung(z.id) }, icon("trash")))
      ));
    }
  }

  function openZahlungModal(entry) {
    const isNew = !entry;
    const z = entry || { id: uid("z"), bezeichnung: "", betrag: "", intervall: "monatlich",
      kategorieId: state.kategorien[0].id, person: state.personen[state.personen.length - 1].id, notiz: "", aktiv: true };
    openModal(isNew ? "Neue Zahlung" : "Zahlung bearbeiten", [
      textField("bezeichnung", "Bezeichnung", z.bezeichnung, "z. B. Netflix, Miete, Fitnessstudio"),
      el("div", { class: "field-row" },
        numField("betrag", "Betrag (€)", z.betrag),
        selectField("intervall", "Intervall", intervalOptions(), z.intervall)),
      el("div", { class: "field-row" },
        selectField("kategorieId", "Kategorie", state.kategorien.map((k) => [k.id, k.name]), z.kategorieId),
        selectField("person", "Person", personOptions(), z.person)),
      el("div", { class: "field-row" },
        dateField("faellig", "Nächste Fälligkeit (optional)", z.faellig),
        textField("notiz", "Notiz (optional)", z.notiz, "z. B. Vertragsende 12/2026")),
    ], (vals) => {
      if (!vals.betrag) { toast("Bitte Betrag angeben"); return false; }
      const rec = { id: z.id, bezeichnung: vals.bezeichnung.trim() || "Zahlung", betrag: Number(vals.betrag),
        intervall: vals.intervall, kategorieId: vals.kategorieId, person: vals.person, notiz: vals.notiz.trim(),
        faellig: vals.faellig || "", aktiv: z.aktiv !== false };
      const i = state.zahlungen.findIndex((x) => x.id === z.id);
      if (i >= 0) state.zahlungen[i] = rec; else state.zahlungen.push(rec);
      save(); render(); toast(isNew ? "Zahlung hinzugefügt" : "Gespeichert");
    });
  }

  function toggleZahlung(id) {
    const z = state.zahlungen.find((x) => x.id === id);
    if (!z) return;
    z.aktiv = z.aktiv === false;
    save(); render();
  }
  function removeZahlung(id) {
    if (!confirm("Diese Zahlung löschen?")) return;
    state.zahlungen = state.zahlungen.filter((x) => x.id !== id);
    save(); render(); toast("Gelöscht");
  }

  /* ---------- View: Sparen ---------- */
  function renderSparen(root) {
    root.appendChild(sectionHead("Sparen & Anlegen",
      "Regelmäßige Sparraten – z. B. ETF-Sparpläne, Tagesgeld oder Altersvorsorge.",
      el("button", { class: "btn primary", onclick: () => openSparModal() }, "+ Sparrate")));

    const list = state.sparplaene.filter(matchesPerson);
    if (!list.length) {
      root.appendChild(emptyState("Noch keine Sparraten.", "Lege z. B. deinen ETF-Sparplan an."));
      return;
    }
    const total = list.filter((s) => s.aktiv !== false).reduce((s, sp) => s + monthly(sp), 0);
    root.appendChild(el("p", { class: "filter-summary" },
      `${list.length} Sparrate(n) · ${fmt(total)}/Monat · ${fmt(total * 12)}/Jahr (aktive)`));

    root.appendChild(el("div", { class: "list" }, ...list
      .slice().sort((a, b) => monthly(b) - monthly(a)).map((sp) =>
        el("div", { class: "item" + (sp.aktiv === false ? " inactive" : "") },
          el("span", { class: "swatch", style: "background:var(--success)" }),
          el("div", { class: "main" },
            el("div", { class: "title" }, sp.bezeichnung || "Sparrate",
              el("span", { class: "tag" }, sparArtLabel(sp.art)),
              sp.aktiv === false ? el("span", { class: "tag muted" }, "pausiert") : null,
              el("span", { class: "tag muted" }, personName(sp.person))),
            el("div", { class: "meta" }, INTERVALS[sp.intervall].label + (sp.notiz ? " · " + sp.notiz : ""))),
          el("div", { class: "value" }, fmt(monthly(sp)),
            el("small", {}, sp.intervall !== "monatlich" ? fmt(sp.betrag) + " " + INTERVALS[sp.intervall].label : "/ Monat")),
          el("div", { class: "actions" },
            el("button", { class: "btn ghost icon", title: sp.aktiv === false ? "Aktivieren" : "Pausieren", onclick: () => toggleSpar(sp.id) }, icon(sp.aktiv === false ? "play" : "pause")),
            el("button", { class: "btn ghost icon", title: "Bearbeiten", onclick: () => openSparModal(sp) }, icon("edit")),
            el("button", { class: "btn danger icon", title: "Löschen", onclick: () => removeSpar(sp.id) }, icon("trash")))
        ))));
  }

  function openSparModal(entry) {
    const isNew = !entry;
    const sp = entry || { id: uid("s"), bezeichnung: "", betrag: "", intervall: "monatlich",
      art: "etf", person: state.personen[0].id, notiz: "", aktiv: true };
    openModal(isNew ? "Neue Sparrate" : "Sparrate bearbeiten", [
      textField("bezeichnung", "Bezeichnung", sp.bezeichnung, "z. B. MSCI World ETF"),
      el("div", { class: "field-row" },
        numField("betrag", "Betrag (€)", sp.betrag),
        selectField("intervall", "Intervall", intervalOptions(), sp.intervall)),
      el("div", { class: "field-row" },
        selectField("art", "Art", SPAR_ARTEN, sp.art),
        selectField("person", "Person", personOptions(), sp.person)),
      textField("notiz", "Notiz (optional)", sp.notiz, "z. B. Depot bei …"),
    ], (vals) => {
      if (!vals.betrag) { toast("Bitte Betrag angeben"); return false; }
      const rec = { id: sp.id, bezeichnung: vals.bezeichnung.trim() || "Sparrate", betrag: Number(vals.betrag),
        intervall: vals.intervall, art: vals.art, person: vals.person, notiz: vals.notiz.trim(), aktiv: sp.aktiv !== false };
      const i = state.sparplaene.findIndex((x) => x.id === sp.id);
      if (i >= 0) state.sparplaene[i] = rec; else state.sparplaene.push(rec);
      save(); render(); toast(isNew ? "Sparrate hinzugefügt" : "Gespeichert");
    });
  }

  function toggleSpar(id) {
    const sp = state.sparplaene.find((x) => x.id === id);
    if (!sp) return;
    sp.aktiv = sp.aktiv === false;
    save(); render();
  }
  function removeSpar(id) {
    if (!confirm("Diese Sparrate löschen?")) return;
    state.sparplaene = state.sparplaene.filter((x) => x.id !== id);
    save(); render(); toast("Gelöscht");
  }

  /* ---------- View: Kategorien ---------- */
  function renderKategorien(root) {
    root.appendChild(sectionHead("Kategorien", "Ordne deine Zahlungen thematisch — Farben erscheinen im Diagramm.",
      el("button", { class: "btn primary", onclick: () => openKategorieModal() }, "+ Kategorie")));

    root.appendChild(el("div", { class: "list" }, ...state.kategorien.map((k) => {
      const count = state.zahlungen.filter((z) => z.kategorieId === k.id).length;
      return el("div", { class: "item" },
        el("span", { class: "swatch", style: "background:" + k.farbe }),
        el("div", { class: "main" },
          el("div", { class: "title" }, k.name),
          el("div", { class: "meta" }, count + (count === 1 ? " Zahlung" : " Zahlungen"))),
        el("div", { class: "value" }, ""),
        el("div", { class: "actions" },
          el("button", { class: "btn ghost icon", title: "Bearbeiten", onclick: () => openKategorieModal(k) }, icon("edit")),
          el("button", { class: "btn danger icon", title: "Löschen", onclick: () => removeKategorie(k.id) }, icon("trash")))
      );
    })));
  }

  function openKategorieModal(entry) {
    const isNew = !entry;
    const k = entry || { id: uid("k"), name: "", farbe: PALETTE[state.kategorien.length % PALETTE.length] };
    openModal(isNew ? "Neue Kategorie" : "Kategorie bearbeiten", [
      textField("name", "Name", k.name, "z. B. Freizeit"),
      colorField("farbe", "Farbe", k.farbe),
    ], (vals) => {
      if (!vals.name.trim()) { toast("Bitte Name angeben"); return false; }
      const rec = { id: k.id, name: vals.name.trim(), farbe: vals.farbe };
      const i = state.kategorien.findIndex((x) => x.id === k.id);
      if (i >= 0) state.kategorien[i] = rec; else state.kategorien.push(rec);
      save(); render(); toast(isNew ? "Kategorie hinzugefügt" : "Gespeichert");
    });
  }

  function removeKategorie(id) {
    const count = state.zahlungen.filter((z) => z.kategorieId === id).length;
    if (state.kategorien.length <= 1) { toast("Mindestens eine Kategorie muss bleiben"); return; }
    const msg = count > 0
      ? `Diese Kategorie hat ${count} Zahlung(en). Diese werden auf „Sonstiges“ verschoben. Fortfahren?`
      : "Diese Kategorie löschen?";
    if (!confirm(msg)) return;
    const fallback = state.kategorien.find((k) => k.id !== id);
    state.zahlungen.forEach((z) => { if (z.kategorieId === id) z.kategorieId = fallback.id; });
    state.kategorien = state.kategorien.filter((k) => k.id !== id);
    save(); render(); toast("Gelöscht");
  }

  /* ---------- View: Personen ---------- */
  function renderPersonen(root) {
    root.appendChild(sectionHead("Personen", "Wer teilt sich das Budget? Grundlage für später getrennte Profile.",
      el("button", { class: "btn primary", onclick: () => openPersonModal() }, "+ Person")));

    root.appendChild(el("div", { class: "list" }, ...state.personen.map((p) => {
      const einn = state.einnahmen.filter((e) => e.person === p.id).length;
      const zahl = state.zahlungen.filter((z) => z.person === p.id).length;
      return el("div", { class: "item" },
        el("span", { class: "swatch", style: "background:var(--primary)" }),
        el("div", { class: "main" },
          el("div", { class: "title" }, p.name),
          el("div", { class: "meta" }, `${einn} Einnahme(n) · ${zahl} Zahlung(en)`)),
        el("div", { class: "value" }, ""),
        el("div", { class: "actions" },
          el("button", { class: "btn ghost icon", title: "Bearbeiten", onclick: () => openPersonModal(p) }, icon("edit")),
          el("button", { class: "btn danger icon", title: "Löschen", onclick: () => removePerson(p.id) }, icon("trash")))
      );
    })));
  }

  function openPersonModal(entry) {
    const isNew = !entry;
    const p = entry || { id: uid("p"), name: "" };
    openModal(isNew ? "Neue Person" : "Person bearbeiten", [
      textField("name", "Name", p.name, "z. B. dein Name oder der deiner Frau"),
    ], (vals) => {
      const name = vals.name.trim();
      if (!name) { toast("Bitte Name angeben"); return false; }
      const rec = { id: p.id, name };
      const i = state.personen.findIndex((x) => x.id === p.id);
      if (i >= 0) state.personen[i] = rec; else state.personen.push(rec);
      save(); render(); toast(isNew ? "Person hinzugefügt" : "Gespeichert");
    });
  }

  function removePerson(id) {
    if (state.personen.length <= 1) { toast("Mindestens eine Person muss bleiben"); return; }
    const count = state.einnahmen.filter((e) => e.person === id).length +
      state.zahlungen.filter((z) => z.person === id).length;
    const fallback = state.personen.find((p) => p.id !== id);
    const msg = count > 0
      ? `Diese Person ist ${count}× zugeordnet. Diese Einträge werden „${fallback.name}“ zugewiesen. Fortfahren?`
      : "Diese Person löschen?";
    if (!confirm(msg)) return;
    state.einnahmen.forEach((e) => { if (e.person === id) e.person = fallback.id; });
    state.zahlungen.forEach((z) => { if (z.person === id) z.person = fallback.id; });
    state.personen = state.personen.filter((p) => p.id !== id);
    if (personFilter === id) personFilter = "all";
    save(); render(); toast("Gelöscht");
  }

  /* ---------- View: Daten ---------- */
  function renderDaten(root) {
    root.appendChild(sectionHead("Daten", "Alle Daten liegen lokal auf diesem Gerät. Sichere oder übertrage sie per Datei."));

    root.appendChild(el("div", { class: "card" },
      el("h3", { style: "margin:0 0 6px" }, "Sichern & Übertragen (JSON)"),
      el("p", { class: "hint", style: "margin:0" },
        "Vollständiges Backup als JSON-Datei – enthält alle Einnahmen, Zahlungen, Sparraten, Kategorien und Personen. Ideal zum Übertragen zwischen Handy und PC. Beim Import kannst du wählen: bestehende Daten ersetzen oder mit den importierten zusammenführen."),
      el("div", { class: "data-actions" },
        el("button", { class: "btn primary", onclick: exportData }, icon("download"), " Export (JSON)"),
        el("button", { class: "btn", onclick: startImport }, icon("upload"), " Import (JSON)"))
    ));

    const c = calc();
    root.appendChild(el("div", { class: "card", style: "margin-top:18px" },
      el("h3", { style: "margin:0 0 10px" }, "Aktueller Stand"),
      el("div", { class: "person-card", style: "padding:0" },
        el("div", { class: "line" }, el("span", {}, "Einnahmen"), el("b", {}, String(state.einnahmen.length))),
        el("div", { class: "line" }, el("span", {}, "Zahlungen"), el("b", {}, String(state.zahlungen.length))),
        el("div", { class: "line" }, el("span", {}, "Sparraten"), el("b", {}, String(state.sparplaene.length))),
        el("div", { class: "line" }, el("span", {}, "Kategorien"), el("b", {}, String(state.kategorien.length))),
        el("div", { class: "line" }, el("span", {}, "Einkommen / Monat"), el("b", {}, fmt(c.income))),
        el("div", { class: "line" }, el("span", {}, "Fixkosten / Monat"), el("b", {}, fmt(c.costs))),
        el("div", { class: "line" }, el("span", {}, "Sparen / Monat"), el("b", {}, fmt(c.savings))))
    ));

    root.appendChild(el("div", { class: "card", style: "margin-top:18px" },
      el("h3", { style: "margin:0 0 6px" }, "Zurücksetzen"),
      el("p", { class: "hint", style: "margin:0" }, "Löscht alle Einnahmen, Zahlungen und Sparraten und stellt die Standardkategorien wieder her."),
      el("div", { class: "data-actions" },
        el("button", { class: "btn danger", onclick: resetData }, "Alle Daten löschen"))
    ));
  }

  // Tauri stellt beim Desktop-Build native Datei-Dialoge bereit (window.__TAURI__).
  // Im normalen Browser wird auf Blob-Download / Datei-Auswahl zurückgegriffen.
  function tauriFs() {
    const t = window.__TAURI__;
    return t && t.dialog && t.fs ? t : null;
  }

  // Text-Datei speichern (Tauri-Dialog oder Browser-Download)
  async function saveTextFile(defaultName, mime, text) {
    const ext = defaultName.split(".").pop();
    const t = tauriFs();
    if (t) {
      try {
        const path = await t.dialog.save({ defaultPath: defaultName, filters: [{ name: ext.toUpperCase(), extensions: [ext] }] });
        if (!path) return false;
        await t.fs.writeTextFile(path, text);
        return true;
      } catch (e) { console.error(e); toast("Export fehlgeschlagen"); return false; }
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
    const t = tauriFs();
    if (t) {
      try {
        const path = await t.dialog.open({ multiple: false, filters: [{ name: "Datei", extensions }] });
        if (!path) return;
        cb(await t.fs.readTextFile(path));
      } catch (e) { console.error(e); toast("Import fehlgeschlagen"); }
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
      toast("Export erstellt");
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
        toast("Datei konnte nicht gelesen werden");
        return;
      }
      openChoice("Daten importieren", "Wie sollen die importierten Daten übernommen werden?", [
        { label: "Abbrechen", cls: "ghost" },
        { label: "Zusammenführen", onClick: () => { state = mergeState(state, incoming); save(); render(); toast("Daten zusammengeführt"); } },
        { label: "Ersetzen", cls: "primary", onClick: () => { state = incoming; save(); render(); toast("Daten ersetzt"); } },
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
    if (!confirm("Wirklich ALLE Daten löschen? Das kann nicht rückgängig gemacht werden.")) return;
    state = defaultData();
    save(); render(); toast("Zurückgesetzt");
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
    return Object.entries(INTERVALS).map(([k, v]) => [k, v.label]);
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
          el("button", { type: "button", class: "btn ghost", onclick: closeModal }, "Abbrechen"),
          el("button", { type: "submit", class: "btn primary", form: "__modalForm" }, "Speichern"))));
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

  /* ---------- Init ---------- */
  document.querySelectorAll(".tab").forEach((tab) =>
    tab.addEventListener("click", () => { currentView = tab.dataset.view; render(); })
  );
  $("#personFilter").addEventListener("change", (e) => { personFilter = e.target.value; render(); });

  render();

  // PWA: Service Worker registrieren (nur im Browser über https/localhost;
  // im Desktop-Build/Tauri und unter file:// wird bewusst übersprungen).
  if ("serviceWorker" in navigator && !window.__TAURI__ && location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch((e) => console.warn("SW-Registrierung fehlgeschlagen:", e));
    });
  }
})();
