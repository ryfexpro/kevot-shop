/* WhatsApp quick-contact: floating button + any <a data-wa> link.
   Put the business number (international format, digits only, e.g. "393331234567") in WA_NUMBER. */
(function () {
  var WA_NUMBER = "393204615983";
  var en = window.KevotI18n && window.KevotI18n.lang === "en";
  var text = en
    ? "Hi KEVOT, I'd like some information about your solutions."
    : "Ciao KEVOT, vorrei informazioni sulle vostre soluzioni.";
  var url = "https://wa.me/" + WA_NUMBER.replace(/\D/g, "") + "?text=" + encodeURIComponent(text);
  window.KevotWA = { url: function (msg) { return "https://wa.me/" + WA_NUMBER.replace(/\D/g, "") + "?text=" + encodeURIComponent(msg); } };
  var label = en ? "Chat on WhatsApp" : "Scrivici su WhatsApp";

  document.querySelectorAll("a[data-wa]").forEach(function (a) {
    a.href = url; a.target = "_blank"; a.rel = "noopener";
  });

  var fab = document.createElement("a");
  fab.className = "wa-fab";
  fab.href = url; fab.target = "_blank"; fab.rel = "noopener";
  fab.setAttribute("aria-label", label);
  fab.title = label;
  fab.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 8.3c-.4.6-.4 1.6.4 2.9 1 1.7 2.4 3 4.1 3.7 1.1.4 1.8.2 2.3-.4l.3-.8-1.9-1-.8.7c-.9-.4-1.9-1.4-2.4-2.3l.7-.8-.9-2c-.4-.2-1.3-.2-1.8 0z" fill="currentColor"/></svg>';
  document.body.appendChild(fab);
})();
