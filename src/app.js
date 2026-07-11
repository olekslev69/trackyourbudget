/* Sparblick — lokale Verwaltung von Einnahmen, Verträgen und Zahlungen.
 * Keine externen Abhängigkeiten. Daten liegen im localStorage des Geräts. */
(function () {
  "use strict";

  const STORAGE_KEY = "tyb_data_v1";
  const LANG_KEY = "tyb_lang";
  const CURRENCY = "EUR";
  const APP_VERSION = "0.10.0"; // muss zur Version in package.json / tauri.conf.json passen
  const REPO_URL = "https://github.com/olekslev69/sparblick";

  /* ---------- Sprache / i18n ---------- */
  const I18N = {
    de: {
      // Chrome / Navigation
      view: "Ansicht", filter_by_person: "Nach Person filtern", all_combined: "Alle zusammen",
      tab_uebersicht: "Übersicht", tab_einnahmen: "Einnahmen", tab_zahlungen: "Ausgaben",
      tab_sparen: "Sparen", tab_kategorien: "Kategorien", tab_personen: "Personen",
      tab_aufteilung: "Aufteilung", tab_daten: "Daten",
      // Aktionen / generisch
      cancel: "Abbrechen", save_btn: "Speichern", edit: "Bearbeiten", delete: "Löschen",
      pause: "Pausieren", activate: "Aktivieren", saved: "Gespeichert", deleted: "Gelöscht",
      name_required: "Bitte Name angeben", amount_required: "Bitte Betrag angeben",
      save_failed: "Speichern fehlgeschlagen",
      // Felder
      label_name: "Bezeichnung", label_amount: "Betrag (€)", label_interval: "Intervall",
      label_person: "Person", label_category: "Kategorie", label_next_due: "Nächste Fälligkeit (optional)",
      label_note: "Notiz (optional)", label_name_plain: "Name", label_color: "Farbe", label_type: "Art",
      label_contract_end: "Vertragsende (optional)", label_notice: "Kündigungsfrist",
      notice_none: "keine / unbekannt", month_one: "Monat", month_many: "Monate",
      // Intervalle
      iv_woechentlich: "wöchentlich", iv_monatlich: "monatlich", iv_quartalsweise: "quartalsweise",
      iv_halbjaehrlich: "halbjährlich", iv_jaehrlich: "jährlich",
      // Spararten
      art_etf: "ETF / Fonds", art_aktien: "Aktien", art_sparkonto: "Tagesgeld / Sparkonto",
      art_altersvorsorge: "Altersvorsorge", art_krypto: "Krypto", art_sonstiges: "Sonstiges",
      // Übersicht
      per_month: "Monat", per_year: "Jahr",
      amounts_note_month: "Alle Beträge pro Monat", amounts_note_year: "Alle Beträge pro Jahr",
      income: "Einnahmen", fixed_costs: "Ausgaben", savings: "Sparen", free_available: "Frei verfügbar",
      after_costs_savings: "nach Ausgaben & Sparen", savings_rate: "Sparquote {pct}",
      donut_month: "pro Monat", donut_year: "pro Jahr",
      split_fixed_costs: "Aufteilung der Ausgaben", by_category: "Nach Kategorie",
      pct_of_income: "{pct} der Einnahmen", pct_of_costs: "{pct} der Ausgaben",
      no_payments_yet_title: "Noch keine Ausgaben erfasst.",
      no_payments_yet_text: "Lege unter Ausgaben deine Verträge und Abos an, um die Aufteilung zu sehen.",
      upcoming_due: "Demnächst fällig", per_person: "Pro Person",
      per_person_sub: "Grundlage für spätere getrennte Budgets",
      pp_costs: "Ausgaben", free_short: "Frei", no_category: "Ohne Kategorie",
      // Fälligkeit
      due_today: "heute fällig", due_tomorrow: "morgen fällig", due_in_days: "in {n} Tagen",
      due_prefix: "fällig {date}",
      // Kündigungsfristen
      cancel_deadlines_title: "Kündigungsfristen",
      cancel_by: "kündbar bis {date}", contract_end_meta: "Vertragsende {date}",
      cancel_today: "heute kündigen!", cancel_tomorrow: "bis morgen kündigen", cancel_in_days: "noch {n} Tage",
      cancel_tag: "Kündigen bis {date}",
      // Einnahmen
      income_sub: "Deine monatlichen Einnahmen — auch pro Person erfassbar.", add_income: "+ Einnahme",
      no_income_title: "Noch keine Einnahmen.", no_income_text: "Trage z. B. dein Gehalt ein.",
      per_month_slash: "/ Monat", new_income: "Neue Einnahme", edit_income: "Einnahme bearbeiten",
      income_added: "Einnahme hinzugefügt", delete_income_confirm: "Diese Einnahme löschen?",
      default_income_name: "Einnahme", ph_income: "z. B. Gehalt",
      // Ausgaben
      payments_title: "Ausgaben & Verträge", payments_sub: "Abos, Verträge und feste monatliche Ausgaben.",
      add_payment: "+ Ausgabe", no_payments_title: "Noch keine Ausgaben.",
      no_payments_text: "Lege deinen ersten Vertrag oder ein Abo an.", all_categories: "Alle Kategorien",
      sort_amount_desc: "Betrag absteigend", sort_amount_asc: "Betrag aufsteigend", sort_name: "Name (A–Z)",
      search_ph: "Suchen …", reset: "Zurücksetzen",
      count_payments: "{n} Ausgabe(n)", sum_line: "{m}/Monat · {y}/Jahr (aktive)",
      no_payments_filter: "Keine Ausgaben für diesen Filter.", tag_paused: "pausiert",
      new_payment: "Neue Ausgabe", edit_payment: "Ausgabe bearbeiten", payment_added: "Ausgabe hinzugefügt",
      delete_payment_confirm: "Diese Ausgabe löschen?", default_payment_name: "Ausgabe",
      ph_payment: "z. B. Netflix, Miete, Fitnessstudio", ph_note_contract: "z. B. Vertragsende 12/2026",
      // Sparen
      savings_title: "Sparen & Anlegen",
      savings_sub: "Regelmäßige Sparraten und Sparziele – z. B. ETF-Sparpläne, Tagesgeld oder eine Urlaubskasse.",
      add_savings: "+ Sparrate", no_savings_title: "Noch keine Sparraten.",
      no_savings_text: "Lege z. B. deinen ETF-Sparplan oder ein Sparziel an.", count_savings: "{n} Sparrate(n)",
      new_savings: "Neue Sparrate", edit_savings: "Sparrate bearbeiten", savings_added: "Sparrate hinzugefügt",
      delete_savings_confirm: "Diese Sparrate löschen?", default_savings_name: "Sparrate",
      ph_savings: "z. B. MSCI World ETF", ph_note_depot: "z. B. Depot bei …",
      // Sparziele
      plans_title: "Sparpläne", goals_title: "Sparziele",
      add_goal: "+ Sparziel", new_goal: "Neues Sparziel", edit_goal: "Sparziel bearbeiten",
      goal_added: "Sparziel hinzugefügt", default_goal_name: "Sparziel",
      delete_goal_confirm: "Dieses Sparziel löschen?", ph_goal: "z. B. Urlaub, Notgroschen",
      label_target: "Zielbetrag", label_current: "Aktueller Stand", target_required: "Bitte Zielbetrag angeben",
      goal_reached: "Ziel erreicht", goal_remaining: "noch {rest}",
      deposit_btn: "Einzahlen", deposit_title: "In {name} einzahlen", deposit_amount: "Betrag",
      deposit_done: "{amount} eingezahlt", goal_reached_toast: "🎉 Sparziel erreicht!",
      // Kategorien
      categories_sub: "Ordne deine Ausgaben thematisch — Farben erscheinen im Diagramm.",
      add_category: "+ Kategorie", payment_one: "{n} Ausgabe", payment_many: "{n} Ausgaben",
      new_category: "Neue Kategorie", edit_category: "Kategorie bearbeiten",
      category_added: "Kategorie hinzugefügt", min_one_category: "Mindestens eine Kategorie muss bleiben",
      category_reassign_confirm: "Diese Kategorie hat {n} Ausgabe(n). Sie werden zu {fallback} verschoben. Fortfahren?",
      delete_category_confirm: "Diese Kategorie löschen?", ph_category: "z. B. Freizeit",
      // Personen
      people_sub: "Wer teilt sich das Budget? Auch Kinder mit Taschengeld und eigenen Sparzielen.",
      add_person: "+ Person", person_counts: "{e} Einnahme(n) · {z} Ausgabe(n)",
      ptype_erwachsen: "Erwachsene:r", ptype_kind: "Kind", tag_kind: "Kind",
      new_person: "Neue Person", edit_person: "Person bearbeiten", person_added: "Person hinzugefügt",
      min_one_person: "Mindestens eine Person muss bleiben",
      person_reassign_confirm: "Diese Person ist {n}× zugeordnet. Ihre Einträge werden {fallback} zugewiesen. Fortfahren?",
      delete_person_confirm: "Diese Person löschen?", ph_person: "z. B. dein Name oder der deiner Partner:in",
      // Aufteilung (Paare / Familien / WG)
      split_sub: "Gemeinsame Ausgaben fair auf die Personen aufteilen (Werte pro Monat).",
      split_settings_title: "So wird aufgeteilt",
      split_settings_text: "Wenn aktiv, werden die Ausgaben des gemeinsamen Topfs auf die übrigen erwachsenen Personen verteilt – zu gleichen Teilen (50/50), anteilig nach Einkommen oder mit frei gewählten Anteilen. Kinder zahlen nicht mit.",
      split_toggle_label: "Gemeinsame Ausgaben aufteilen",
      split_mode_equal: "50/50 (gleich)", split_mode_income: "Nach Einkommen", split_mode_custom: "Eigene Anteile",
      split_custom_hint: "Anteile frei festlegen – z. B. 30 / 70. Die Summe muss nicht genau 100 sein, verteilt wird anteilig.",
      split_custom_sum: "Summe: {sum} % – wird anteilig auf 100 % umgerechnet.",
      split_summary_custom: "Gemeinsame Ausgaben: {pot} · nach eigenen Anteilen aufgeteilt",
      per_person_split_note_custom: "Gemeinsame Ausgaben sind nach eigenen Anteilen aufgeteilt.",
      split_shared_person: "Gemeinsamer Topf",
      split_empty_title: "Noch keine Aufteilung möglich",
      split_empty_text: "Füge im Tab Personen eine zweite erwachsene Person hinzu, um gemeinsame Ausgaben aufzuteilen.",
      split_own: "Eigene Ausgaben",
      split_shared_line: "Anteil gemeinsam",
      split_summary: "Gemeinsame Ausgaben: {pot} · 50/50 auf {n} Personen — je {each}",
      split_summary_income: "Gemeinsame Ausgaben: {pot} · anteilig nach Einkommen auf {n} Personen",
      split_kids_note: "Kinder zahlen nicht mit – ihnen wird kein Anteil des gemeinsamen Topfs zugerechnet.",
      per_person_split_note: "Gemeinsame Ausgaben sind 50/50 aufgeteilt.",
      per_person_split_note_income: "Gemeinsame Ausgaben sind anteilig nach Einkommen aufgeteilt.",
      split_prompt_title: "Gemeinsame Ausgaben aufteilen?",
      split_prompt: "Sollen gemeinsame Ausgaben automatisch 50/50 auf die Personen aufgeteilt werden? Später jederzeit im Tab Aufteilung änderbar.",
      split_prompt_yes: "Ja, 50/50 aufteilen", split_prompt_no: "Nein, danke",
      // Daten
      data_sub: "Alle Daten liegen lokal auf diesem Gerät. Sichere oder übertrage sie per Datei.",
      backup_title: "Sichern & Übertragen (JSON)",
      backup_text: "Vollständiges Backup als JSON-Datei – enthält alle Einnahmen, Ausgaben, Sparraten, Kategorien und Personen. Ideal zum Übertragen zwischen Handy und PC. Beim Import kannst du wählen: bestehende Daten ersetzen oder mit den importierten zusammenführen.",
      export_json: " Export (JSON)", import_json: " Import (JSON)",
      export_csv: " Export (CSV)",
      csv_title: "Excel / Numbers / Google Sheets (CSV)",
      csv_text: "Export als CSV-Datei zum Öffnen in Excel, Numbers oder Google Sheets – z. B. um das Budget gemeinsam durchzugehen oder an eine Steuerberatung weiterzugeben. Nur für den Export gedacht; für Backups und die Übertragung zwischen Geräten das JSON-Format verwenden.",
      csv_type: "Art", csv_active: "Aktiv", csv_target: "Zielbetrag", csv_current_amount: "Stand",
      csv_yes: "Ja", csv_no: "Nein",
      csv_contract_end: "Vertragsende", csv_notice_months: "Kündigungsfrist (Monate)",
      print_title: "Drucken / PDF",
      print_text: "Eine übersichtliche Zusammenfassung auf einer Seite – für das monatliche Familiengespräch oder die Steuerberatung. Über den Druckdialog lässt sie sich auch als PDF speichern.",
      print_btn: " Übersicht drucken",
      print_summary_title: "Budget-Übersicht",
      printed_on: "Stand: {date}",
      print_footer: "Erstellt mit Sparblick – alle Daten liegen lokal.",
      col_pct_income: "% der Einnahmen",
      current_status: "Aktueller Stand", st_income: "Einnahmen", st_payments: "Ausgaben",
      st_savings: "Sparraten", st_categories: "Kategorien", st_income_month: "Einnahmen / Monat",
      st_costs_month: "Ausgaben / Monat", st_savings_month: "Sparen / Monat",
      reset_title: "Zurücksetzen",
      reset_text: "Löscht alle Einnahmen, Ausgaben und Sparraten und stellt die Standardkategorien wieder her.",
      reset_btn: "Alle Daten löschen",
      reset_confirm: "Wirklich ALLE Daten löschen? Das kann nicht rückgängig gemacht werden.",
      reset_done: "Zurückgesetzt",
      export_done: "Export erstellt", export_failed: "Export fehlgeschlagen",
      import_failed: "Import fehlgeschlagen", file_unreadable: "Datei konnte nicht gelesen werden",
      file_label: "Datei", import_title: "Daten importieren",
      import_question: "Wie sollen die importierten Daten übernommen werden?",
      merge: "Zusammenführen", replace: "Ersetzen", merged: "Daten zusammengeführt", replaced: "Daten ersetzt",
      // DKB-Import
      dkb_card_title: "Import aus Bank (DKB, FYRST, Amex)",
      dkb_card_text: "Lies eine Bank-Umsatzliste (CSV) ein – unterstützt werden DKB, FYRST und Amex. Die App erkennt wiederkehrende Ausgaben und fasst Lebensmittel, Drogerie und Laden zu je einem Posten zusammen – du bestätigst per Häkchen, bevor etwas hinzugefügt wird. Umbuchungen, Steuern, Erstattungen und Investitionen werden ignoriert.",
      dkb_import_btn: " Umsatzliste (CSV) importieren",
      dkb_not_recognized: "Kein bekanntes Bank-Format erkannt (DKB, FYRST, Amex)",
      dkb_nothing: "Keine wiederkehrenden Ausgaben oder Lebensmittel gefunden",
      dkb_preview_title: "Bank-Import – Vorschau",
      dkb_preview_intro: "{n} Vorschläge erkannt · {ign} Umsätze ignoriert (Umbuchungen, Investitionen, Sonstiges).",
      dkb_for_all: "Für alle:",
      dkb_groceries: "Lebensmittel",
      agg_drogerie: "Drogerie",
      agg_laden: "Auto: Laden",
      dkb_add_btn: "{n} übernehmen",
      dkb_imported: "{n} Ausgabe(n) importiert",
      dkb_none_selected: "Nichts ausgewählt",
      dkb_exists: "bereits vorhanden",
      // Über / Info
      about: "Über Sparblick",
      about_tagline: "Lokaler Vertrags- & Budget-Tracker",
      about_version: "Version",
      about_storage_title: "Wo liegen meine Daten?",
      about_storage_text: "Alle Daten bleiben ausschließlich lokal auf diesem Gerät – im Browser-Speicher (localStorage, Schlüssel tyb_data_v1). Keine Cloud, keine Anmeldung, keine Übertragung an Server. Zum Sichern oder Übertragen dient Daten → Export/Import (JSON).",
      about_banks: "Bank-Import",
      about_repo: "Projektseite (GitHub)",
      about_license: "Lizenz: Apache 2.0",
      close_btn: "Schließen",
      // Standarddaten
      seed_p_ich: "Ich", seed_p_partner: "Partnerin", seed_p_gemeinsam: "Gemeinsam",
      seed_k_wohnen: "Wohnen & Miete", seed_k_versicherung: "Versicherungen", seed_k_sport: "Sport & Fitness",
      seed_k_abos: "Abos & Streaming", seed_k_mobilitaet: "Mobilität & Auto", seed_k_telekom: "Telefon & Internet",
      seed_k_lebensmittel: "Lebensmittel (pauschal)", seed_k_sonstiges: "Sonstiges",
    },
    en: {
      view: "View", filter_by_person: "Filter by person", all_combined: "All combined",
      tab_uebersicht: "Overview", tab_einnahmen: "Income", tab_zahlungen: "Expenses",
      tab_sparen: "Savings", tab_kategorien: "Categories", tab_personen: "People",
      tab_aufteilung: "Split", tab_daten: "Data",
      cancel: "Cancel", save_btn: "Save", edit: "Edit", delete: "Delete",
      pause: "Pause", activate: "Activate", saved: "Saved", deleted: "Deleted",
      name_required: "Please enter a name", amount_required: "Please enter an amount",
      save_failed: "Saving failed",
      label_name: "Label", label_amount: "Amount (€)", label_interval: "Interval",
      label_person: "Person", label_category: "Category", label_next_due: "Next due date (optional)",
      label_note: "Note (optional)", label_name_plain: "Name", label_color: "Color", label_type: "Type",
      label_contract_end: "Contract end (optional)", label_notice: "Notice period",
      notice_none: "none / unknown", month_one: "month", month_many: "months",
      iv_woechentlich: "weekly", iv_monatlich: "monthly", iv_quartalsweise: "quarterly",
      iv_halbjaehrlich: "half-yearly", iv_jaehrlich: "yearly",
      art_etf: "ETF / Funds", art_aktien: "Stocks", art_sparkonto: "Savings account",
      art_altersvorsorge: "Pension", art_krypto: "Crypto", art_sonstiges: "Other",
      per_month: "Month", per_year: "Year",
      amounts_note_month: "All amounts per month", amounts_note_year: "All amounts per year",
      income: "Income", fixed_costs: "Expenses", savings: "Savings", free_available: "Available",
      after_costs_savings: "after expenses & savings", savings_rate: "Savings rate {pct}",
      donut_month: "per month", donut_year: "per year",
      split_fixed_costs: "Breakdown of expenses", by_category: "By category",
      pct_of_income: "{pct} of income", pct_of_costs: "{pct} of expenses",
      no_payments_yet_title: "No expenses yet.",
      no_payments_yet_text: "Add your contracts and subscriptions under Expenses to see the breakdown.",
      upcoming_due: "Upcoming", per_person: "Per person",
      per_person_sub: "Basis for separate budgets later",
      pp_costs: "Expenses", free_short: "Available", no_category: "No category",
      due_today: "due today", due_tomorrow: "due tomorrow", due_in_days: "in {n} days",
      due_prefix: "due {date}",
      cancel_deadlines_title: "Cancellation deadlines",
      cancel_by: "cancel by {date}", contract_end_meta: "contract ends {date}",
      cancel_today: "cancel today!", cancel_tomorrow: "cancel by tomorrow", cancel_in_days: "{n} days left",
      cancel_tag: "Cancel by {date}",
      income_sub: "Your monthly income — also per person.", add_income: "+ Income",
      no_income_title: "No income yet.", no_income_text: "Add your salary, for example.",
      per_month_slash: "/ month", new_income: "New income", edit_income: "Edit income",
      income_added: "Income added", delete_income_confirm: "Delete this income?",
      default_income_name: "Income", ph_income: "e.g. Salary",
      payments_title: "Expenses & contracts", payments_sub: "Subscriptions, contracts and fixed monthly expenses.",
      add_payment: "+ Expense", no_payments_title: "No expenses yet.",
      no_payments_text: "Add your first contract or subscription.", all_categories: "All categories",
      sort_amount_desc: "Amount ↓", sort_amount_asc: "Amount ↑", sort_name: "Name (A–Z)",
      search_ph: "Search …", reset: "Reset",
      count_payments: "{n} expense(s)", sum_line: "{m}/month · {y}/year (active)",
      no_payments_filter: "No expenses for this filter.", tag_paused: "paused",
      new_payment: "New expense", edit_payment: "Edit expense", payment_added: "Expense added",
      delete_payment_confirm: "Delete this expense?", default_payment_name: "Expense",
      ph_payment: "e.g. Netflix, rent, gym", ph_note_contract: "e.g. contract ends 12/2026",
      savings_title: "Saving & investing",
      savings_sub: "Recurring savings and savings goals – e.g. ETF plans, savings accounts or a vacation fund.",
      add_savings: "+ Savings", no_savings_title: "No savings yet.",
      no_savings_text: "Add your ETF plan, for example.", count_savings: "{n} savings plan(s)",
      new_savings: "New savings plan", edit_savings: "Edit savings plan", savings_added: "Savings plan added",
      delete_savings_confirm: "Delete this savings plan?", default_savings_name: "Savings",
      ph_savings: "e.g. MSCI World ETF", ph_note_depot: "e.g. broker …",
      // Savings goals
      plans_title: "Savings plans", goals_title: "Savings goals",
      add_goal: "+ Goal", new_goal: "New savings goal", edit_goal: "Edit savings goal",
      goal_added: "Goal added", default_goal_name: "Goal",
      delete_goal_confirm: "Delete this savings goal?", ph_goal: "e.g. Vacation, emergency fund",
      label_target: "Target amount", label_current: "Current amount", target_required: "Please enter a target amount",
      goal_reached: "Goal reached", goal_remaining: "{rest} to go",
      deposit_btn: "Add money", deposit_title: "Add to {name}", deposit_amount: "Amount",
      deposit_done: "{amount} added", goal_reached_toast: "🎉 Goal reached!",
      categories_sub: "Group your expenses — colors appear in the chart.",
      add_category: "+ Category", payment_one: "{n} expense", payment_many: "{n} expenses",
      new_category: "New category", edit_category: "Edit category",
      category_added: "Category added", min_one_category: "At least one category must remain",
      category_reassign_confirm: "This category has {n} expense(s). They will be moved to {fallback}. Continue?",
      delete_category_confirm: "Delete this category?", ph_category: "e.g. Leisure",
      people_sub: "Who shares the budget? Kids with pocket money and their own goals, too.",
      add_person: "+ Person", person_counts: "{e} income · {z} expense(s)",
      ptype_erwachsen: "Adult", ptype_kind: "Child", tag_kind: "Child",
      new_person: "New person", edit_person: "Edit person", person_added: "Person added",
      min_one_person: "At least one person must remain",
      person_reassign_confirm: "This person is assigned {n}×. Their entries will be reassigned to {fallback}. Continue?",
      delete_person_confirm: "Delete this person?", ph_person: "e.g. your name or your partner's",
      // Split (couples / families / shared flats)
      split_sub: "Split shared expenses fairly across people (values per month).",
      split_settings_title: "How splitting works",
      split_settings_text: "When on, the shared pot's expenses are split across the other adults – equally (50/50), in proportion to income, or with custom shares. Kids don't pay a share.",
      split_toggle_label: "Split shared expenses",
      split_mode_equal: "50/50 (equal)", split_mode_income: "By income", split_mode_custom: "Custom shares",
      split_custom_hint: "Set the shares yourself – e.g. 30 / 70. The sum doesn't have to be exactly 100; it's applied proportionally.",
      split_custom_sum: "Total: {sum}% – applied proportionally to 100%.",
      split_summary_custom: "Shared expenses: {pot} · split by custom shares",
      per_person_split_note_custom: "Shared expenses are split by custom shares.",
      split_shared_person: "Shared pot",
      split_empty_title: "Nothing to split yet",
      split_empty_text: "Add a second adult under \"People\" to split shared expenses.",
      split_own: "Own expenses",
      split_shared_line: "Shared share",
      split_summary: "Shared expenses: {pot} · 50/50 across {n} people — {each} each",
      split_summary_income: "Shared expenses: {pot} · split by income across {n} people",
      split_kids_note: "Kids don't pay – no share of the shared pot is assigned to them.",
      per_person_split_note: "Shared expenses are split 50/50.",
      per_person_split_note_income: "Shared expenses are split in proportion to income.",
      split_prompt_title: "Split shared expenses?",
      split_prompt: "Split shared expenses 50/50 across people automatically? You can change this anytime under \"Split\".",
      split_prompt_yes: "Yes, split 50/50", split_prompt_no: "No thanks",
      data_sub: "All data is stored locally on this device. Back up or transfer it via file.",
      backup_title: "Backup & transfer (JSON)",
      backup_text: "Full backup as a JSON file – includes all income, expenses, savings, categories and people. Ideal for transferring between phone and PC. On import you can choose: replace existing data or merge it with the imported data.",
      export_json: " Export (JSON)", import_json: " Import (JSON)",
      export_csv: " Export (CSV)",
      csv_title: "Excel / Numbers / Google Sheets (CSV)",
      csv_text: "Export as a CSV file to open in Excel, Numbers or Google Sheets – e.g. to go through the budget together as a family or hand it to an accountant. For export only; use the JSON format for backups and transferring between devices.",
      csv_type: "Type", csv_active: "Active", csv_target: "Target amount", csv_current_amount: "Current amount",
      csv_yes: "Yes", csv_no: "No",
      csv_contract_end: "Contract end", csv_notice_months: "Notice period (months)",
      print_title: "Print / PDF",
      print_text: "A clean one-page summary – for the monthly family finance talk or your accountant. Use the print dialog to save it as a PDF.",
      print_btn: " Print summary",
      print_summary_title: "Budget summary",
      printed_on: "As of {date}",
      print_footer: "Created with Sparblick – all data stays local.",
      col_pct_income: "% of income",
      current_status: "Current status", st_income: "Income entries", st_payments: "Expenses",
      st_savings: "Savings plans", st_categories: "Categories", st_income_month: "Income / month",
      st_costs_month: "Expenses / month", st_savings_month: "Savings / month",
      reset_title: "Reset",
      reset_text: "Deletes all income, expenses and savings and restores the default categories.",
      reset_btn: "Delete all data",
      reset_confirm: "Really delete ALL data? This cannot be undone.",
      reset_done: "Reset done",
      export_done: "Export created", export_failed: "Export failed",
      import_failed: "Import failed", file_unreadable: "The file could not be read",
      file_label: "File", import_title: "Import data",
      import_question: "How should the imported data be applied?",
      merge: "Merge", replace: "Replace", merged: "Data merged", replaced: "Data replaced",
      dkb_card_title: "Import from bank (DKB, FYRST, Amex)",
      dkb_card_text: "Read a bank transaction list (CSV) – DKB, FYRST and Amex are supported. The app detects recurring expenses and combines groceries, drugstore and charging into one entry each – you confirm with checkboxes before anything is added. Transfers, taxes, refunds and investments are ignored.",
      dkb_import_btn: " Import transactions (CSV)",
      dkb_not_recognized: "No known bank format recognized (DKB, FYRST, Amex)",
      dkb_nothing: "No recurring expenses or groceries found",
      dkb_preview_title: "Bank import – preview",
      dkb_preview_intro: "{n} suggestions detected · {ign} transactions ignored (transfers, investments, other).",
      dkb_for_all: "For all:",
      dkb_groceries: "Groceries",
      agg_drogerie: "Drugstore",
      agg_laden: "Car: charging",
      dkb_add_btn: "Add {n}",
      dkb_imported: "{n} expense(s) imported",
      dkb_none_selected: "Nothing selected",
      dkb_exists: "already added",
      about: "About Sparblick",
      about_tagline: "Local contract & budget tracker",
      about_version: "Version",
      about_storage_title: "Where is my data stored?",
      about_storage_text: "All data stays exclusively on this device – in the browser storage (localStorage, key tyb_data_v1). No cloud, no sign-in, nothing sent to any server. Use Data → Export/Import (JSON) to back up or transfer it.",
      about_banks: "Bank import",
      about_repo: "Project page (GitHub)",
      about_license: "License: Apache 2.0",
      close_btn: "Close",
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
      sparziele: [], // Sparziele mit Zielbetrag + angespartem Stand (Einzahlungen)
      // Haushalts-Einstellungen (Teil der Daten, werden mit exportiert/importiert).
      settings: { splitShared: false, splitMode: "equal", splitCustom: {}, sharedPersonId: "p_gemeinsam", splitPrompted: false },
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
    const personen = Array.isArray(d.personen) && d.personen.length ? d.personen : base.personen;
    // Einstellungen defensiv übernehmen (Abwärtskompatibilität mit älteren Exporten).
    const s = d.settings && typeof d.settings === "object" ? d.settings : {};
    let sharedPersonId = typeof s.sharedPersonId === "string" ? s.sharedPersonId : "p_gemeinsam";
    if (!personen.some((p) => p.id === sharedPersonId)) {
      const g = personen.find((p) => p.id === "p_gemeinsam") || personen.find((p) => /gemeinsam|shared|haushalt/i.test(p.name));
      sharedPersonId = g ? g.id : "";
    }
    return {
      version: 1,
      personen,
      kategorien: Array.isArray(d.kategorien) && d.kategorien.length ? d.kategorien : base.kategorien,
      einnahmen: Array.isArray(d.einnahmen) ? d.einnahmen : [],
      zahlungen: Array.isArray(d.zahlungen) ? d.zahlungen : [],
      sparplaene: Array.isArray(d.sparplaene) ? d.sparplaene : [],
      sparziele: Array.isArray(d.sparziele) ? d.sparziele : [],
      settings: {
        splitShared: !!s.splitShared,
        splitMode: s.splitMode === "income" || s.splitMode === "custom" ? s.splitMode : "equal",
        splitCustom: sanitizeCustomShares(s.splitCustom),
        sharedPersonId, splitPrompted: !!s.splitPrompted,
      },
    };
  }

  // Eigene Anteile (Prozentwerte je Person) defensiv übernehmen: nur endliche Zahlen > 0.
  function sanitizeCustomShares(raw) {
    const out = {};
    if (raw && typeof raw === "object") {
      for (const k in raw) {
        const v = Number(raw[k]);
        if (isFinite(v) && v > 0) out[k] = v;
      }
    }
    return out;
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
    printer: '<path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
  };
  function icon(name) {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    Object.entries({ viewBox: "0 0 24 24", width: 17, height: 17, fill: "none",
      stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" })
      .forEach(([k, v]) => svg.setAttribute(k, v));
    // ICONS ist statisch, aber wir parsen ohne innerHTML-Sink (defensiv/CSP-freundlich).
    const doc = new DOMParser().parseFromString(`<svg xmlns="${NS}">${ICONS[name] || ""}</svg>`, "image/svg+xml");
    for (const child of Array.from(doc.documentElement.childNodes)) svg.appendChild(document.importNode(child, true));
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

  // Kündigungsfrist: Stichtag, bis zu dem gekündigt werden muss
  // (Vertragsende minus Frist in Monaten).
  function cancelDeadline(z) {
    const end = parseISO(z.vertragsende);
    if (!end) return null;
    const d = new Date(end);
    d.setMonth(d.getMonth() - (Number(z.kuendigungsfristMonate) || 0));
    // Monatsüberlauf (z. B. 31.12. − 3 Monate = "31.09.") auf das Monatsende zurückrunden,
    // sonst würde ein späterer Stichtag angezeigt als tatsächlich gilt.
    if (d.getDate() !== end.getDate()) d.setDate(0);
    return d;
  }
  function cancelText(days) {
    if (days <= 0) return t("cancel_today");
    if (days === 1) return t("cancel_tomorrow");
    return t("cancel_in_days", { n: days });
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

  // Fairer Anteil je Person (Monatswerte, ohne personFilter). Bei aktivem Split werden
  // die Ausgaben der "gemeinsamen" Person (settings.sharedPersonId) auf die erwachsenen
  // Personen verteilt – zu gleichen Teilen (50/50) oder anteilig nach Einkommen
  // (settings.splitMode). Kinder zahlen nicht mit (kein Anteil am gemeinsamen Topf).
  function personShares() {
    const sumBy = (arr, id) => arr.filter((x) => x.person === id).reduce((s, x) => s + monthly(x), 0);
    const activeZ = state.zahlungen.filter((z) => z.aktiv !== false);
    const activeS = state.sparplaene.filter((s) => s.aktiv !== false);
    const sharedId = state.settings ? state.settings.sharedPersonId : "";
    const shared = !!(state.settings && state.settings.splitShared) && sharedId && state.personen.some((p) => p.id === sharedId);
    const individuals = state.personen.filter((p) => !(shared && p.id === sharedId));
    const payers = individuals.filter((p) => p.typ !== "kind");
    const pot = shared ? sumBy(activeZ, sharedId) : 0;
    const incomeOf = {};
    individuals.forEach((p) => { incomeOf[p.id] = sumBy(state.einnahmen, p.id); });
    const payerIncome = payers.reduce((s, p) => s + incomeOf[p.id], 0);
    const mode = state.settings ? state.settings.splitMode : "equal";
    // "Nach Einkommen" nur, wenn es überhaupt Einkommen gibt – sonst zurück auf 50/50.
    const byIncome = mode === "income" && payerIncome > 0;
    // "Eigene Anteile": frei gewählte Gewichte (z. B. 30/70); Summe muss nicht 100 sein,
    // verteilt wird anteilig. Ohne gültige Gewichte zurück auf 50/50.
    let weights = null, weightSum = 0;
    if (shared && mode === "custom") {
      const custom = state.settings.splitCustom || {};
      weights = {};
      payers.forEach((p) => {
        const w = Number(custom[p.id]);
        weights[p.id] = isFinite(w) && w > 0 ? w : 0;
        weightSum += weights[p.id];
      });
    }
    return individuals.map((p) => {
      const isKind = p.typ === "kind";
      const income = incomeOf[p.id];
      let pctShare = 0;
      if (shared && !isKind && payers.length) {
        pctShare = weights && weightSum > 0 ? weights[p.id] / weightSum
          : byIncome ? income / payerIncome
          : 1 / payers.length;
      }
      const expensesOwn = sumBy(activeZ, p.id);
      const expensesShared = pot * pctShare;
      const expenses = expensesOwn + expensesShared;
      const savings = sumBy(activeS, p.id);
      return { personId: p.id, name: p.name, isKind, income, expensesOwn, expensesShared, pctShare, expenses, savings, free: income - expenses - savings };
    });
  }

  /* ---------- Rendering: Navigation ---------- */
  function localizeChrome() {
    document.documentElement.lang = lang;
    const tabKeys = {
      uebersicht: "tab_uebersicht", einnahmen: "tab_einnahmen", zahlungen: "tab_zahlungen",
      sparen: "tab_sparen", kategorien: "tab_kategorien", personen: "tab_personen",
      aufteilung: "tab_aufteilung", daten: "tab_daten",
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
      aufteilung: renderAufteilung,
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
    renderKuendigungen(root);

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
      const split = !!(state.settings && state.settings.splitShared);
      const cards = personShares().map((ps) => {
        if (ps.income === 0 && ps.expenses === 0 && ps.savings === 0) return null;
        return el("div", { class: "card person-card" },
          el("h4", {}, ps.name, ps.isKind ? el("span", { class: "tag muted", style: "margin-left:8px" }, t("tag_kind")) : null),
          el("div", { class: "line" }, el("span", {}, t("income")), el("b", {}, fmt(ps.income * f))),
          el("div", { class: "line" }, el("span", {}, t("pp_costs")), el("b", {}, fmt(ps.expenses * f))),
          el("div", { class: "line" }, el("span", {}, t("savings")), el("b", {}, fmt(ps.savings * f))),
          el("div", { class: "line" }, el("span", {}, t("free_short")), el("b", {}, fmt(ps.free * f)))
        );
      }).filter(Boolean);
      if (cards.length) {
        root.appendChild(el("div", { class: "section-head", style: "margin-top:26px" },
          el("div", {}, el("h2", { style: "font-size:1.05rem" }, t("per_person")),
            el("p", {}, split
              ? t(state.settings.splitMode === "income" ? "per_person_split_note_income"
                : state.settings.splitMode === "custom" ? "per_person_split_note_custom"
                : "per_person_split_note")
              : t("per_person_sub")))));
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

  // Bereich "Kündigungsfristen" (Verträge mit Vertragsende; Frist = kündbar bis)
  function renderKuendigungen(root) {
    const items = state.zahlungen
      .filter((z) => z.aktiv !== false).filter(matchesPerson)
      .map((z) => ({ z, deadline: cancelDeadline(z) }))
      .filter((x) => x.deadline && daysUntil(x.deadline) >= 0)
      .sort((a, b) => a.deadline - b.deadline)
      .slice(0, 6);
    if (!items.length) return;

    root.appendChild(el("div", { class: "card", style: "margin-top:20px" },
      el("div", { class: "section-head", style: "margin-bottom:14px" },
        el("h2", { style: "font-size:1.05rem" }, t("cancel_deadlines_title"))),
      el("div", { class: "due-list" }, ...items.map(({ z, deadline }) => {
        const days = daysUntil(deadline);
        const k = kategorieById(z.kategorieId);
        const urg = days <= 14 ? "due-soon" : days <= 60 ? "due-near" : "";
        const end = parseISO(z.vertragsende);
        return el("div", { class: "due-row" },
          el("span", { class: "dot", style: "background:" + (k ? k.farbe : "#64748b") }),
          el("div", { class: "due-main" },
            el("div", { class: "due-name" }, z.bezeichnung || t("default_payment_name")),
            el("div", { class: "meta" }, t("cancel_by", { date: dateFmtFn(deadline) })
              + (end ? " · " + t("contract_end_meta", { date: dateFmtFn(end) }) : ""))),
          el("span", { class: "due-badge " + urg }, cancelText(days)),
          el("span", { class: "due-amount" }, fmt(monthly(z))));
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
      const deadline = z.aktiv !== false ? cancelDeadline(z) : null;
      const dlDays = deadline ? daysUntil(deadline) : null;
      container.appendChild(el("div", { class: "item" + (z.aktiv === false ? " inactive" : "") },
        el("span", { class: "swatch", style: "background:" + (k ? k.farbe : "#64748b") }),
        el("div", { class: "main" },
          el("div", { class: "title" }, z.bezeichnung || t("default_payment_name"),
            k ? el("span", { class: "tag" }, k.name) : null,
            z.aktiv === false ? el("span", { class: "tag muted" }, t("tag_paused")) : null,
            due && dueDays <= 7 ? el("span", { class: "tag warn" }, faelligkeitText(dueDays)) : null,
            deadline && dlDays >= 0 && dlDays <= 60 ? el("span", { class: "tag warn" }, t("cancel_tag", { date: dateFmtFn(deadline) })) : null,
            el("span", { class: "tag muted" }, personName(z.person))),
          el("div", { class: "meta" }, intervalLabel(z.intervall)
            + (due ? " · " + t("due_prefix", { date: dateFmtFn(due) }) : "")
            + (deadline && dlDays >= 0 ? " · " + t("cancel_by", { date: dateFmtFn(deadline) }) : "")
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
      el("div", { class: "field-row" },
        dateField("vertragsende", t("label_contract_end"), z.vertragsende),
        selectField("kuendigungsfrist", t("label_notice"), noticeOptions(), String(z.kuendigungsfristMonate || ""))),
    ], (vals) => {
      if (!vals.betrag) { toast(t("amount_required")); return false; }
      const rec = { id: z.id, bezeichnung: vals.bezeichnung.trim() || t("default_payment_name"), betrag: Number(vals.betrag),
        intervall: vals.intervall, kategorieId: vals.kategorieId, person: vals.person, notiz: vals.notiz.trim(),
        faellig: vals.faellig || "", aktiv: z.aktiv !== false,
        vertragsende: vals.vertragsende || "", kuendigungsfristMonate: vals.kuendigungsfrist ? Number(vals.kuendigungsfrist) : "",
        importKey: z.importKey || "" }; // Import-Herkunft beim Bearbeiten nicht verlieren (Re-Import-Erkennung)
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
      el("div", { class: "head-actions" },
        el("button", { class: "btn", onclick: () => openZielModal() }, t("add_goal")),
        el("button", { class: "btn primary", onclick: () => openSparModal() }, t("add_savings")))));

    const ziele = state.sparziele.filter(matchesPerson);
    const plaene = state.sparplaene.filter(matchesPerson);
    if (!ziele.length && !plaene.length) {
      root.appendChild(emptyState(t("no_savings_title"), t("no_savings_text")));
      return;
    }

    // Sparziele (Zielbetrag + angesparter Stand)
    if (ziele.length) {
      root.appendChild(el("h3", { class: "sub-head" }, t("goals_title")));
      root.appendChild(el("div", { class: "goal-grid" }, ...ziele.map(goalCard)));
    }

    // Sparpläne (regelmäßige Raten)
    if (plaene.length) {
      root.appendChild(el("h3", { class: "sub-head", style: "margin-top:24px" }, t("plans_title")));
      const total = plaene.filter((s) => s.aktiv !== false).reduce((s, sp) => s + monthly(sp), 0);
      root.appendChild(el("p", { class: "filter-summary" },
        t("count_savings", { n: plaene.length }) + " · " + t("sum_line", { m: fmt(total), y: fmt(total * 12) })));
      root.appendChild(el("div", { class: "list" }, ...plaene
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
  }

  function goalCard(z) {
    const target = Number(z.zielBetrag) || 0;
    const stand = Number(z.stand) || 0;
    const pct = target > 0 ? Math.min(1, stand / target) : 0;
    const done = target > 0 && stand >= target;
    return el("div", { class: "card goal-card" + (done ? " done" : "") },
      el("div", { class: "goal-head" },
        el("div", {},
          el("div", { class: "goal-name" }, z.bezeichnung || t("default_goal_name"),
            done ? el("span", { class: "tag ok" }, "🎉 " + t("goal_reached")) : null),
          el("div", { class: "meta" }, personName(z.person) + (z.notiz ? " · " + z.notiz : ""))),
        el("div", { class: "actions" },
          el("button", { class: "btn ghost icon", title: t("edit"), onclick: () => openZielModal(z) }, icon("edit")),
          el("button", { class: "btn danger icon", title: t("delete"), onclick: () => removeZiel(z.id) }, icon("trash")))),
      el("div", { class: "goal-bar" }, el("span", { style: "width:" + (pct * 100).toFixed(1) + "%" })),
      el("div", { class: "goal-figs" },
        el("b", {}, fmt(stand)), el("span", { class: "hint" }, " / " + fmt(target)),
        el("span", { class: "goal-pct" }, fmtPct(pct))),
      el("div", { class: "goal-actions" },
        el("button", { class: "btn primary btn-small", onclick: () => openEinzahlung(z) }, t("deposit_btn")),
        !done ? el("span", { class: "hint" }, t("goal_remaining", { rest: fmt(Math.max(0, target - stand)) })) : null));
  }

  function openZielModal(entry) {
    const isNew = !entry;
    const z = entry || { id: uid("g"), bezeichnung: "", zielBetrag: "", stand: 0, person: state.personen[0].id, notiz: "" };
    openModal(isNew ? t("new_goal") : t("edit_goal"), [
      textField("bezeichnung", t("label_name"), z.bezeichnung, t("ph_goal")),
      el("div", { class: "field-row" },
        numField("zielBetrag", t("label_target"), z.zielBetrag),
        numField("stand", t("label_current"), z.stand)),
      selectField("person", t("label_person"), personOptions(), z.person),
      textField("notiz", t("label_note"), z.notiz, t("ph_note_contract")),
    ], (vals) => {
      if (!vals.zielBetrag || Number(vals.zielBetrag) <= 0) { toast(t("target_required")); return false; }
      const rec = { id: z.id, bezeichnung: vals.bezeichnung.trim() || t("default_goal_name"),
        zielBetrag: Number(vals.zielBetrag), stand: Math.max(0, Number(vals.stand) || 0),
        person: vals.person, notiz: vals.notiz.trim() };
      const i = state.sparziele.findIndex((x) => x.id === z.id);
      if (i >= 0) state.sparziele[i] = rec; else state.sparziele.push(rec);
      save(); render(); toast(isNew ? t("goal_added") : t("saved"));
    });
  }

  function openEinzahlung(z) {
    openModal(t("deposit_title", { name: z.bezeichnung || t("default_goal_name") }), [
      numField("betrag", t("deposit_amount"), ""),
    ], (vals) => {
      const amount = Number(vals.betrag) || 0;
      if (amount <= 0) { toast(t("amount_required")); return false; }
      const wasDone = (Number(z.stand) || 0) >= (Number(z.zielBetrag) || 0);
      z.stand = (Number(z.stand) || 0) + amount;
      save(); render();
      const nowDone = z.stand >= (Number(z.zielBetrag) || 0);
      toast(nowDone && !wasDone ? t("goal_reached_toast") : t("deposit_done", { amount: fmt(amount) }));
    });
  }

  function removeZiel(id) {
    if (!confirm(t("delete_goal_confirm"))) return;
    state.sparziele = state.sparziele.filter((x) => x.id !== id);
    save(); render(); toast(t("deleted"));
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
          el("div", { class: "title" }, p.name,
            p.typ === "kind" ? el("span", { class: "tag muted" }, t("tag_kind")) : null),
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
      selectField("typ", t("label_type"), [["erwachsen", t("ptype_erwachsen")], ["kind", t("ptype_kind")]],
        p.typ === "kind" ? "kind" : "erwachsen"),
    ], (vals) => {
      const name = vals.name.trim();
      if (!name) { toast(t("name_required")); return false; }
      const rec = { id: p.id, name };
      if (vals.typ === "kind") rec.typ = "kind";
      const i = state.personen.findIndex((x) => x.id === p.id);
      if (i >= 0) state.personen[i] = rec; else state.personen.push(rec);
      save(); render(); toast(isNew ? t("person_added") : t("saved"));
      if (isNew) maybePromptSplit();
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

  /* ---------- View: Aufteilung (Paare / Familien / WG) ---------- */
  function renderAufteilung(root) {
    root.appendChild(sectionHead(t("tab_aufteilung"), t("split_sub")));
    const settings = state.settings;

    // Einstellungs-Karte: Aufteilung an/aus + gemeinsamer Topf
    const toggle = el("input", { type: "checkbox" });
    toggle.checked = !!settings.splitShared;
    toggle.addEventListener("change", () => {
      settings.splitShared = toggle.checked; settings.splitPrompted = true; save(); render();
    });
    const sharedSel = el("select");
    state.personen.forEach((p) => {
      const o = el("option", { value: p.id }, p.name);
      if (p.id === settings.sharedPersonId) o.selected = true;
      sharedSel.appendChild(o);
    });
    sharedSel.addEventListener("change", () => { settings.sharedPersonId = sharedSel.value; save(); render(); });

    // Modus: 50/50, anteilig nach Einkommen oder eigene Anteile (nur bei aktiver Aufteilung)
    const setMode = (m) => { settings.splitMode = m; save(); render(); };
    const modeSeg = settings.splitShared ? el("div", { style: "margin-top:12px" },
      el("div", { class: "seg" },
        el("button", { class: settings.splitMode !== "income" && settings.splitMode !== "custom" ? "active" : "",
          onclick: () => setMode("equal") }, t("split_mode_equal")),
        el("button", { class: settings.splitMode === "income" ? "active" : "",
          onclick: () => setMode("income") }, t("split_mode_income")),
        el("button", { class: settings.splitMode === "custom" ? "active" : "",
          onclick: () => setMode("custom") }, t("split_mode_custom")))) : null;

    // Editor für eigene Anteile (z. B. 30/70): eine Prozent-Eingabe je erwachsener Person.
    let customEditor = null;
    if (settings.splitShared && settings.splitMode === "custom") {
      const payersP = state.personen.filter((p) => p.id !== settings.sharedPersonId && p.typ !== "kind");
      settings.splitCustom = settings.splitCustom || {};
      // Beim ersten Öffnen gleichmäßig vorbelegen, damit sichtbar ist, wie es funktioniert.
      if (payersP.length && !payersP.some((p) => Number(settings.splitCustom[p.id]) > 0)) {
        const even = Math.floor(100 / payersP.length);
        payersP.forEach((p, i) => {
          settings.splitCustom[p.id] = i === payersP.length - 1 ? 100 - even * (payersP.length - 1) : even;
        });
        save();
      }
      const sum = payersP.reduce((s2, p) => s2 + (Number(settings.splitCustom[p.id]) || 0), 0);
      customEditor = el("div", { style: "margin-top:12px" },
        el("p", { class: "hint", style: "margin:0 0 8px" }, t("split_custom_hint")),
        ...payersP.map((p) => {
          const inp = el("input", { type: "number", min: "0", max: "1000", step: "1",
            value: Number(settings.splitCustom[p.id]) > 0 ? settings.splitCustom[p.id] : 0 });
          inp.addEventListener("change", () => {
            settings.splitCustom[p.id] = Math.max(0, Number(inp.value) || 0);
            save(); render();
          });
          return el("div", { class: "custom-share-row" }, el("span", {}, p.name), inp, el("span", { class: "hint" }, "%"));
        }),
        sum > 0 && sum !== 100 ? el("p", { class: "hint", style: "margin:8px 0 0" }, t("split_custom_sum", { sum })) : null);
    }

    root.appendChild(el("div", { class: "card" },
      el("h3", { style: "margin:0 0 6px" }, t("split_settings_title")),
      el("p", { class: "hint", style: "margin:0 0 12px" }, t("split_settings_text")),
      el("label", { class: "split-toggle" }, toggle, el("span", {}, t("split_toggle_label"))),
      modeSeg,
      customEditor,
      el("div", { class: "field", style: "margin-top:12px;max-width:280px" },
        el("label", {}, t("split_shared_person")), sharedSel)
    ));

    const sharedId = settings.sharedPersonId;
    const payerCount = state.personen.filter((p) => !(settings.splitShared && p.id === sharedId) && p.typ !== "kind").length;
    if (payerCount < 2) {
      root.appendChild(emptyState(t("split_empty_title"), t("split_empty_text")));
      return;
    }

    const shares = personShares();
    const payers = shares.filter((ps) => !ps.isKind);
    // Zusammenfassung des gemeinsamen Topfs (nur bei aktiver Aufteilung)
    if (settings.splitShared) {
      const pot = state.zahlungen.filter((z) => z.aktiv !== false && z.person === sharedId).reduce((s, z) => s + monthly(z), 0);
      const line = settings.splitMode === "income"
        ? t("split_summary_income", { pot: fmt(pot), n: payers.length })
        : settings.splitMode === "custom"
        ? t("split_summary_custom", { pot: fmt(pot) })
        : t("split_summary", { pot: fmt(pot), n: payers.length, each: fmt(payers.length ? pot / payers.length : 0) });
      root.appendChild(el("p", { class: "filter-summary", style: "margin:16px 2px 4px" }, line));
      if (shares.some((ps) => ps.isKind)) {
        root.appendChild(el("p", { class: "hint", style: "margin:0 2px 4px" }, t("split_kids_note")));
      }
    }

    const cards = payers.map((ps) => el("div", { class: "card person-card" },
      el("h4", {}, ps.name),
      el("div", { class: "line" }, el("span", {}, t("income")), el("b", {}, fmt(ps.income))),
      el("div", { class: "line" }, el("span", {}, t("split_own")), el("b", {}, fmt(ps.expensesOwn))),
      settings.splitShared ? el("div", { class: "line" },
        el("span", {}, t("split_shared_line") + " (" + fmtPct(ps.pctShare) + ")"),
        el("b", {}, fmt(ps.expensesShared))) : null,
      el("div", { class: "line", style: "font-weight:700;border-top:1px solid var(--border);padding-top:8px;margin-top:2px" },
        el("span", {}, t("pp_costs")), el("b", {}, fmt(ps.expenses))),
      el("div", { class: "line" }, el("span", {}, t("savings")), el("b", {}, fmt(ps.savings))),
      el("div", { class: "line" }, el("span", {}, t("free_short")), el("b", {}, fmt(ps.free)))
    ));
    root.appendChild(el("div", { class: "person-cards", style: "margin-top:8px" }, ...cards));
  }

  // Einmaliger Hinweis, sobald der Haushalt nach ≥2 Personen aussieht.
  function maybePromptSplit() {
    const s = state.settings;
    if (!s || s.splitShared || s.splitPrompted) return;
    const individuals = state.personen.filter((p) => p.id !== s.sharedPersonId && p.typ !== "kind");
    if (individuals.length < 2) return;
    s.splitPrompted = true; save();
    openChoice(t("split_prompt_title"), t("split_prompt"), [
      { label: t("split_prompt_yes"), cls: "primary", onClick: () => { state.settings.splitShared = true; save(); currentView = "aufteilung"; render(); } },
      { label: t("split_prompt_no") },
    ]);
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

    root.appendChild(el("div", { class: "card", style: "margin-top:18px" },
      el("h3", { style: "margin:0 0 6px" }, t("csv_title")),
      el("p", { class: "hint", style: "margin:0" }, t("csv_text")),
      el("div", { class: "data-actions" },
        el("button", { class: "btn", onclick: exportCsv }, icon("download"), t("export_csv")))
    ));

    root.appendChild(el("div", { class: "card", style: "margin-top:18px" },
      el("h3", { style: "margin:0 0 6px" }, t("print_title")),
      el("p", { class: "hint", style: "margin:0" }, t("print_text")),
      el("div", { class: "data-actions" },
        el("button", { class: "btn", onclick: printSummary }, icon("printer"), t("print_btn")))
    ));

    root.appendChild(el("div", { class: "card", style: "margin-top:18px" },
      el("h3", { style: "margin:0 0 6px" }, t("dkb_card_title")),
      el("p", { class: "hint", style: "margin:0" }, t("dkb_card_text")),
      el("div", { class: "data-actions" },
        el("button", { class: "btn", onclick: startBankImport }, icon("upload"), t("dkb_import_btn")))
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

  /* ----- CSV: Export für Tabellenkalkulation (nur Export, kein Re-Import) ----- */
  // Semikolon als Trenner und Komma als Dezimaltrennzeichen (wie bei DKB/FYRST-Exporten),
  // damit die Datei in einem deutschsprachigen Excel/Numbers direkt korrekt aufgeht.
  function csvField(v) {
    const s = v == null ? "" : String(v);
    return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function csvNum(n) {
    return (Number(n) || 0).toFixed(2).replace(".", ",");
  }
  function csvRow(fields) {
    return fields.map(csvField).join(";");
  }
  function exportCsvText() {
    const yn = (b) => (b ? t("csv_yes") : t("csv_no"));
    const lines = [];

    lines.push(csvRow([t("tab_einnahmen")]));
    lines.push(csvRow([t("label_name"), t("label_amount"), t("label_interval"), t("label_person")]));
    for (const e of state.einnahmen) {
      lines.push(csvRow([e.bezeichnung || t("default_income_name"), csvNum(e.betrag), intervalLabel(e.intervall), personName(e.person)]));
    }

    lines.push("");
    lines.push(csvRow([t("tab_zahlungen")]));
    lines.push(csvRow([t("label_name"), t("label_amount"), t("label_interval"), t("label_category"), t("label_person"), t("csv_active"), t("label_next_due"), t("csv_contract_end"), t("csv_notice_months"), t("label_note")]));
    for (const z of state.zahlungen) {
      const k = kategorieById(z.kategorieId);
      lines.push(csvRow([z.bezeichnung || t("default_payment_name"), csvNum(z.betrag), intervalLabel(z.intervall),
        k ? k.name : t("no_category"), personName(z.person), yn(z.aktiv !== false), z.faellig || "",
        z.vertragsende || "", z.kuendigungsfristMonate || "", z.notiz || ""]));
    }

    lines.push("");
    lines.push(csvRow([t("plans_title")]));
    lines.push(csvRow([t("label_name"), t("label_amount"), t("label_interval"), t("csv_type"), t("label_person"), t("csv_active"), t("label_note")]));
    for (const sp of state.sparplaene) {
      lines.push(csvRow([sp.bezeichnung || t("default_savings_name"), csvNum(sp.betrag), intervalLabel(sp.intervall),
        sparArtLabel(sp.art), personName(sp.person), yn(sp.aktiv !== false), sp.notiz || ""]));
    }

    lines.push("");
    lines.push(csvRow([t("goals_title")]));
    lines.push(csvRow([t("label_name"), t("csv_target"), t("csv_current_amount"), t("label_person"), t("label_note")]));
    for (const z of state.sparziele) {
      lines.push(csvRow([z.bezeichnung || t("default_goal_name"), csvNum(z.zielBetrag), csvNum(z.stand), personName(z.person), z.notiz || ""]));
    }

    return "﻿" + lines.join("\r\n") + "\r\n"; // BOM: Umlaute in Excel korrekt anzeigen
  }
  async function exportCsv() {
    if (await saveTextFile("sparblick-export.csv", "text/csv", exportCsvText())) {
      toast(t("export_done"));
    }
  }

  /* ----- Druck / PDF: Ein-Seiten-Zusammenfassung (#printRoot, per @media print sichtbar) ----- */
  function printTable(headers, rows) {
    return el("table", { class: "print-table" },
      el("thead", {}, el("tr", {}, ...headers.map((h) => el("th", {}, h)))),
      el("tbody", {}, ...rows.map((r) => el("tr", {}, ...r.map((c) => el("td", {}, c))))));
  }
  function printSummary() {
    const root = $("#printRoot");
    root.innerHTML = "";
    const c = calc();

    const parts = [
      el("h1", {}, "Sparblick – " + t("print_summary_title")),
      el("p", { class: "print-meta" }, t("printed_on", { date: dateFmtFn(new Date()) })
        + (c.income > 0 ? " · " + t("savings_rate", { pct: fmtPct(c.savings / c.income) }) : "")),
      printTable(["", t("per_month"), t("per_year")],
        [[t("income"), fmt(c.income), fmt(c.income * 12)],
         [t("fixed_costs"), fmt(c.costs), fmt(c.costs * 12)],
         [t("savings"), fmt(c.savings), fmt(c.savings * 12)],
         [t("free_available"), fmt(c.rest), fmt(c.rest * 12)]]),
    ];

    if (c.catRows.length) {
      parts.push(el("h2", {}, t("by_category")));
      parts.push(printTable([t("label_category"), t("per_month"), t("col_pct_income")],
        c.catRows.map((r) => [r.name, fmt(r.amount), c.income > 0 ? fmtPct(r.pctIncome) : fmtPct(r.pctCosts)])));
    }

    const shares = personShares().filter((ps) => ps.income || ps.expenses || ps.savings);
    if (shares.length > 1) {
      parts.push(el("h2", {}, t("per_person")));
      parts.push(printTable([t("label_person"), t("income"), t("pp_costs"), t("savings"), t("free_short")],
        shares.map((ps) => [ps.name + (ps.isKind ? " (" + t("tag_kind") + ")" : ""),
          fmt(ps.income), fmt(ps.expenses), fmt(ps.savings), fmt(ps.free)])));
    }

    const dues = state.zahlungen.filter((z) => z.aktiv !== false)
      .map((z) => ({ z, due: nextDue(z) })).filter((x) => x.due)
      .sort((a, b) => a.due - b.due).slice(0, 6);
    if (dues.length) {
      parts.push(el("h2", {}, t("upcoming_due")));
      parts.push(printTable([t("label_name"), "", t("label_amount")],
        dues.map(({ z, due }) => [z.bezeichnung || t("default_payment_name"), dateFmtFn(due), fmt(Number(z.betrag) || 0)])));
    }

    const cancels = state.zahlungen.filter((z) => z.aktiv !== false)
      .map((z) => ({ z, deadline: cancelDeadline(z) }))
      .filter((x) => x.deadline && daysUntil(x.deadline) >= 0)
      .sort((a, b) => a.deadline - b.deadline).slice(0, 6);
    if (cancels.length) {
      parts.push(el("h2", {}, t("cancel_deadlines_title")));
      parts.push(printTable([t("label_name"), "", t("label_amount")],
        cancels.map(({ z, deadline }) => [z.bezeichnung || t("default_payment_name"),
          t("cancel_by", { date: dateFmtFn(deadline) }), fmt(monthly(z))])));
    }

    parts.push(el("p", { class: "print-footer" }, t("print_footer")));
    parts.forEach((p) => root.appendChild(p));
    window.print();
  }
  function startImport() {
    openTextFile(["json"], (text) => {
      let incoming;
      try {
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== "object") throw new Error("ungültig");
        incoming = sanitizeImport(migrate(parsed));
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
      sparziele: current.sparziele.slice(),
      settings: current.settings, // Haushalts-Einstellung des Geräts behalten
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
      const safeFarbe = typeof k.farbe === "string" && /^#[0-9a-fA-F]{6}$/.test(k.farbe) ? k.farbe : PALETTE[0];
      result.kategorien.push({ id, name: k.name, farbe: safeFarbe });
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
    addEntries(result.sparziele, incoming.sparziele || []);

    return result;
  }

  // Importierte Daten härten: nicht vertrauenswürdige Kategorie-Farben (fließen in
  // Inline-Styles) auf gültige Hex-Werte beschränken.
  function sanitizeImport(data) {
    if (Array.isArray(data.kategorien)) {
      for (const k of data.kategorien) {
        if (typeof k.farbe !== "string" || !/^#[0-9a-fA-F]{6}$/.test(k.farbe)) k.farbe = PALETTE[0];
      }
    }
    return data;
  }

  /* ----- Import aus Bank-Umsatzliste (CSV) ----- */
  // Sammelposten: gleichartige Kleinbeträge werden pro Import zu EINER Zahlung
  // zusammengefasst (statt vieler Einzelbuchungen). Key = stabiler Import-Schlüssel.
  const AGG_BUCKETS = {
    grocery:  { key: "grocery",  labelKey: "dkb_groceries", catDefId: "k_lebensmittel", catDe: "Lebensmittel (pauschal)", catEn: "Groceries (lump sum)" },
    drogerie: { key: "drogerie", labelKey: "agg_drogerie",  catDefId: null,             catDe: "Drogerie & Haushalt",     catEn: "Drugstore & household" },
    laden:    { key: "laden",    labelKey: "agg_laden",     catDefId: null,             catDe: "Auto & Mobilität",        catEn: "Car & mobility" },
  };

  // Kategorie-Regeln (bank-unabhängig): erkennen wiederkehrende Zahlungen bzw.
  // ordnen Buchungen einem Sammelposten (`aggregate`) zu. Erst-Treffer gewinnt –
  // spezielle Regeln (Laden/Drogerie) stehen daher vor der Lebensmittel-Regel.
  const CATEGORY_RULES = [
    { re: /ladesäule|ladesaeule|e-lade|\be-?laden\b|supercharg|\bionity\b|ewe go|aral pulse|allego|\btesla\b/i, aggregate: "laden" },
    { re: /rossmann|\bdm\b|\bm(ü|ue)ller\b|drogerie|douglas/i, aggregate: "drogerie" },
    { re: /supermarkt|\brewe\b|\baldi\b|\blidl\b|edeka|kaufland|\bpenny\b|\bnetto\b|b(ä|ae)cker|metro|alnatura|denns|tegut/i, aggregate: "grocery" },
    { re: /\bmiete\b/i, catDefId: "k_wohnen", catDe: "Wohnen & Miete", catEn: "Housing & rent", name: "Miete" },
    { re: /octopus|energy|energie|\bstrom\b|stadtwerke|e\.?on\b|vattenfall|enbw|mainova/i, catDefId: null, catDe: "Strom & Energie", catEn: "Electricity & energy" },
    { re: /versicher|signal iduna|baloise|allianz|\bhuk\b|\baxa\b|\bergo\b|debeka|generali|provinzial|rentenversicherung|krankenkasse|krankenversicher|\bbarmer\b|\baok\b|\bdak\b/i, catDefId: "k_versicherung", catDe: "Versicherungen", catEn: "Insurance" },
    { re: /vodafone|telekom|\bo2\b|1&1|1und1|congstar|mobilcom|telefonica|pyur/i, catDefId: "k_telekom", catDe: "Telefon & Internet", catEn: "Phone & internet" },
    { re: /netflix|spotify|disney|\bdazn\b|amazon prime|amznprime|prime video|youtube premium|audible|\bsky\b/i, catDefId: "k_abos", catDe: "Abos & Streaming", catEn: "Subscriptions & streaming" },
    { re: /fitness|mcfit|clever ?fit|urban sports|\bgym\b|fit\/one/i, catDefId: "k_sport", catDe: "Sport & Fitness", catEn: "Sports & fitness" },
    { re: /\bkfz\b|leasing|autokredit|auto.?finanzierung|autohaus|\bsixt\b|\badac\b/i, catDefId: null, catDe: "Auto & Mobilität", catEn: "Car & mobility" },
    { re: /lexware|\bdatev\b|microsoft 365|office 365|\badobe\b|dropbox|google workspace|jetbrains|\bnotion\b/i, catDefId: null, catDe: "Software & Tools", catEn: "Software & tools" },
  ];

  function splitCsvLine(line, sep) {
    const out = []; let cur = ""; let inQ = false;
    const MAX_LEN = 10000, MAX_FIELDS = 50; // Schutz vor überlangen/manipulierten Zeilen
    if (line.length > MAX_LEN) line = line.slice(0, MAX_LEN);
    for (let i = 0; i < line.length; i++) {
      if (out.length >= MAX_FIELDS) break;
      const c = line[i];
      if (inQ) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false; } else cur += c; }
      else if (c === '"') inQ = true;
      else if (c === sep) { out.push(cur); cur = ""; }
      else cur += c;
    }
    out.push(cur);
    return out;
  }
  function parseDeNum(s) { return Number(String(s || "").trim().replace(/\./g, "").replace(",", ".")); }
  function cleanMerchant(s) { return String(s || "").replace(/\s{2,}.*/, "").trim().slice(0, 48); }
  function normName(s) { return String(s || "").toLowerCase().replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim(); }

  // Namens-Tokens (für die Erkennung eigener/gemeinsamer Konten). Anreden/Füllwörter raus.
  const NAME_STOP = new Set(["herr", "herrn", "frau", "konto", "bank", "gmbh"]);
  function nameTokens(s) {
    return String(s || "").toLowerCase().replace(/[^a-zäöüß\s-]/g, " ").split(/[\s-]+/).filter((w) => w.length >= 4 && !NAME_STOP.has(w));
  }
  // Kontoinhaber aus der „Zahlungspflichtige*r"-Spalte ableiten: Tokens, die in der
  // Mehrheit der Ausgangsbuchungen auftauchen (bleibt der/die Kontoinhaber*in konstant).
  function deriveOwner(rows) {
    const counts = new Map(); let n = 0;
    for (const r of rows) {
      if (!r.payer) continue; n++;
      new Set(nameTokens(r.payer)).forEach((w) => counts.set(w, (counts.get(w) || 0) + 1));
    }
    if (!n) return [];
    const owner = [];
    counts.forEach((c, w) => { if (c / n >= 0.6) owner.push(w); });
    return owner;
  }
  // Ist die Gegenseite der/die Kontoinhaber*in selbst (z. B. Umbuchung aufs eigene
  // oder Gemeinschaftskonto)? -> solche Transfers ignorieren wir.
  function isSelfTransfer(payee, ownerTokens) {
    if (!ownerTokens.length) return false;
    const toks = new Set(nameTokens(payee));
    let m = 0; ownerTokens.forEach((w) => { if (toks.has(w)) m++; });
    return m >= Math.min(2, ownerTokens.length);
  }

  // Passen zwei Bezeichnungen zusammen (unscharf)?
  function namesMatch(a, b) {
    const n = normName(a), zn = normName(b);
    if (!n || !zn) return false;
    return zn === n || (n.length >= 4 && zn.includes(n)) || (zn.length >= 4 && n.includes(zn));
  }

  // Ist ein Vorschlag bereits als Zahlung vorhanden? -> Duplikate beim Re-Import vermeiden.
  // Erkennung in dieser Reihenfolge:
  //  1) über den stabilen Import-Schlüssel (`importKey`) – überlebt das Umbenennen.
  //  2) über den Namen – und trägt dabei den Schlüssel nach, damit ein späteres
  //     Umbenennen den Eintrag nicht erneut importiert.
  // Gibt { exists, backfilled } zurück.
  function suggestionExists(s) {
    if (s.key) {
      const byKey = state.zahlungen.find((z) => z.importKey && z.importKey === s.key);
      if (byKey) return { exists: true, backfilled: false };
    }
    const byName = state.zahlungen.find((z) => namesMatch(s.name, z.bezeichnung));
    if (byName) {
      let backfilled = false;
      if (s.key && !byName.importKey) { byName.importKey = s.key; backfilled = true; }
      return { exists: true, backfilled };
    }
    return { exists: false, backfilled: false };
  }

  function importKat(defId, deName, enName) {
    if (defId) { const k = state.kategorien.find((x) => x.id === defId); if (k) return k.id; }
    const name = lang === "de" ? deName : enName;
    const byName = state.kategorien.find((x) => x.name.toLowerCase() === name.toLowerCase());
    if (byName) return byName.id;
    const rec = { id: uid("k"), name, farbe: PALETTE[state.kategorien.length % PALETTE.length] };
    state.kategorien.push(rec);
    return rec.id;
  }

  // Monatsname aus Zahlen bilden (sprachabhängig), z. B. (5, 26) -> "Mai 2026".
  function monthLabel(mon, yr) {
    let y = yr; if (y < 100) y += 2000;
    const months = lang === "de"
      ? ["", "Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
      : ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return (months[mon] || "") + " " + y;
  }

  // ---- Bank-Parser -------------------------------------------------------
  // Jeder Parser erkennt sein CSV-Format (detect) und liefert eine
  // normalisierte Buchungsliste (parse): rows = [{ payee, purpose, amount, expense }].
  // Eine weitere Bank ergänzt man, indem man hier einen Parser hinzufügt – die
  // Klassifizierung (classifyRows) und die Vorschau bleiben unverändert.
  const dkbParser = {
    id: "dkb",
    label: "DKB",
    detect(lines) { return lines.some((l) => /Buchungsdatum/i.test(l) && /Betrag/i.test(l)); },
    parse(lines) {
      const headerIdx = lines.findIndex((l) => /Buchungsdatum/i.test(l) && /Betrag/i.test(l));
      if (headerIdx < 0) return null;
      const header = splitCsvLine(lines[headerIdx], ";").map((h) => h.trim());
      const idx = {
        emp: header.findIndex((h) => /empf(ä|ae)nger/i.test(h)),
        vz: header.findIndex((h) => /verwendungszweck/i.test(h)),
        typ: header.findIndex((h) => /umsatztyp/i.test(h)),
        betrag: header.findIndex((h) => /betrag/i.test(h)),
        pay: header.findIndex((h) => /zahlungspflicht/i.test(h)),
      };
      if (idx.betrag < 0 || idx.emp < 0) return null;

      // Zeitraum/Monat aus dem Dateikopf (optional, für die Lebensmittel-Bezeichnung)
      let period = "";
      const zl = lines.slice(0, headerIdx).find((l) => /Zeitraum/i.test(l));
      if (zl) { const m = /(\d{2})\.(\d{2})\.(\d{2,4})\s*-/.exec(zl); if (m) period = monthLabel(+m[2], +m[3]); }

      const rows = [];
      const MAX_ROWS = 10000; // Schutz vor sehr großen Dateien
      for (let i = headerIdx + 1; i < lines.length && rows.length < MAX_ROWS; i++) {
        if (!lines[i].trim()) continue;
        const r = splitCsvLine(lines[i], ";");
        const typ = idx.typ >= 0 ? (r[idx.typ] || "").trim().toLowerCase() : "";
        const amount = parseDeNum(r[idx.betrag]);
        rows.push({
          payee: (r[idx.emp] || "").trim(),
          purpose: idx.vz >= 0 ? (r[idx.vz] || "").trim() : "",
          payer: idx.pay >= 0 ? (r[idx.pay] || "").trim() : "",
          amount: Math.abs(amount),
          expense: idx.typ >= 0 ? typ === "ausgang" : amount < 0, // nur Ausgaben zählen später
        });
      }
      // Eigene/gemeinsame Konten erkennen und als Transfer markieren (werden ignoriert).
      const ownerTokens = deriveOwner(rows);
      rows.forEach((row) => { row.self = isSelfTransfer(row.payee, ownerTokens); });
      return { rows, period };
    },
  };

  const fyrstParser = {
    id: "fyrst",
    label: "FYRST",
    detect(lines) { return lines.some((l) => /Buchungstag/i.test(l) && /Umsatzart/i.test(l)); },
    parse(lines) {
      const headerIdx = lines.findIndex((l) => /Buchungstag/i.test(l) && /Umsatzart/i.test(l));
      if (headerIdx < 0) return null;
      const header = splitCsvLine(lines[headerIdx], ";").map((h) => h.trim());
      const idx = {
        emp: header.findIndex((h) => /beg(ü|ue)nstigter|auftraggeber/i.test(h)),
        vz: header.findIndex((h) => /verwendungszweck/i.test(h)),
        ums: header.findIndex((h) => /umsatzart/i.test(h)),
        mand: header.findIndex((h) => /mandatsreferenz/i.test(h)),
        betrag: header.findIndex((h) => /^betrag$/i.test(h)),
      };
      if (idx.betrag < 0 || idx.emp < 0) return null;

      // Zeitraum aus dem Dateikopf, z. B. "1.6.2026 - 30.6.2026"
      let period = "";
      const zl = lines.slice(0, headerIdx).find((l) => /^\s*\d{1,2}\.\d{1,2}\.\d{2,4}\s*-\s*\d/.test(l));
      if (zl) { const m = /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/.exec(zl); if (m) period = monthLabel(+m[2], +m[3]); }

      const rows = [];
      const MAX_ROWS = 10000; // Schutz vor sehr großen Dateien
      for (let i = headerIdx + 1; i < lines.length && rows.length < MAX_ROWS; i++) {
        if (!lines[i].trim()) continue;
        const r = splitCsvLine(lines[i], ";");
        if (r.length < header.length - 2) continue; // Summenzeilen ("Kontostand;…") überspringen
        const ums = idx.ums >= 0 ? (r[idx.ums] || "").toLowerCase() : "";
        if (/auszahlung|einzahlung|bargeld/.test(ums)) continue; // Bargeld-Bewegungen sind keine Budgetposten
        const amount = parseDeNum(r[idx.betrag]);
        if (!isFinite(amount) || amount === 0) continue;
        const vz = idx.vz >= 0 ? (r[idx.vz] || "").trim() : "";
        const mand = idx.mand >= 0 ? (r[idx.mand] || "").trim() : "";
        rows.push({
          payee: (r[idx.emp] || "").trim(),
          purpose: (vz + " " + mand).trim(), // Mandatsreferenz mitnehmen (enthält z. B. "KFZ …")
          payer: "", // FYRST liefert keine eigene Kontoinhaber-Spalte
          amount: Math.abs(amount),
          expense: amount < 0,
        });
      }
      const ownerTokens = deriveOwner(rows);
      rows.forEach((row) => { row.self = isSelfTransfer(row.payee, ownerTokens); });
      return { rows, period };
    },
  };

  const amexParser = {
    id: "amex",
    label: "Amex",
    detect(lines) { return lines.some((l) => /beschreibung/i.test(l) && /betrag/i.test(l)); },
    parse(lines) {
      const headerIdx = lines.findIndex((l) => /beschreibung/i.test(l) && /betrag/i.test(l));
      if (headerIdx < 0) return null;
      const header = splitCsvLine(lines[headerIdx], ",").map((h) => h.trim());
      const idx = {
        desc: header.findIndex((h) => /beschreibung|description/i.test(h)),
        betrag: header.findIndex((h) => /betrag|amount/i.test(h)),
        datum: header.findIndex((h) => /datum|date/i.test(h)),
      };
      if (idx.betrag < 0 || idx.desc < 0) return null;

      const rows = [];
      const MAX_ROWS = 10000; // Schutz vor sehr großen Dateien
      const monthCount = {}; // dominanten Monat für die Sammelposten-Bezeichnung finden
      for (let i = headerIdx + 1; i < lines.length && rows.length < MAX_ROWS; i++) {
        if (!lines[i].trim()) continue;
        const r = splitCsvLine(lines[i], ",");
        const amount = parseDeNum(r[idx.betrag]);
        if (!isFinite(amount) || amount === 0) continue;
        if (idx.datum >= 0 && amount > 0) {
          const m = /(\d{1,2})[./](\d{1,2})[./](\d{2,4})/.exec(r[idx.datum] || "");
          if (m) { const k = (+m[3] < 100 ? +m[3] + 2000 : +m[3]) + "-" + (+m[2]); monthCount[k] = (monthCount[k] || 0) + 1; }
        }
        rows.push({
          payee: (r[idx.desc] || "").trim(),
          purpose: "",
          payer: "",
          amount: Math.abs(amount),
          expense: amount > 0, // Kreditkarte: positiv = Ausgabe, negativ = Gutschrift/Zahlung/Erstattung
          self: false,
        });
      }
      let period = "", best = 0;
      for (const k of Object.keys(monthCount)) { if (monthCount[k] > best) { best = monthCount[k]; const p = k.split("-"); period = monthLabel(+p[1], +p[0]); } }
      return { rows, period };
    },
  };

  // Registrierte Bank-Parser. Für eine neue Bank hier einen weiteren Parser eintragen.
  const BANK_PARSERS = [dkbParser, fyrstParser, amexParser];

  // Wendet die (bank-unabhängigen) Kategorie-Regeln auf eine normalisierte
  // Buchungsliste an und fasst Lebensmittel zu einer Summe zusammen.
  function classifyRows(rows, period) {
    const agg = {}; let ignored = 0;
    const suggestions = [];
    for (const row of rows) {
      if (!row.expense) continue; // nur Ausgaben
      if (!isFinite(row.amount) || row.amount <= 0) continue;
      if (row.self) { ignored++; continue; } // Umbuchung / Gemeinschaftskonto ignorieren
      const rule = CATEGORY_RULES.find((x) => x.re.test((row.payee + " " + row.purpose).toLowerCase()));
      if (!rule || rule.ignore) { ignored++; continue; }
      if (rule.aggregate) { agg[rule.aggregate] = (agg[rule.aggregate] || 0) + row.amount; continue; }
      // key = stabiler Händler-Fingerabdruck (überlebt das Umbenennen der Zahlung)
      suggestions.push({ name: rule.name || cleanMerchant(row.payee), key: "m:" + normName(row.payee), betrag: row.amount, catDefId: rule.catDefId, catDe: rule.catDe, catEn: rule.catEn });
    }
    // Sammelposten je Kategorie (Lebensmittel, Drogerie, Laden …) als eine Zahlung
    for (const id of Object.keys(AGG_BUCKETS)) {
      const sum = Math.round((agg[id] || 0) * 100) / 100;
      if (sum <= 0) continue;
      const bkt = AGG_BUCKETS[id];
      suggestions.push({ name: t(bkt.labelKey) + (period ? " (" + period + ")" : ""), key: bkt.key, betrag: sum,
        catDefId: bkt.catDefId, catDe: bkt.catDe, catEn: bkt.catEn });
    }
    let backfilled = false;
    suggestions.forEach((s) => { const r = suggestionExists(s); s.exists = r.exists; if (r.backfilled) backfilled = true; });
    if (backfilled) save(); // nachgetragene Import-Schlüssel sichern
    suggestions.sort((a, b) => b.betrag - a.betrag);
    return { suggestions, ignored, period };
  }

  // Erkennt das Bankformat und liefert die klassifizierten Vorschläge (oder null).
  function classifyBankExport(text) {
    const lines = String(text || "").replace(/^﻿/, "").split(/\r?\n/);
    const parser = BANK_PARSERS.find((p) => p.detect(lines, text));
    if (!parser) return null;
    const parsed = parser.parse(lines, text);
    if (!parsed || !parsed.rows || !parsed.rows.length) return null;
    return classifyRows(parsed.rows, parsed.period);
  }

  function startBankImport() {
    openTextFile(["csv"], (text) => {
      let res = null;
      try { res = classifyBankExport(text); } catch (e) { console.error(e); }
      if (!res) { toast(t("dkb_not_recognized")); return; }
      if (!res.suggestions.length) { toast(t("dkb_nothing")); return; }
      openDkbPreview(res);
    });
  }

  function openDkbPreview(res) {
    closeModal();
    const personSel = el("select");
    personOptions().forEach(([v, l]) => { const o = el("option", { value: v }, l); if (v === state.personen[state.personen.length - 1].id) o.selected = true; personSel.appendChild(o); });
    const intervalSel = el("select");
    intervalOptions().forEach(([v, l]) => { const o = el("option", { value: v }, l); if (v === "monatlich") o.selected = true; intervalSel.appendChild(o); });

    const addBtn = el("button", { class: "btn primary" }, "");
    function updBtn() { addBtn.textContent = t("dkb_add_btn", { n: res.suggestions.filter((s) => s._cb.checked).length }); }

    const rows = res.suggestions.map((s) => {
      const cb = el("input", { type: "checkbox" });
      cb.checked = !s.exists;
      cb.addEventListener("change", updBtn);
      const nameInput = el("input", { type: "text", value: s.name });
      s._cb = cb; s._name = nameInput;
      return el("div", { class: "imp-row" },
        cb,
        el("div", { class: "imp-main" },
          nameInput,
          el("div", { class: "imp-cat" },
            el("span", { class: "tag" }, lang === "de" ? s.catDe : s.catEn),
            s.exists ? el("span", { class: "tag muted" }, t("dkb_exists")) : null)),
        el("div", { class: "imp-amount" }, fmt(s.betrag)));
    });
    updBtn();

    addBtn.addEventListener("click", () => {
      const person = personSel.value, intervall = intervalSel.value;
      let n = 0;
      for (const s of res.suggestions) {
        if (!s._cb.checked) continue;
        state.zahlungen.push({
          id: uid("z"), bezeichnung: (s._name.value.trim() || s.name), betrag: s.betrag,
          intervall, kategorieId: importKat(s.catDefId, s.catDe, s.catEn), person, notiz: "", faellig: "", aktiv: true,
          importKey: s.key || "", // stabiler Schlüssel: Re-Import erkennt den Eintrag auch nach Umbenennen
        });
        n++;
      }
      if (!n) { toast(t("dkb_none_selected")); return; }
      closeModal(); save(); currentView = "zahlungen"; render(); toast(t("dkb_imported", { n }));
    });

    const backdrop = el("div", { class: "modal-backdrop", onclick: (e) => { if (e.target === backdrop) closeModal(); } },
      el("div", { class: "modal wide", role: "dialog" },
        el("div", { class: "modal-head" }, t("dkb_preview_title")),
        el("div", { class: "modal-body" },
          el("p", { class: "filter-summary", style: "margin:0" }, t("dkb_preview_intro", { n: res.suggestions.length, ign: res.ignored })),
          el("div", { class: "filter-bar", style: "margin:2px 0 2px" }, el("span", { class: "hint" }, t("dkb_for_all")), personSel, intervalSel),
          el("div", { class: "imp-list" }, ...rows)),
        el("div", { class: "modal-foot" },
          el("button", { class: "btn ghost", onclick: closeModal }, t("cancel")),
          addBtn)));
    $("#modalRoot").appendChild(backdrop);
    document.addEventListener("keydown", escClose);
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
  function noticeOptions() {
    const opts = [["", t("notice_none")]];
    for (const m of [1, 2, 3, 4, 5, 6, 12]) opts.push([String(m), m + " " + (m === 1 ? t("month_one") : t("month_many"))]);
    return opts;
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

  // „Über"-Dialog: Programmname, Version, Speicherort, unterstützte Importe, Links.
  function openAbout() {
    closeModal();
    const banks = BANK_PARSERS.map((p) => p.label).join(", ");
    const backdrop = el("div", { class: "modal-backdrop", onclick: (e) => { if (e.target === backdrop) closeModal(); } },
      el("div", { class: "modal", role: "dialog", "aria-label": t("about") },
        el("div", { class: "modal-head" }, t("about")),
        el("div", { class: "modal-body" },
          el("div", { class: "about-head" },
            el("span", { class: "brand-mark", "aria-hidden": "true" }),
            el("div", {},
              el("div", { class: "about-name" }, el("span", { class: "brand-spar" }, "Spar"), "blick"),
              el("div", { class: "hint" }, t("about_tagline")),
              el("div", { class: "about-ver" }, t("about_version") + " " + APP_VERSION))),
          el("div", {},
            el("div", { class: "about-sub" }, t("about_storage_title")),
            el("p", { class: "hint", style: "margin:6px 0 0" }, t("about_storage_text"))),
          el("div", { class: "about-meta" },
            el("div", {}, el("span", { class: "about-sub" }, t("about_banks") + ": "), el("span", { class: "hint" }, banks)),
            el("a", { class: "about-link", href: REPO_URL, target: "_blank", rel: "noopener" }, t("about_repo")),
            el("div", { class: "hint" }, t("about_license")))),
        el("div", { class: "modal-foot" },
          el("button", { class: "btn primary", onclick: closeModal }, t("close_btn")))));
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
    const about = el("button", { class: "icon-btn about-btn", title: t("about"), "aria-label": t("about"), onclick: openAbout }, icon("info"));
    hc.appendChild(about);
    updateLangToggle();
  }
  function updateLangToggle() {
    document.querySelectorAll(".lang-seg button").forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    const ab = document.querySelector(".about-btn");
    if (ab) { ab.title = t("about"); ab.setAttribute("aria-label", t("about")); }
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
