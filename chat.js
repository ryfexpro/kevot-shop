(function () {
  const EN = !!(window.KevotI18n && window.KevotI18n.lang === "en");
  const L = (it, en) => (EN ? en : it);
  const QUESTIONS_IT = [
    { k: "automatizzare", q: "Come posso automatizzare la mia azienda?" },
    { k: "receptionist", q: "Quanto costa un AI Receptionist?" },
    { k: "crm", q: "Posso collegare il mio CRM?" },
    { k: "whatsapp", q: "Come posso automatizzare WhatsApp?" },
    { k: "processi", q: "Quali processi posso automatizzare?" }
  ];
  const QUESTIONS_EN = [
    { k: "automatizzare", q: "How can I automate my business?" },
    { k: "receptionist", q: "How much does an AI Receptionist cost?" },
    { k: "crm", q: "Can I connect my CRM?" },
    { k: "whatsapp", q: "How can I automate WhatsApp?" },
    { k: "processi", q: "Which processes can I automate?" }
  ];
  const QUESTIONS = EN ? QUESTIONS_EN : QUESTIONS_IT;
  const ANSWERS_EN = {
    automatizzare: "We start with a free Digital & AI Check-up: we analyze your processes and build a tailored system across AI, CRM, WhatsApp and automations — you can start with one problem and expand over time.",
    receptionist: "An AI Receptionist setup starts at €1,500, with a fee from €249/month. It answers 24/7, collects data, handles bookings and hands the call to an operator when needed.",
    crm: "In most cases, yes: when technically possible we integrate your existing CRM via API or connectors, without forcing you to change tools.",
    whatsapp: "Yes: we connect WhatsApp Business to FAQs, lead qualification, bookings, quotes, follow-up and CRM, with handoff to a person when needed. Setup from €1,200, from €149/month.",
    processi: "Leads, quotes, follow-up, notifications, email, bookings, data entry, reports and internal communications are among the processes our clients automate most."
  };
  const ANSWERS_IT = {
    automatizzare: "Partiamo da un Digital & AI Check-up gratuito: analizziamo i tuoi processi e costruiamo un sistema su misura tra AI, CRM, WhatsApp e automazioni — si può iniziare da un problema e ampliare nel tempo.",
    receptionist: "Il setup di un AI Receptionist parte da €1.500, con un canone da €249/mese. Risponde 24/7, raccoglie dati, gestisce prenotazioni e passa la chiamata a un operatore quando serve.",
    crm: "Nella maggior parte dei casi sì: quando tecnicamente possibile integriamo il tuo CRM esistente tramite API o connettori, senza obbligarti a cambiare strumenti.",
    whatsapp: "Sì: colleghiamo WhatsApp Business a FAQ, qualificazione lead, prenotazioni, preventivi, follow-up e CRM, con passaggio a una persona quando serve. Setup da €1.200, da €149/mese.",
    processi: "Lead, preventivi, follow-up, notifiche, email, prenotazioni, data entry, report e comunicazioni interne sono tra i processi più automatizzati dai nostri clienti."
  };

  const ANSWERS = EN ? ANSWERS_EN : ANSWERS_IT;
  const orb = () => window.KevotOrb;
  const qualified = new WeakSet();

  function bubble(win, cls, text) {
    const b = document.createElement("div");
    b.className = "chat-bubble " + cls;
    if (text) b.textContent = text;
    win.appendChild(b);
    win.scrollTop = win.scrollHeight;
    return b;
  }

  function showQualify(win) {
    if (qualified.has(win)) return;
    qualified.add(win);
    bubble(win, "bot", L("Vuoi una consulenza personalizzata? Lasciaci i tuoi dati e ti ricontattiamo noi.", "Want a personalized consultation? Leave us your details and we will get back to you."));
    const form = document.createElement("form");
    form.className = "qualify-form";
    form.innerHTML =
      '<input type="text" placeholder="' + L("Nome", "Name") + '" required name="nome" />' +
      '<input type="text" placeholder="' + L("Azienda", "Company") + '" required name="azienda" />' +
      '<select name="settore" required><option value="" disabled selected>' + L("Settore", "Industry") + "</option>" +
      (EN
        ? "<option>Hospitality</option><option>Dining</option><option>Beauty &amp; Wellness</option><option>Automotive</option><option>Real Estate</option><option>Professional firms</option><option>Other</option>"
        : "<option>Hospitality</option><option>Ristorazione</option><option>Beauty &amp; Wellness</option><option>Automotive</option><option>Immobiliare</option><option>Studi professionali</option><option>Altro</option>") +
      "</select>" +
      '<input type="tel" placeholder="' + L("Telefono", "Phone") + '" required name="telefono" />' +
      '<input type="email" placeholder="Email" required name="email" />' +
      '<button type="submit">' + L("Prenota una consulenza gratuita", "Book a free consultation") + "</button>";
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form).entries());
      const body = encodeURIComponent(
        `${L("Nome", "Name")}: ${d.nome}\n${L("Azienda", "Company")}: ${d.azienda}\n${L("Settore", "Industry")}: ${d.settore}\n${L("Telefono", "Phone")}: ${d.telefono}\nEmail: ${d.email}`
      );
      window.location.href = `mailto:info@kevot.ai?subject=${encodeURIComponent(L("Richiesta consulenza da KEVOT AI", "Consultation request from KEVOT AI"))}&body=${body}`;
    });
    win.appendChild(form);
    win.scrollTop = win.scrollHeight;
  }

  function ask(win, key, label) {
    bubble(win, "user", label);
    const typing = bubble(win, "bot typing", "");
    typing.innerHTML = "<i></i><i></i><i></i>";
    if (orb()) orb().listening(true);
    setTimeout(() => {
      typing.className = "chat-bubble bot";
      typing.textContent = ANSWERS[key];
      win.scrollTop = win.scrollHeight;
      if (orb()) { orb().pulse(); orb().listening(false); }
      setTimeout(() => showQualify(win), 500);
    }, 750);
  }

  function bindChips(win, chipsEl) {
    chipsEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".chat-chip");
      if (btn) ask(win, btn.dataset.q, btn.textContent);
    });
  }

  const panel = document.createElement("div");
  panel.className = "chat-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "KEVOT AI");
  panel.innerHTML =
    '<div class="cp-head"><span class="pf-avatar">K</span>' +
    '<span class="pf-head-text"><span class="pf-head-name">KEVOT AI</span><span class="pf-head-status">Online</span></span>' +
    '<button class="cp-close" type="button" aria-label="' + L("Chiudi chat", "Close chat") + '">×</button></div>' +
    '<div class="chat-window cp-window"><div class="chat-bubble bot">' + L("Ciao, sono KEVOT AI. Non leggere cosa può fare l\'AI: provala. Scegli una domanda.", "Hi, I'm KEVOT AI. Don't just read what AI can do: try it. Pick a question.") + '</div></div>' +
    '<div class="chat-suggestions cp-chips">' +
    QUESTIONS.map((x) => `<button class="chat-chip" type="button" data-q="${x.k}">${x.q}</button>`).join("") +
    "</div>";

  const fab = document.createElement("button");
  fab.className = "chat-fab";
  fab.type = "button";
  fab.setAttribute("aria-label", L("Parla con KEVOT AI", "Talk to KEVOT AI"));
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M4 5h16v11H9l-5 4V5z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';

  document.body.appendChild(panel);
  document.body.appendChild(fab);

  const pWin = panel.querySelector(".cp-window");
  bindChips(pWin, panel.querySelector(".cp-chips"));

  function open() { panel.classList.add("open"); fab.classList.add("hide"); if (orb()) orb().listening(true); }
  function close() { panel.classList.remove("open"); fab.classList.remove("hide"); if (orb()) orb().listening(false); }
  fab.addEventListener("click", open);
  panel.querySelector(".cp-close").addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  window.KevotChat = { open, close };

  const demoWin = document.getElementById("chatWindow");
  const demoChips = document.getElementById("chatSuggestions");
  if (demoWin && demoChips) bindChips(demoWin, demoChips);

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href$="#ai-demo"], [data-open-chat]');
    if (!a) return;
    e.preventDefault();
    open();
  });
})();
