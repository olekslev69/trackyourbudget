/* TrackYourBudget — lokale Verwaltung von Einnahmen, Verträgen und Zahlungen.
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
    };
  }

  /* ---------- State ---------- */
  let state = loadData();
  let currentView = "uebersicht";
  let personFilter = "all"; // "all" oder eine person-id

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
    const income = einnahmen.reduce((s, e) => s + monthly(e), 0);
    const costs = zahlungen.reduce((s, z) => s + monthly(z), 0);

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

    return { income, costs, rest: income - costs, catRows };
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
      kategorien: renderKategorien,
      daten: renderDaten,
    }[currentView])(app);
  }

  /* ---------- View: Übersicht ---------- */
  function renderUebersicht(root) {
    const c = calc();
    const savingRate = c.income > 0 ? c.rest / c.income : 0;

    root.appendChild(
      el("div", { class: "kpi-grid" },
        kpiCard("Einkommen / Monat", fmt(c.income), "accent"),
        kpiCard("Fixkosten / Monat", fmt(c.costs)),
        kpiCard("Verbleibend", fmt(c.rest), c.rest >= 0 ? "pos" : "neg",
          c.income > 0 ? "Sparquote " + fmtPct(savingRate) : ""),
        kpiCard("Zahlungen aktiv", String(state.zahlungen.filter((z) => z.aktiv !== false).filter(matchesPerson).length))
      )
    );

    if (c.costs === 0) {
      root.appendChild(emptyState("Noch keine Zahlungen erfasst.",
        "Lege unter „Zahlungen“ deine Verträge und Abos an, um die Aufteilung zu sehen."));
    } else {
      root.appendChild(
        el("div", { class: "dash-grid" },
          el("div", { class: "card donut-wrap" },
            donut(c.catRows, c.costs),
            el("div", { class: "hint" }, "Aufteilung der Fixkosten")
          ),
          el("div", { class: "card" },
            el("div", { class: "section-head" }, el("h2", { style: "font-size:1.05rem" }, "Nach Kategorie")),
            el("div", { class: "cat-list" }, ...c.catRows.map((r) => catRow(r, c.income)))
          )
        )
      );
    }

    // Pro-Person-Aufschlüsselung (nur wenn „Alle“ gewählt)
    if (personFilter === "all") {
      const cards = state.personen.map((p) => {
        const inc = state.einnahmen.filter((e) => e.person === p.id).reduce((s, e) => s + monthly(e), 0);
        const cost = state.zahlungen.filter((z) => z.aktiv !== false && z.person === p.id).reduce((s, z) => s + monthly(z), 0);
        if (inc === 0 && cost === 0) return null;
        return el("div", { class: "card person-card" },
          el("h4", {}, p.name),
          el("div", { class: "line" }, el("span", {}, "Einkommen"), el("b", {}, fmt(inc))),
          el("div", { class: "line" }, el("span", {}, "Kosten"), el("b", {}, fmt(cost))),
          el("div", { class: "line" }, el("span", {}, "Rest"), el("b", {}, fmt(inc - cost)))
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

  function kpiCard(label, value, mod, sub) {
    return el("div", { class: "card kpi " + (mod || "") },
      el("div", { class: "kpi-label" }, label),
      el("div", { class: "kpi-value" }, value),
      sub ? el("div", { class: "kpi-sub" }, sub) : null
    );
  }

  function catRow(r, income) {
    const widthPct = Math.max(2, Math.round(r.pctCosts * 100));
    return el("div", { class: "cat-row" },
      el("div", { class: "name" }, el("span", { class: "dot", style: "background:" + r.farbe }), r.name),
      el("div", { class: "amount" }, fmt(r.amount)),
      el("div", { class: "bar" }, el("span", { style: `width:${widthPct}%;background:${r.farbe}` })),
      el("div", { class: "pct" }, income > 0 ? fmtPct(r.pctIncome) + " vom Einkommen" : fmtPct(r.pctCosts) + " der Kosten")
    );
  }

  /* SVG-Donut-Diagramm */
  function donut(rows, total) {
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
        el("div", { class: "big" }, fmt(total)),
        el("div", { class: "small" }, "pro Monat")));
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
  function renderZahlungen(root) {
    root.appendChild(sectionHead("Zahlungen & Verträge", "Abos, Verträge und feste monatliche Ausgaben.",
      el("button", { class: "btn primary", onclick: () => openZahlungModal() }, "+ Zahlung")));

    const list = state.zahlungen.filter(matchesPerson)
      .slice().sort((a, b) => monthly(b) - monthly(a));
    if (!list.length) {
      root.appendChild(emptyState("Noch keine Zahlungen.", "Lege deinen ersten Vertrag oder ein Abo an."));
      return;
    }
    root.appendChild(el("div", { class: "list" }, ...list.map((z) => {
      const k = kategorieById(z.kategorieId);
      return el("div", { class: "item" + (z.aktiv === false ? " inactive" : "") },
        el("span", { class: "swatch", style: "background:" + (k ? k.farbe : "#64748b") }),
        el("div", { class: "main" },
          el("div", { class: "title" }, z.bezeichnung || "Zahlung",
            k ? el("span", { class: "tag" }, k.name) : null,
            z.aktiv === false ? el("span", { class: "tag muted" }, "pausiert") : null,
            el("span", { class: "tag muted" }, personName(z.person))),
          el("div", { class: "meta" }, INTERVALS[z.intervall].label + (z.notiz ? " · " + z.notiz : ""))),
        el("div", { class: "value" }, fmt(monthly(z)),
          el("small", {}, z.intervall !== "monatlich" ? fmt(z.betrag) + " " + INTERVALS[z.intervall].label : "/ Monat")),
        el("div", { class: "actions" },
          el("button", { class: "btn ghost icon", title: z.aktiv === false ? "Aktivieren" : "Pausieren", onclick: () => toggleZahlung(z.id) }, icon(z.aktiv === false ? "play" : "pause")),
          el("button", { class: "btn ghost icon", title: "Bearbeiten", onclick: () => openZahlungModal(z) }, icon("edit")),
          el("button", { class: "btn danger icon", title: "Löschen", onclick: () => removeZahlung(z.id) }, icon("trash")))
      );
    })));
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
      textField("notiz", "Notiz (optional)", z.notiz, "z. B. Vertragsende 12/2026"),
    ], (vals) => {
      if (!vals.betrag) { toast("Bitte Betrag angeben"); return false; }
      const rec = { id: z.id, bezeichnung: vals.bezeichnung.trim() || "Zahlung", betrag: Number(vals.betrag),
        intervall: vals.intervall, kategorieId: vals.kategorieId, person: vals.person, notiz: vals.notiz.trim(),
        aktiv: z.aktiv !== false };
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

  /* ---------- View: Daten ---------- */
  function renderDaten(root) {
    root.appendChild(sectionHead("Daten", "Alle Daten liegen lokal auf diesem Gerät. Sichere oder übertrage sie per Datei."));

    root.appendChild(el("div", { class: "card" },
      el("h3", { style: "margin:0 0 6px" }, "Sichern & Übertragen"),
      el("p", { class: "hint", style: "margin:0" },
        "Exportiere deine Daten als JSON-Datei (Backup oder Übertragung auf einen anderen Rechner). Beim Import werden die aktuellen Daten ersetzt."),
      el("div", { class: "data-actions" },
        el("button", { class: "btn primary", onclick: exportData }, icon("download"), " Export (JSON)"),
        el("button", { class: "btn", onclick: startImport }, icon("upload"), " Import (JSON)"),
        el("input", { type: "file", id: "importFile", accept: "application/json,.json", style: "display:none", onchange: importData }))
    ));

    const c = calc();
    root.appendChild(el("div", { class: "card", style: "margin-top:18px" },
      el("h3", { style: "margin:0 0 10px" }, "Aktueller Stand"),
      el("div", { class: "person-card", style: "padding:0" },
        el("div", { class: "line" }, el("span", {}, "Einnahmen"), el("b", {}, String(state.einnahmen.length))),
        el("div", { class: "line" }, el("span", {}, "Zahlungen"), el("b", {}, String(state.zahlungen.length))),
        el("div", { class: "line" }, el("span", {}, "Kategorien"), el("b", {}, String(state.kategorien.length))),
        el("div", { class: "line" }, el("span", {}, "Einkommen / Monat"), el("b", {}, fmt(c.income))),
        el("div", { class: "line" }, el("span", {}, "Fixkosten / Monat"), el("b", {}, fmt(c.costs))))
    ));

    root.appendChild(el("div", { class: "card", style: "margin-top:18px" },
      el("h3", { style: "margin:0 0 6px" }, "Zurücksetzen"),
      el("p", { class: "hint", style: "margin:0" }, "Löscht alle Einnahmen und Zahlungen und stellt die Standardkategorien wieder her."),
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

  async function exportData() {
    const json = JSON.stringify(state, null, 2);
    const t = tauriFs();
    if (t) {
      try {
        const path = await t.dialog.save({
          defaultPath: "trackyourbudget-export.json",
          filters: [{ name: "JSON", extensions: ["json"] }],
        });
        if (!path) return;
        await t.fs.writeTextFile(path, json);
        toast("Export gespeichert");
      } catch (e) {
        console.error(e);
        toast("Export fehlgeschlagen");
      }
      return;
    }
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = el("a", { href: url, download: "trackyourbudget-export.json" });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("Export erstellt");
  }

  async function startImport() {
    const t = tauriFs();
    if (t) {
      try {
        const path = await t.dialog.open({
          multiple: false,
          filters: [{ name: "JSON", extensions: ["json"] }],
        });
        if (!path) return;
        const txt = await t.fs.readTextFile(path);
        applyImport(txt);
      } catch (e) {
        console.error(e);
        toast("Import fehlgeschlagen");
      }
      return;
    }
    $("#importFile").click();
  }

  function importData(ev) {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => applyImport(reader.result);
    reader.readAsText(file);
    ev.target.value = "";
  }

  function applyImport(text) {
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object") throw new Error("ungültig");
      if (!confirm("Import ersetzt die aktuellen Daten. Fortfahren?")) return;
      state = migrate(parsed);
      save(); render(); toast("Import erfolgreich");
    } catch (e) {
      toast("Datei konnte nicht gelesen werden");
    }
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

  /* ---------- Init ---------- */
  document.querySelectorAll(".tab").forEach((tab) =>
    tab.addEventListener("click", () => { currentView = tab.dataset.view; render(); })
  );
  $("#personFilter").addEventListener("change", (e) => { personFilter = e.target.value; render(); });

  render();
})();
