/* KEVOT Shop — catalog + checkout.
   Payments go through Stripe Payment Links: create one link per product in the Stripe Dashboard
   (Payment Links → New) and paste its URL below. While a link is empty, the "Buy" button sends the
   order request to WhatsApp instead, so the page works from day one. */
(function () {
  var en = window.KevotI18n && window.KevotI18n.lang === "en";
  var T = function (it, e) { return en ? e : it; };

  var STRIPE_LINKS = {
    digital_start: "https://buy.stripe.com/eVq3cu9wfbfO2gJ5Tc8Vi00",
    digital_business: "",
    ai_receptionist: "",
    ai_business: "",
    ai_transformation: "",
    whatsapp_ai: "",
    ai_automation: "",
    crm_systems: "",
    web_ecommerce: "",
    custom_dt: ""
  };
  // Consultation (€50/hour): either one link per number of hours (1..10) ...
  var CONSULT_LINKS = { 1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: "", 10: "" };
  // ... or a single link with "customers can adjust quantity" enabled (hours chosen on the Stripe page)
  var CONSULT_ADJUSTABLE_LINK = "https://buy.stripe.com/6oU28qbEnbfO9Jbbdw8Vi01";
  var CONSULT_RATE = 50, CONSULT_MAX = 10;

  var PACKAGES = [
    { id: "digital_start", name: "Digital Start", price: 2500,
      it: "Sito, lead generation, WhatsApp, analytics, SEO base, smart forms, privacy/GDPR.",
      en: "Website, lead generation, WhatsApp, analytics, basic SEO, smart forms, privacy/GDPR.",
      itNote: "Poi supporto da €99/mese", enNote: "Then support from €99/month" },
    { id: "digital_business", name: "Digital Business", price: 5000, featured: true,
      it: "Sito, CRM, lead management, automazioni, WhatsApp, email workflow, dashboard, booking.",
      en: "Website, CRM, lead management, automations, WhatsApp, email workflows, dashboard, booking.",
      itNote: "Poi supporto da €199/mese", enNote: "Then support from €199/month" },
    { id: "ai_receptionist", name: "AI Receptionist", price: 1500, setup: true,
      it: "Voice AI, lead, booking, CRM, conferma WhatsApp e passaggio a un operatore.",
      en: "Voice AI, leads, booking, CRM, WhatsApp confirmation and human handoff.",
      itNote: "Poi da €249/mese", enNote: "Then from €249/month" },
    { id: "ai_business", name: "AI Business", price: 7500,
      it: "Audit, CRM, AI Agent, WhatsApp AI, automazioni, dashboard, integrazioni e formazione.",
      en: "Audit, CRM, AI Agent, WhatsApp AI, automations, dashboard, integrations and training.",
      itNote: "Poi da €349/mese", enNote: "Then from €349/month" },
    { id: "ai_transformation", name: "AI Transformation", price: 15000,
      it: "Analisi dei processi, strategia, AI Agents, Voice AI, CRM, API, automazioni, dashboard, documenti e formazione.",
      en: "Process analysis, strategy, AI Agents, Voice AI, CRM, API, automations, dashboard, documents and training.",
      itNote: "Poi supporto da €590/mese", enNote: "Then support from €590/month" }
  ];
  var SERVICES = [
    { id: "whatsapp_ai", name: "WhatsApp AI", price: 1200, setup: true,
      it: "Assistenza clienti, vendite, prenotazioni, qualificazione dei lead e integrazione CRM, con passaggio a una persona.",
      en: "Customer support, sales, bookings, lead qualification and CRM integration, with human handoff.",
      itNote: "Poi da €149/mese", enNote: "Then from €149/month" },
    { id: "ai_automation", name: "AI & Automazione", nameEn: "AI & Automation", price: 1500,
      it: "AI Agents, flussi di lavoro, documenti e lead automatizzati: i processi ripetitivi lavorano da soli.",
      en: "AI Agents, workflows, documents and automated leads: repetitive processes run on their own." },
    { id: "crm_systems", name: "CRM & Digital Systems", price: 1500,
      it: "Lead, clienti, opportunità, preventivi, vendite e dashboard in un unico posto, integrati con gli altri canali.",
      en: "Leads, customers, opportunities, quotes, sales and dashboards in one place, integrated with your other channels." },
    { id: "web_ecommerce", name: "Web & E-commerce", price: 2500,
      it: "Siti corporate, e-commerce, sistemi di prenotazione e acquisizione di lead, veloci e collegati a CRM e automazioni.",
      en: "Corporate websites, e-commerce, booking systems and lead generation, fast and connected to CRM and automations." },
    { id: "custom_dt", name: "Custom Digital Transformation", price: 15000,
      it: "Gestionali, applicazioni web e mobile, integrazioni API e dashboard costruiti sui processi della tua azienda.",
      en: "Management systems, web and mobile apps, API integrations and dashboards built around your company's processes." }
  ];

  var eur = function (n) { return "€" + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, en ? "," : "."); };
  var el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  function checkout(link, summary) {
    if (link) { window.open(link, "_blank", "noopener"); return; }
    var msg = T("Ciao KEVOT, vorrei ordinare: ", "Hi KEVOT, I'd like to order: ") + summary;
    var url = window.KevotWA ? window.KevotWA.url(msg) : "mailto:info@kevot.ai?subject=" + encodeURIComponent(msg);
    window.open(url, "_blank", "noopener");
  }

  function card(p) {
    var name = en && p.nameEn ? p.nameEn : p.name;
    var c = el("article", "shop-card" + (p.featured ? " featured" : ""));
    if (p.featured) c.appendChild(el("span", "shop-badge", T("Più scelto", "Most popular")));
    c.appendChild(el("h3", "", esc(name)));
    c.appendChild(el("p", "shop-desc", esc(T(p.it, p.en))));
    var price = el("div", "shop-price", (p.setup ? "<small>" + T("Setup", "Setup") + "</small> " : "") + "<b>" + eur(p.price) + "</b>");
    c.appendChild(price);
    var note = T(p.itNote, p.enNote);
    c.appendChild(el("p", "shop-sub", note ? esc(note) : "&nbsp;"));
    var b = el("button", "pill solid", STRIPE_LINKS[p.id] ? T("Acquista", "Buy") : T("Ordina su WhatsApp", "Order on WhatsApp"));
    b.type = "button";
    b.addEventListener("click", function () { checkout(STRIPE_LINKS[p.id], name + " — " + eur(p.price)); });
    c.appendChild(b);
    return c;
  }

  function section(title, sub, items) {
    var s = el("div", "shop-section");
    s.appendChild(el("h2", "section-title", title));
    if (sub) s.appendChild(el("p", "shop-section-sub", sub));
    var g = el("div", "shop-grid");
    items.forEach(function (p) { g.appendChild(card(p)); });
    s.appendChild(g);
    return s;
  }

  function consult() {
    var hours = 1;
    var wrap = el("div", "shop-consult");
    wrap.innerHTML =
      '<div class="shop-consult-copy"><span class="shop-badge">' + T("Consulenza", "Consultation") + "</span>" +
      "<h2>" + T("Consulenza a ore con KEVOT", "Hourly consultation with KEVOT") + "</h2>" +
      "<p>" + T("Una sessione 1:1 su strategia digitale, AI, automazioni, CRM o sito web. Scegli quante ore ti servono: ogni ora in più costa altri €50.",
                "A 1:1 session on digital strategy, AI, automations, CRM or your website. Choose how many hours you need: every extra hour adds €50.") + "</p>" +
      '<ul><li>' + T("Videochiamata o in presenza in Trentino", "Video call or in person in Trentino") + "</li>" +
      "<li>" + T("Piano d'azione scritto a fine sessione", "Written action plan at the end of the session") + "</li>" +
      "<li>" + T("Le ore si possono sommare e usare in più incontri", "Hours can be added up and used across several meetings") + "</li></ul></div>" +
      '<div class="shop-consult-box"><div class="shop-price"><b>€' + CONSULT_RATE + '</b><small>/ ' + T("ora", "hour") + "</small></div>" +
      '<div class="stepper" role="group" aria-label="' + T("Numero di ore", "Number of hours") + '">' +
      '<button type="button" data-d="-1" aria-label="-">−</button><output id="cHours">1</output><button type="button" data-d="1" aria-label="+">+</button></div>' +
      '<p class="shop-total">' + T("Totale", "Total") + ': <b id="cTotal"></b></p>' +
      '<p class="shop-hint" id="cHint"></p>' +
      '<button type="button" class="pill solid" id="cBuy">' + T("Prenota e paga", "Book and pay") + "</button></div>";
    var out = wrap.querySelector("#cHours"), tot = wrap.querySelector("#cTotal");
    function paint() {
      out.textContent = hours + " " + (hours === 1 ? T("ora", "hour") : T("ore", "hours"));
      tot.textContent = eur(hours * CONSULT_RATE);
      var hint = wrap.querySelector("#cHint");
      hint.textContent = !CONSULT_LINKS[hours] && CONSULT_ADJUSTABLE_LINK
        ? T("Nella pagina di pagamento imposta la quantità: " + hours + (hours === 1 ? " ora." : " ore."), "On the payment page set the quantity to " + hours + (hours === 1 ? " hour." : " hours."))
        : "";
    }
    wrap.querySelectorAll(".stepper button").forEach(function (b) {
      b.addEventListener("click", function () {
        hours = Math.min(CONSULT_MAX, Math.max(1, hours + parseInt(b.getAttribute("data-d"), 10)));
        paint();
      });
    });
    wrap.querySelector("#cBuy").addEventListener("click", function () {
      var link = CONSULT_LINKS[hours] || CONSULT_ADJUSTABLE_LINK;
      checkout(link, T("Consulenza", "Consultation") + " " + hours + " " + (hours === 1 ? T("ora", "hour") : T("ore", "hours")) + " — " + eur(hours * CONSULT_RATE));
    });
    paint();
    return wrap;
  }

  var root = document.getElementById("shopRoot");
  if (!root) return;
  root.appendChild(consult());
  root.appendChild(section(T("Pacchetti", "Packages"), T("Percorsi completi di trasformazione digitale, costruiti attorno ai processi reali della tua azienda.", "Complete digital transformation journeys, built around your company's real processes."), PACKAGES));
  root.appendChild(section(T("Servizi singoli", "Individual services"), T("Parti da un solo problema e amplia il sistema quando serve.", "Start from a single problem and expand the system when needed."), SERVICES));

  document.getElementById("shopNote").innerHTML = T(
    "Prezzi in euro, operazione senza applicazione dell'IVA (regime forfettario). I servizi sono rivolti a imprese e professionisti. Il pagamento è gestito da Stripe: KEVOT non vede né conserva i dati della carta. Per i servizi con «Ordina su WhatsApp» ti inviamo il link di pagamento direttamente in chat. Dopo l'acquisto ti contattiamo entro 1–2 giorni lavorativi per avviare il lavoro. Dubbi? <a href=\"contatti.html\">Scrivici</a> o fai un <a href=\"contatti.html\">Check-up gratuito</a>.",
    "Prices in euros, no VAT applied (flat-rate scheme). Services are intended for businesses and professionals. Payment is handled by Stripe: KEVOT never sees or stores card details. For services marked “Order on WhatsApp” we send you the payment link directly in the chat. After purchase we contact you within 1–2 business days to start the work. Questions? <a href=\"contatti.html\">Write to us</a> or request a <a href=\"contatti.html\">free Check-up</a>."
  );
})();
