(function () {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  const closeBtn = document.getElementById("mobileMenuClose");
  if (toggle && menu) {
    const open = () => { menu.classList.add("open"); document.body.style.overflow = "hidden"; };
    const close = () => { menu.classList.remove("open"); document.body.style.overflow = ""; };
    toggle.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    menu.addEventListener("click", (e) => { if (e.target === menu) close(); });
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
    document.addEventListener("click", (e) => {
      if (menu.classList.contains("open") && !menu.contains(e.target) && !toggle.contains(e.target)) close();
    });
  }

  const banner = document.getElementById("cookieBanner");
  if (banner) {
    let seen = false;
    try { seen = !!localStorage.getItem("kevot_cookie_ok"); } catch (e) {}
    if (!seen) {
      setTimeout(() => { banner.classList.add("show"); document.body.classList.add("cookie-open"); }, 900);
    }
    const accept = document.getElementById("cookieAccept");
    if (accept) accept.addEventListener("click", () => {
      banner.classList.remove("show");
      document.body.classList.remove("cookie-open");
      try { localStorage.setItem("kevot_cookie_ok", "1"); } catch (e) {}
    });
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.2 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  const pre = document.getElementById("preloader");
  if (pre) {
    const hide = () => {
      pre.classList.add("done");
      document.body.classList.remove("is-loading");
      setTimeout(() => pre.remove(), 900);
    };
    let shown = false;
    try { shown = !!sessionStorage.getItem("kevot_pre"); sessionStorage.setItem("kevot_pre", "1"); } catch (e) {}
    setTimeout(hide, shown ? 150 : 1300);
  }

  const dotTargets = [...document.querySelectorAll("[data-dot]")];
  if (dotTargets.length > 1) {
    const nav = document.createElement("nav");
    nav.className = "dots";
    nav.setAttribute("aria-label", "Sezioni");
    const links = dotTargets.map((sec) => {
      const a = document.createElement("a");
      a.href = "#" + sec.id;
      a.dataset.label = sec.dataset.dot;
      a.setAttribute("aria-label", sec.dataset.dot);
      nav.appendChild(a);
      return a;
    });
    document.body.appendChild(nav);
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const i = dotTargets.indexOf(e.target);
          links.forEach((l, j) => l.classList.toggle("on", i === j));
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    dotTargets.forEach((s) => spy.observe(s));
  }
})();
