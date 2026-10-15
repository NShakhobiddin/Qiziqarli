/* =========================================================================
   Bosh sahifa: usturlob, bugungi fakt, mavzular to‘ri, jonli hisoblagichlar
   ========================================================================= */

(function () {
  "use strict";

  var QZ = window.QZ;
  var data = QZ.data;
  var NS = "http://www.w3.org/2000/svg";
  var reduced = QZ.reducedMotion;

  var MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

  /* Hozir tanlangan bo‘lim: "all" yoki kategoriya id si */
  var state = { cat: "all", factIndex: 0, factPool: [] };
  var listeners = [];
  function onCat(fn) { listeners.push(fn); }
  function setCat(cat, source) {
    if (state.cat === cat) cat = "all"; /* qayta bosilsa — hammasi */
    state.cat = cat;
    listeners.forEach(function (fn) { fn(cat, source); });
  }

  /* ================================================================
     1. USTURLOB
     ================================================================ */
  var svg = document.getElementById("usturlob");

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function polar(r, deg) {
    var a = (deg * Math.PI) / 180;
    return [r * Math.cos(a), r * Math.sin(a)];
  }
  function f(n) { return Math.round(n * 100) / 100; }
  function arc(r, a0, a1, reverse) {
    var p0 = polar(r, a0), p1 = polar(r, a1);
    var large = a1 - a0 > 180 ? 1 : 0;
    return reverse
      ? "M" + f(p1[0]) + " " + f(p1[1]) + " A" + r + " " + r + " 0 " + large + " 0 " + f(p0[0]) + " " + f(p0[1])
      : "M" + f(p0[0]) + " " + f(p0[1]) + " A" + r + " " + r + " 0 " + large + " 1 " + f(p1[0]) + " " + f(p1[1]);
  }
  function sector(r0, r1, a0, a1) {
    var a = polar(r1, a0), b = polar(r1, a1), c = polar(r0, a1), d = polar(r0, a0);
    var large = a1 - a0 > 180 ? 1 : 0;
    return "M" + f(a[0]) + " " + f(a[1]) +
      " A" + r1 + " " + r1 + " 0 " + large + " 1 " + f(b[0]) + " " + f(b[1]) +
      " L" + f(c[0]) + " " + f(c[1]) +
      " A" + r0 + " " + r0 + " 0 " + large + " 0 " + f(d[0]) + " " + f(d[1]) + "Z";
  }
  /* 8 qirrali yulduz (ikki kvadrat) */
  function star8(R, rot) {
    var pts = [];
    for (var k = 0; k < 16; k++) {
      var r = k % 2 === 0 ? R : R * 0.7654;
      var p = polar(r, k * 22.5 + (rot || 0));
      pts.push(f(p[0]) + " " + f(p[1]));
    }
    return "M" + pts.join(" L") + "Z";
  }

  var cats = data.categories;
  var SEG = 360 / cats.length;
  var segCenter = {}; /* kategoriya -> markaz burchagi (SVG gradusda) */
  var segEls = {};
  var limbG, reteG, ruleG;

  function buildAstrolabe() {
    if (!svg) return;
    var defs = el("defs", {}, svg);

    /* Asos (mater) va chizilib chiqadigan chegara */
    el("circle", { r: 206, class: "a-mater" }, svg);
    el("circle", { r: 206, class: "a-mater-draw", transform: "rotate(-90)" }, svg);

    /* Limb: daraja shkalasi */
    var limbIn = el("g", { class: "a-limb-in" }, svg);
    limbG = el("g", {}, limbIn);
    var minor = "", major = "";
    for (var d = 0; d < 360; d += 2) {
      var len = d % 30 === 0 ? 14 : d % 10 === 0 ? 9 : 5;
      var p0 = polar(203, d - 90), p1 = polar(203 - len, d - 90);
      var seg = "M" + f(p0[0]) + " " + f(p0[1]) + " L" + f(p1[0]) + " " + f(p1[1]);
      if (d % 30 === 0) major += seg; else minor += seg;
    }
    el("path", { d: minor, class: "a-ticks" }, limbG);
    el("path", { d: major, class: "a-ticks a-ticks-major" }, limbG);
    for (var n = 0; n < 360; n += 30) {
      var pt = polar(181, n - 90);
      var t = el("text", {
        x: f(pt[0]), y: f(pt[1]), class: "a-num",
        "text-anchor": "middle", "dominant-baseline": "central"
      }, limbG);
      t.textContent = n;
    }
    el("circle", { r: 170, class: "a-hair" }, svg);

    /* Bo‘limlar halqasi */
    var ring = el("g", {}, svg);
    cats.forEach(function (c, i) {
      var center = -90 + i * SEG;
      segCenter[c.id] = center;
      var a0 = center - SEG / 2 + 1.2, a1 = center + SEG / 2 - 1.2;
      var bottom = Math.sin((center * Math.PI) / 180) > 0.2; /* pastki yarmida matn teskari bo‘lmasin */
      var pid = "seg-arc-" + c.id;
      el("path", { id: pid, d: bottom ? arc(147, a0, a1, true) : arc(136, a0, a1, false), fill: "none" }, defs);

      var g = el("g", {
        class: "a-seg", "data-cat": c.id, tabindex: "0", role: "button",
        "aria-pressed": "false", "aria-label": c.name + " bo‘limini tanlash"
      }, ring);
      var gi = el("g", { class: "a-seg-in", style: "--i:" + i }, g);
      el("path", { class: "bg", d: sector(118, 165, a0, a1) }, gi);
      var text = el("text", {}, gi);
      var tp = el("textPath", { href: "#" + pid, startOffset: "50%", "text-anchor": "middle" }, text);
      tp.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#" + pid);
      tp.textContent = c.name;
      segEls[c.id] = g;

      g.addEventListener("click", function () { setCat(c.id, "astro"); });
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCat(c.id, "astro"); }
      });
    });

    /* Rete: aylanuvchi yulduzli panjara */
    var reteIn = el("g", { class: "a-rete-in" }, svg);
    reteG = el("g", {}, reteIn);
    el("circle", { r: 108, class: "a-rete-ring" }, reteG);
    el("path", { d: star8(104, 0), class: "a-star-big" }, reteG);
    el("circle", { r: 70, class: "a-rete-ring" }, reteG);
    el("path", { d: star8(60, 22.5), class: "a-star-small" }, reteG);
    for (var k = 0; k < 8; k++) {
      var dp = polar(88, k * 45 + 22.5);
      el("circle", { cx: f(dp[0]), cy: f(dp[1]), r: 3.2, class: "a-rete-dot" }, reteG);
    }
    el("circle", { r: 26, class: "a-rete-ring" }, reteG);

    /* Alidada (o‘lchov chizg‘ichi): markazdan va limbda ko‘rinadi */
    ruleG = el("g", {}, svg);
    el("path", { class: "a-rule", d: "M-3.5 0 L-1.6 -112 L1.6 -112 L3.5 0 L1.6 112 L-1.6 112Z" }, ruleG);
    el("path", { class: "a-rule", d: "M-2 -172 L-1.2 -196 L1.2 -196 L2 -172Z" }, ruleG);
    el("path", { class: "a-rule-tip", d: "M0 -211 L-7 -197 L7 -197Z" }, ruleG);
    el("path", { class: "a-rule", d: "M-2 172 L-1.2 194 L1.2 194 L2 172Z" }, ruleG);

    /* Markaz: "Hammasi" tugmasi */
    var center = el("g", { class: "a-center", tabindex: "0", role: "button", "aria-label": "Barcha bo‘limlarni ko‘rsatish" }, svg);
    el("circle", { r: 34, class: "hit" }, center);
    el("circle", { r: 8, class: "a-pin" }, center);
    center.addEventListener("click", function () { state.cat = "x"; setCat("all", "astro"); });
    center.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); state.cat = "x"; setCat("all", "astro"); }
    });
  }

  /* --- Harakat: rete sekin aylanadi, alidada tanlangan bo‘limga buriladi --- */
  var anim = {
    rete: 0, limb: 0,
    rule: -30, ruleVel: 0, ruleTarget: null,
    px: 0, pxSmooth: 0,
    running: false, visible: true, last: 0
  };

  function shortestTarget(from, to) {
    var diff = ((to - from) % 360 + 540) % 360 - 180;
    return from + diff;
  }

  function frame(now) {
    if (!anim.running) return;
    var dt = Math.min(0.05, (now - (anim.last || now)) / 1000);
    anim.last = now;

    anim.pxSmooth += (anim.px - anim.pxSmooth) * Math.min(1, dt * 4);
    anim.rete += dt * 6;
    if (anim.ruleTarget === null) {
      anim.rule += dt * 9; /* bo‘sh holatda sekin aylanib "qidiradi" */
    } else {
      /* prujina: yumshoq, ozgina o‘tib ketib to‘xtaydi */
      var k = 60, c = 11;
      anim.ruleVel += ((anim.ruleTarget - anim.rule) * k - anim.ruleVel * c) * dt;
      anim.rule += anim.ruleVel * dt;
    }
    applyTransforms();
    requestAnimationFrame(frame);
  }

  function applyTransforms() {
    if (!reteG) return;
    reteG.setAttribute("transform", "rotate(" + f(anim.rete + anim.pxSmooth * 18) + ")");
    limbG.setAttribute("transform", "rotate(" + f(-anim.pxSmooth * 4) + ")");
    ruleG.setAttribute("transform", "rotate(" + f(anim.rule) + ")");
  }

  function startLoop() {
    if (reduced || anim.running || !anim.visible || document.hidden) return;
    anim.running = true;
    anim.last = 0;
    requestAnimationFrame(frame);
  }
  function stopLoop() { anim.running = false; }

  function initAstroMotion() {
    if (!svg) return;
    applyTransforms();
    if (reduced) return;

    var hero = document.querySelector(".hero");
    hero.addEventListener("pointermove", function (e) {
      var r = svg.getBoundingClientRect();
      anim.px = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width)));
    }, { passive: true });
    hero.addEventListener("pointerleave", function () { anim.px = 0; });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        anim.visible = entries[0].isIntersecting;
        if (anim.visible) startLoop(); else stopLoop();
      }).observe(svg);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopLoop(); else startLoop();
    });
    startLoop();
  }

  onCat(function (cat) {
    Object.keys(segEls).forEach(function (id) {
      var on = id === cat;
      segEls[id].classList.toggle("is-on", on);
      segEls[id].setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (!ruleG) return;
    if (cat === "all") {
      anim.ruleTarget = null;
      anim.ruleVel = 0;
    } else {
      var target = shortestTarget(anim.rule, segCenter[cat] + 90);
      anim.ruleTarget = target;
      if (reduced) { anim.rule = target; applyTransforms(); }
    }
  });

  /* ================================================================
     2. BUGUNGI FAKT
     ================================================================ */
  var factText = document.querySelector("[data-fact-text]");
  var factCat = document.querySelector("[data-fact-cat]");
  var factSrc = document.querySelector("[data-fact-source]");
  var factTitle = document.querySelector("[data-fact-title]");
  var factDate = document.querySelector("[data-fact-date]");

  var now = new Date();
  if (factDate) factDate.textContent = now.getDate() + "-" + MONTHS[now.getMonth()] + ", " + now.getFullYear() + "-yil";

  function dayNumber() {
    var start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / 86400000) + now.getFullYear() * 366;
  }

  function showFact(fact, animate) {
    if (!fact || !factText) return;
    factText.textContent = fact.text;
    factCat.textContent = QZ.catName(fact.cat);
    factSrc.textContent = "Manba: " + fact.source;
    if (animate && !reduced) {
      factText.classList.remove("is-swapping");
      void factText.offsetWidth;
      factText.classList.add("is-swapping");
    }
  }

  function poolFor(cat) {
    return data.facts.filter(function (x) { return cat === "all" || x.cat === cat; });
  }

  function initFacts() {
    state.factPool = poolFor("all");
    state.factIndex = dayNumber() % state.factPool.length;
    showFact(state.factPool[state.factIndex], false);

    var next = document.querySelector("[data-fact-next]");
    if (next) next.addEventListener("click", function () {
      var pool = state.factPool;
      if (pool.length < 2) return;
      var i;
      do { i = Math.floor(Math.random() * pool.length); } while (i === state.factIndex);
      state.factIndex = i;
      showFact(pool[i], true);
    });

    var copyBtn = document.querySelector("[data-fact-copy]");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      var fct = state.factPool[state.factIndex];
      QZ.copy(fct.text + " (Manba: " + fct.source + ") — Qiziqarli");
    });
  }

  onCat(function (cat) {
    state.factPool = poolFor(cat);
    state.factIndex = Math.floor(Math.random() * state.factPool.length);
    if (factTitle) factTitle.textContent = cat === "all" ? "Bugungi fakt" : QZ.catName(cat) + " haqida fakt";
    showFact(state.factPool[state.factIndex], true);
  });

  /* ================================================================
     3. MAVZULAR
     ================================================================ */
  var chipsBox = document.querySelector("[data-chips]");
  var grid = document.querySelector("[data-topics]");

  /* Kartalardagi kichik SMIL animatsiyalar (viewBox 0 0 200 120) */
  var ART = {
    orbit:
      '<ellipse class="v-line-soft" cx="100" cy="60" rx="78" ry="34"/>' +
      '<ellipse class="v-line-soft" cx="100" cy="60" rx="46" ry="20"/>' +
      '<circle class="v-sun" cx="100" cy="60" r="13"/>' +
      '<circle class="v-c" r="5.5"><animateMotion dur="9s" repeatCount="indefinite" path="M178 60 A78 34 0 1 1 22 60 A78 34 0 1 1 178 60"/></circle>' +
      '<circle class="v-c-soft" r="4"><animateMotion dur="4s" repeatCount="indefinite" path="M54 60 A46 20 0 1 0 146 60 A46 20 0 1 0 54 60"/></circle>',
    ocean:
      '<path class="v-line" d="M-40 26 q15 -8 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0"><animateTransform attributeName="transform" type="translate" from="0 0" to="60 0" dur="4s" repeatCount="indefinite"/></path>' +
      '<path class="v-line-soft" d="M-40 36 q15 -6 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0"><animateTransform attributeName="transform" type="translate" from="60 0" to="0 0" dur="5s" repeatCount="indefinite"/></path>' +
      '<g class="v-text"><text x="168" y="52">200 m</text><text x="168" y="78">1 km</text><text x="168" y="104">11 km</text></g>' +
      '<path class="v-line-soft" d="M160 49h-130M160 75h-130M160 101h-130" stroke-dasharray="2 4"/>' +
      '<circle class="v-c" cx="96" r="5"><animate attributeName="cy" values="30;104;30" dur="7s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/></circle>',
    timeline:
      '<path class="v-line" d="M16 70 H184"/>' +
      '<path class="v-line-soft" d="M30 62v16M62 62v16M94 62v16M126 62v16M158 62v16"/>' +
      '<g class="v-text" text-anchor="middle"><text x="30" y="94">−2560</text><text x="62" y="94">820</text><text x="94" y="94">1428</text><text x="126" y="94">1961</text><text x="158" y="94">2021</text></g>' +
      '<path class="v-sun" d="M0 -9 L9 0 L0 9 L-9 0Z"><animateMotion dur="6s" repeatCount="indefinite" path="M30 70 H158 H30" keyPoints="0;1;0" keyTimes="0;.5;1" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/></path>',
    water:
      '<g class="v-c-soft"><circle cx="82" cy="40" r="17"/><circle cx="104" cy="32" r="21"/><circle cx="126" cy="42" r="15"/><rect x="70" y="40" width="68" height="17" rx="8.5"/></g>' +
      [78, 96, 114, 132].map(function (x, i) {
        return '<path class="v-c" d="M' + x + ' 64 q4 6 0 9 q-4 -3 0 -9Z" opacity="0"><animateTransform attributeName="transform" type="translate" values="0 0;0 38" dur="1.6s" begin="' + (i * 0.4) + 's" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" dur="1.6s" begin="' + (i * 0.4) + 's" repeatCount="indefinite"/></path>';
      }).join("") +
      '<path class="v-line" d="M30 108 q20 -6 40 0 t40 0 t40 0 t40 0"/>',
    pendulum:
      '<path class="v-line-soft" d="M60 20 H140"/>' +
      '<path class="v-line-soft" d="M56 92 A62 62 0 0 0 144 92" stroke-dasharray="3 4"/>' +
      '<g><path class="v-line" d="M100 20 V96"/><circle class="v-sun" cx="100" cy="98" r="10"/>' +
      '<animateTransform attributeName="transform" type="rotate" values="-38 100 20;38 100 20;-38 100 20" dur="2.4s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/></g>' +
      '<circle class="v-ink" cx="100" cy="20" r="3"/>',
    pulse:
      '<path class="v-line-soft" d="M10 64 H58 L66 50 L74 64 L84 64 L92 22 L102 98 L110 64 L124 64 L132 54 L140 64 H190"/>' +
      '<path class="v-line" d="M10 64 H58 L66 50 L74 64 L84 64 L92 22 L102 98 L110 64 L124 64 L132 54 L140 64 H190" stroke-dasharray="320" stroke-dashoffset="320"><animate attributeName="stroke-dashoffset" values="320;0;0;-320" keyTimes="0;.45;.6;1" dur="2.6s" repeatCount="indefinite"/></path>',
    quiz:
      '<rect class="v-c" x="44" y="28" width="52" height="64" rx="10"/>' +
      '<rect class="v-anor" x="104" y="28" width="52" height="64" rx="10"/>' +
      '<text class="v-big" x="70" y="68" text-anchor="middle">H</text>' +
      '<text class="v-big" x="130" y="68" text-anchor="middle">A</text>' +
      '<g><circle class="v-sun" cx="100" cy="100" r="7"/><animateTransform attributeName="transform" type="translate" values="-30 0;-30 0;30 0;30 0;-30 0" keyTimes="0;.35;.5;.85;1" dur="4s" repeatCount="indefinite"/></g>'
  };

  function artSvg(t) {
    return '<svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' + (ART[t.art] || "") + "</svg>";
  }

  var GO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function cardHtml(t, wide) {
    var tag = QZ.topicTag(t);
    return '<a class="tcard' + (wide ? " is-wide" : "") + '" data-cat="' + tag.cat + '" href="' + t.url + '">' +
      '<div class="tcard__art">' + artSvg(t) + "</div>" +
      '<div class="tcard__body">' +
        '<div class="tcard__meta"><span class="tag" data-cat="' + tag.cat + '">' + tag.name + '</span><span class="label">' + t.kind + " · " + t.minutes + " daq</span></div>" +
        "<h3>" + t.title + "</h3>" +
        "<p>" + t.desc + "</p>" +
        '<span class="tcard__go">Ochish ' + GO + "</span>" +
      "</div></a>";
  }

  function renderTopics(cat) {
    if (!grid) return;
    var list = data.topics.filter(function (t) { return cat === "all" || t.cats.indexOf(cat) !== -1; });
    if (!list.length) {
      grid.innerHTML = '<p class="topics-empty">Bu bo‘limda hozircha mavzu yo‘q. Boshqa bo‘limni tanlang.</p>';
      return;
    }
    grid.innerHTML = list.map(function (t, i) {
      var wide = cat === "all" && (i === 0 || (i === list.length - 1 && list.length % 3 === 1));
      return cardHtml(t, wide);
    }).join("");
    if (reduced) grid.querySelectorAll("svg").forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); });
  }

  function renderChips() {
    if (!chipsBox) return;
    var items = [{ id: "all", name: "Hammasi", n: data.topics.length }].concat(cats.map(function (c) {
      return { id: c.id, name: c.name, n: data.topics.filter(function (t) { return t.cats.indexOf(c.id) !== -1; }).length };
    }));
    chipsBox.innerHTML = items.map(function (c) {
      return '<button class="chip" type="button" data-cat="' + c.id + '" aria-pressed="' + (c.id === state.cat) + '">' + c.name + ' <span class="n">' + c.n + "</span></button>";
    }).join("");
    chipsBox.addEventListener("click", function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      var id = b.getAttribute("data-cat");
      if (id === "all") state.cat = "x";
      setCat(id, "chips");
    });
  }

  onCat(function (cat, source) {
    if (chipsBox) chipsBox.querySelectorAll(".chip").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-cat") === cat ? "true" : "false");
    });
    renderTopics(cat);
  });

  /* Tasodifiy mavzu */
  var rnd = document.querySelector("[data-random-topic]");
  if (rnd) rnd.addEventListener("click", function () {
    var t = data.topics[Math.floor(Math.random() * data.topics.length)];
    window.location.href = t.url;
  });

  var countEl = document.querySelector("[data-topic-count]");
  if (countEl) countEl.textContent = data.topics.length + " ta interaktiv mavzu";

  /* ================================================================
     4. JONLI HISOBLAGICHLAR
     ================================================================ */
  function initCounters() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-counter]"));
    var elapsedEl = document.querySelector("[data-elapsed]");
    var t0 = performance.now();
    var items = nodes.map(function (n) {
      var unit = n.querySelector("small");
      return { el: n, rate: parseFloat(n.getAttribute("data-counter")), unit: unit ? unit.outerHTML : "" };
    });
    function tick() {
      var s = (performance.now() - t0) / 1000;
      items.forEach(function (it) { it.el.innerHTML = QZ.fmt(Math.floor(s * it.rate)) + it.unit; });
      if (elapsedEl) {
        var m = Math.floor(s / 60), sec = Math.floor(s % 60);
        elapsedEl.textContent = m + ":" + (sec < 10 ? "0" : "") + sec;
      }
    }
    tick();
    setInterval(tick, reduced ? 1000 : 100);
  }

  /* ================================================================ */
  buildAstrolabe();
  initAstroMotion();
  initFacts();
  renderChips();
  renderTopics("all");
  initCounters();
})();
