/* =========================================================================
   Qiziqarli — barcha sahifalar uchun umumiy skript
   - kunduzgi/tungi mavzu tugmasi
   - raqamlarni o‘zbekcha formatlash (QZ.fmt)
   - nusxa olish va bildirishnoma (QZ.copy, QZ.toast)
   - "Keyingi mavzu" kartasi va pastki menyu havolalari
   ========================================================================= */

(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;
  var data = window.QZ_DATA || { topics: [], categories: [], facts: [] };
  var THEME_KEY = "qz-theme";

  /* Sahifa joylashuviga qarab nisbiy yo‘l: bosh sahifada "", mavzularda "../" */
  var base = body.getAttribute("data-root") || "";

  /* ---------- Raqam formatlash: 1 234 567,8 ---------- */
  function fmt(n, decimals) {
    if (!isFinite(n)) return "—";
    var d = decimals || 0;
    var neg = n < 0;
    var fixed = Math.abs(n).toFixed(d);
    var parts = fixed.split(".");
    var int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return (neg ? "−" : "") + int + (parts[1] ? "," + parts[1] : "");
  }

  /* Katta sonlarni so‘z bilan: 1,2 mlrd */
  function fmtBig(n) {
    var abs = Math.abs(n);
    if (abs >= 1e12) return fmt(n / 1e12, 1) + " trln";
    if (abs >= 1e9) return fmt(n / 1e9, 1) + " mlrd";
    if (abs >= 1e6) return fmt(n / 1e6, 1) + " mln";
    return fmt(n, 0);
  }

  /* ---------- Mavzu (tema) ---------- */
  function currentTheme() {
    var t = root.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function setTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* saqlash shart emas */ }
    updateThemeButtons();
    document.dispatchEvent(new CustomEvent("qz:theme", { detail: t }));
  }

  function updateThemeButtons() {
    var dark = currentTheme() === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
      b.setAttribute("aria-label", dark ? "Kunduzgi rejimga o‘tish" : "Tungi rejimga o‘tish");
      b.setAttribute("title", dark ? "Kunduzgi rejim" : "Tungi rejim");
    });
  }

  document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
    b.addEventListener("click", function () {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  });
  updateThemeButtons();

  /* CSS tokenini o‘qish (canvas chizmalari uchun) */
  function cssVar(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }

  /* ---------- Bildirishnoma ---------- */
  var toastEl = null;
  var toastTimer = 0;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2200);
  }

  /* ---------- Nusxa olish ---------- */
  function copy(text) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      body.removeChild(ta);
      toast(ok ? "Nusxa olindi" : "Nusxa olinmadi: matnni belgilab, qo‘lda nusxalang");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast("Nusxa olindi"); }, fallback);
    } else {
      fallback();
    }
  }

  /* ---------- Mavzular ---------- */
  function topicBySlug(slug) {
    for (var i = 0; i < data.topics.length; i++) if (data.topics[i].slug === slug) return data.topics[i];
    return null;
  }
  function catName(id) {
    for (var i = 0; i < data.categories.length; i++) if (data.categories[i].id === id) return data.categories[i].name;
    return id;
  }
  function topicTag(t) {
    if (t.tag) return { cat: "aralash", name: t.tag };
    return { cat: t.cats[0], name: catName(t.cats[0]) };
  }

  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /* "Keyingi mavzu" kartasi: <div data-next-topic></div> */
  var current = body.getAttribute("data-topic");
  document.querySelectorAll("[data-next-topic]").forEach(function (box) {
    var list = data.topics;
    if (!list.length) return;
    var idx = -1;
    for (var i = 0; i < list.length; i++) if (list[i].slug === current) idx = i;
    var next = list[(idx + 1) % list.length];
    var tag = topicTag(next);
    box.innerHTML =
      '<a class="next-card" data-cat="' + tag.cat + '" href="' + base + next.url + '">' +
        '<div>' +
          '<span class="label">Keyingi mavzu</span>' +
          '<h3>' + next.title + '</h3>' +
          '<p>' + next.desc + '</p>' +
        '</div>' +
        '<span class="next-card__arrow">' + ARROW + '</span>' +
      '</a>';
  });

  /* Pastki menyudagi mavzular ro‘yxati: <ul data-footer-links></ul> */
  document.querySelectorAll("[data-footer-links]").forEach(function (ul) {
    ul.innerHTML = data.topics.map(function (t) {
      return '<li><a href="' + base + t.url + '">' + t.title + '</a></li>';
    }).join("");
  });

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.QZ = {
    data: data,
    base: base,
    fmt: fmt,
    fmtBig: fmtBig,
    toast: toast,
    copy: copy,
    cssVar: cssVar,
    theme: currentTheme,
    topicBySlug: topicBySlug,
    topicTag: topicTag,
    catName: catName,
    reducedMotion: reducedMotion,
    icons: { arrow: ARROW }
  };
})();
