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

  /* Kichik yulduzlar (deterministik) */
  function dots(n, seed, cls) {
    var out = "", x = seed;
    function rnd() { x = (x * 9301 + 49297) % 233280; return x / 233280; }
    for (var i = 0; i < n; i++) out += '<circle class="' + cls + '" cx="' + f(rnd() * 200) + '" cy="' + f(rnd() * 120) + '" r="' + f(0.5 + rnd() * 0.9) + '"/>';
    return out;
  }

  /* Kartalardagi illyustratsiyalar (viewBox 0 0 200 120, to‘yingan fon ustida) */
  var ART = {
    orbit:
      dots(26, 7, "v-oq-70") +
      '<circle class="v-oltin" cx="100" cy="60" r="24" opacity=".16"/>' +
      '<circle class="v-oltin" cx="100" cy="60" r="13"/>' +
      '<ellipse class="v-chiziq-35" cx="100" cy="60" rx="42" ry="17"/>' +
      '<ellipse class="v-chiziq-35" cx="100" cy="60" rx="66" ry="27"/>' +
      '<ellipse class="v-chiziq-35" cx="100" cy="60" rx="92" ry="38"/>' +
      '<circle class="v-mars" r="3.5"><animateMotion dur="3.2s" repeatCount="indefinite" path="M142 60 A42 17 0 1 1 58 60 A42 17 0 1 1 142 60"/></circle>' +
      '<circle class="v-yer" r="5"><animateMotion dur="6s" repeatCount="indefinite" path="M166 60 A66 27 0 1 1 34 60 A66 27 0 1 1 166 60"/></circle>' +
      '<g><animateMotion dur="14s" repeatCount="indefinite" path="M192 60 A92 38 0 1 1 8 60 A92 38 0 1 1 192 60"/>' +
        '<circle class="v-saturn" r="6"/><ellipse class="v-saturn-ring" rx="11" ry="3.2" transform="rotate(-18)"/></g>',
    ocean:
      '<rect width="200" height="120" fill="url(#art-chuqurlik)"/>' +
      '<path class="v-oq-15" d="M40 0 L70 0 L50 120 L10 120Z M110 0 L130 0 L150 120 L118 120Z"/>' +
      '<path class="v-chiziq" d="M-40 16 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"><animateTransform attributeName="transform" type="translate" from="0 0" to="40 0" dur="3s" repeatCount="indefinite"/></path>' +
      '<g class="v-text" text-anchor="end"><text x="194" y="47">200 m</text><text x="194" y="78">1 km</text><text x="194" y="110">11 km</text></g>' +
      '<path class="v-chiziq-35" d="M150 44h-140M160 75h-150M156 107h-146" stroke-dasharray="2 4"/>' +
      '<path class="v-oq-70" d="M0 0q9 -6 18 0q-9 6 -18 0z M18 0l7 -5v10z"><animateMotion dur="11s" repeatCount="indefinite" path="M-30 58 C40 50 120 66 230 56"/></path>' +
      '<path class="v-oq-35" d="M0 0q6 -4 12 0q-6 4 -12 0z M12 0l5 -3.5v7z"><animateMotion dur="15s" begin="-6s" repeatCount="indefinite" path="M-30 90 C60 96 140 84 230 92"/></path>' +
      [60, 84, 132].map(function (x, i) {
        return '<circle class="v-chiziq-35" cx="' + x + '" r="' + (2 + i % 2) + '"><animate attributeName="cy" values="118;20" dur="' + (4 + i) + 's" begin="-' + i * 1.3 + 's" repeatCount="indefinite"/></circle>';
      }).join(""),
    timeline:
      '<path class="v-oq-70" d="M20 74 L38 42 L56 74Z"/>' +
      '<path class="v-oq-35" d="M38 42 L56 74 L46 74Z"/>' +
      '<rect class="v-oq-70" x="86" y="54" width="34" height="20"/><path class="v-oq-70" d="M90 54 A13 14 0 0 1 116 54Z"/><rect class="v-oq-70" x="82" y="40" width="4" height="34"/><rect class="v-oq-70" x="120" y="40" width="4" height="34"/>' +
      '<path class="v-oq-70" d="M156 74 V50 Q162 32 168 50 V74Z M156 66 l-6 8h6z M168 66 l6 8h-6z"/>' +
      '<path class="v-chiziq" d="M10 84 H190"/>' +
      '<path class="v-chiziq-35" d="M38 79v10M103 79v10M162 79v10"/>' +
      '<g class="v-text" text-anchor="middle"><text x="38" y="102">−2560</text><text x="103" y="102">1420</text><text x="162" y="102">1961</text></g>' +
      '<path class="v-lojuvard" d="M0 -8 L8 0 L0 8 L-8 0Z"><animateMotion dur="6s" repeatCount="indefinite" path="M38 84 H162 H38" keyPoints="0;1;0" keyTimes="0;.5;1" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/></path>',
    map:
      '<ellipse class="v-oq-35" cx="44" cy="30" rx="16" ry="12"/>' +
      '<path class="v-oq-15" d="M24 40 L54 30 L70 42 L92 46 L108 58 L128 52 L146 40 L170 44 L188 54 L172 62 L152 60 L140 70 L124 82 L112 100 L94 104 L86 90 L72 78 L54 68 L36 64 L22 54Z"/>' +
      '<path class="v-lojuvard" opacity=".55" d="M86 60 L108 58 L124 70 L112 92 L94 96 L84 82Z"><animate attributeName="opacity" values=".55;.15;.55" dur="5s" repeatCount="indefinite"/></path>' +
      '<path class="v-anor" opacity=".15" d="M128 52 L146 40 L170 44 L176 56 L152 60 L136 64Z"><animate attributeName="opacity" values=".15;.6;.15" dur="5s" repeatCount="indefinite"/></path>' +
      '<path class="v-chiziq-35" d="M58 34 C70 50 82 60 104 64 M150 50 C130 52 118 46 98 40"/>' +
      '<path class="v-chiziq v-march" fill="none" d="M24 40 L54 30 L70 42 L92 46 L108 58 L128 52 L146 40 L170 44 L188 54 L172 62 L152 60 L140 70 L124 82 L112 100 L94 104 L86 90 L72 78 L54 68 L36 64 L22 54Z"/>' +
      '<path class="v-lojuvard v-beat" d="M104 62l2.4 5 5.4.6-4 3.7 1 5.3-4.8-2.6-4.8 2.6 1-5.3-4-3.7 5.4-.6z"/>' +
      '<circle class="v-oq" cx="150" cy="50" r="3"/>',
    water:
      '<g class="v-spin"><path class="v-chiziq-oltin" opacity=".7" d="M34 8v8M34 44v8M12 30h8M48 30h8M18 14l6 6M44 40l6 6M18 46l6-6M44 20l6-6"/></g>' +
      '<circle class="v-oltin" cx="34" cy="30" r="11"/>' +
      '<path class="v-oq-35" d="M118 104 L156 40 L194 104Z"/>' +
      '<path class="v-oq" d="M148 54 L156 40 L164 54 L159 51 L156 56 L152 51Z"/>' +
      '<g class="v-oq"><circle cx="96" cy="30" r="12"/><circle cx="112" cy="24" r="15"/><circle cx="128" cy="31" r="11"/><rect x="86" y="30" width="52" height="12" rx="6"/></g>' +
      [100, 112, 124, 136].map(function (x, i) {
        return '<path class="v-oq-70" d="M' + x + ' 46 q3 5 0 7 q-3 -2 0 -7Z" opacity="0"><animateTransform attributeName="transform" type="translate" values="0 0;8 40" dur="1.4s" begin="' + (i * 0.35) + 's" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" dur="1.4s" begin="' + (i * 0.35) + 's" repeatCount="indefinite"/></path>';
      }).join("") +
      '<rect class="v-oq-15" x="0" y="96" width="120" height="24"/>' +
      '<path class="v-chiziq" d="M0 98 q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0"/>' +
      [30, 54, 78].map(function (x, i) {
        return '<path class="v-chiziq-35" d="M' + x + ' 92 q-3 -5 0 -10 q3 -5 0 -10"><animateTransform attributeName="transform" type="translate" values="0 6;0 -14" dur="2.4s" begin="-' + i * 0.8 + 's" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="-' + i * 0.8 + 's" repeatCount="indefinite"/></path>';
      }).join(""),
    pendulum:
      '<path class="v-chiziq-35" d="M20 0v120M60 0v120M100 0v120M140 0v120M180 0v120M0 30h200M0 70h200M0 110h200" opacity=".5"/>' +
      '<path class="v-oq" d="M70 14 H130 V18 H70Z"/>' +
      '<path class="v-chiziq-35" d="M58 90 A56 56 0 0 0 142 90" stroke-dasharray="3 4"/>' +
      '<g><path class="v-chiziq" d="M100 18 V96"/><circle class="v-oltin" cx="100" cy="98" r="11"/><circle class="v-oq-70" cx="96" cy="94" r="3"/>' +
      '<animateTransform attributeName="transform" type="rotate" values="-36 100 18;36 100 18;-36 100 18" dur="2.2s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/></g>' +
      '<circle class="v-oq" cx="100" cy="18" r="3"/>' +
      '<text class="v-text" x="10" y="112">T = 2π√(L/g)</text>',
    pulse:
      '<path class="v-oq-15" d="M0 60 H200"/>' +
      '<path class="v-oq v-beat" d="M48 86S20 70 20 50a14 14 0 0 1 28-5 14 14 0 0 1 28 5c0 20-28 36-28 36z"/>' +
      '<path class="v-chiziq-35" d="M86 60 H112 L118 48 L124 60 L130 60 L138 26 L146 92 L152 60 L162 60 L168 52 L174 60 H200"/>' +
      '<path class="v-chiziq" d="M86 60 H112 L118 48 L124 60 L130 60 L138 26 L146 92 L152 60 L162 60 L168 52 L174 60 H200" stroke-dasharray="220" stroke-dashoffset="220"><animate attributeName="stroke-dashoffset" values="220;0;0;-220" keyTimes="0;.45;.6;1" dur="2.2s" repeatCount="indefinite"/></path>' +
      '<text class="v-text" x="88" y="106">≈ 72 / daqiqa</text>',
    quiz:
      dots(18, 3, "v-oq-35") +
      '<g class="v-flip"><rect class="v-oq" x="42" y="26" width="54" height="68" rx="10"/><text class="v-big" x="69" y="68" text-anchor="middle" style="fill:var(--art-aralash)">H</text></g>' +
      '<g class="v-flip b"><rect class="v-oltin" x="104" y="26" width="54" height="68" rx="10"/><text class="v-big" x="131" y="68" text-anchor="middle" style="fill:var(--art-aralash)">A</text></g>' +
      '<text class="v-text" x="100" y="112" text-anchor="middle">haqiqatmi yoki afsona?</text>'
  };

  var PATTERN = '<svg class="pat" aria-hidden="true" focusable="false"><rect width="100%" height="100%" fill="url(#girih)"/></svg>';

  function artSvg(t) {
    if (t.image) return PATTERN + '<img src="' + t.image + '" alt="" loading="lazy" decoding="async">';
    return PATTERN + '<svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' + (ART[t.art] || "") + "</svg>";
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
      "</div>" +
      '<span class="tcard__glare" aria-hidden="true"></span>' +
      "</a>";
  }

  function renderTopics(cat) {
    if (!grid) return;
    var list = data.topics.filter(function (t) { return cat === "all" || t.cats.indexOf(cat) !== -1; });
    if (!list.length) {
      grid.innerHTML = '<p class="topics-empty">Bu bo‘limda hozircha mavzu yo‘q. Boshqa bo‘limni tanlang.</p>';
      return;
    }
    var allMode = cat === "all";
    grid.innerHTML = list.map(function (t, i) {
      var wide = allMode && (i === 0 || (i === list.length - 1 && list.length % 3 === 1));
      return cardHtml(t, wide);
    }).join("");
    /* 2 ustunli ekranda birinchi karta faqat qolganlar juft bo‘lsa keng bo‘ladi */
    grid.setAttribute("data-span2", allMode && (list.length - 1) % 2 === 0 ? "1" : "0");
    if (reduced) grid.querySelectorAll("svg").forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); });
  }

  /* Kartalarni sichqonchaga qarab 3D egish */
  function initTilt() {
    if (!grid || reduced) return;
    grid.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var card = e.target.closest(".tcard");
      if (!card) return;
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.classList.add("is-tilting");
      card.style.setProperty("--rx", f((0.5 - py) * 7) + "deg");
      card.style.setProperty("--ry", f((px - 0.5) * 9) + "deg");
      card.style.setProperty("--gx", f(px * 100) + "%");
      card.style.setProperty("--gy", f(py * 100) + "%");
    });
    grid.addEventListener("pointerout", function (e) {
      var card = e.target.closest(".tcard");
      if (!card || card.contains(e.relatedTarget)) return;
      card.classList.remove("is-tilting");
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
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

  /* ================================================================
     5. TUNGI OSMON: Qutb yulduzi atrofida aylanuvchi yulduzlar
     ================================================================ */
  function initSky() {
    var cv = document.querySelector("[data-sky]");
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d");
    var TAU = Math.PI * 2;
    var W = 0, H = 0, stars = [], pole = { x: 0, y: 0 }, rot = 0;
    var running = false, visible = true, last = 0, shoot = null, nextShoot = 2.5;
    var colors = [QZ.cssVar("--tun-matn") || "#f1f3ff", QZ.cssVar("--oltin-2") || "#ffd98a", QZ.cssVar("--c-koinot") || "#9fb2ff"];

    function build() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      if (!W || !H) return;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pole = { x: W * 0.72, y: -H * 0.25 };
      var R = Math.hypot(Math.max(pole.x, W - pole.x), H - pole.y) + 30;
      var n = Math.round(Math.min(480, (W * H) / 2300));
      stars = [];
      for (var i = 0; i < n; i++) {
        var k = Math.random();
        stars.push({
          r: R * Math.sqrt(Math.random()),
          a: Math.random() * TAU,
          s: Math.random() < 0.07 ? 1.6 + Math.random() * 0.9 : 0.5 + Math.random() * 1.0,
          tw: 0.6 + Math.random() * 2.4,
          ph: Math.random() * TAU,
          b: 0.35 + Math.random() * 0.65,
          c: k < 0.84 ? colors[0] : k < 0.94 ? colors[1] : colors[2]
        });
      }
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var a = s.a + rot;
        var x = pole.x + Math.cos(a) * s.r, y = pole.y + Math.sin(a) * s.r;
        if (x < -6 || x > W + 6 || y < -6 || y > H + 6) continue;
        var fade = y > H * 0.7 ? Math.max(0, 1 - (y - H * 0.7) / (H * 0.3)) : 1;
        var al = s.b * (0.55 + 0.45 * Math.sin(t * s.tw + s.ph)) * fade;
        if (al <= 0.02) continue;
        ctx.globalAlpha = al;
        ctx.fillStyle = s.c;
        if (s.s > 1.5) {
          ctx.beginPath(); ctx.arc(x, y, s.s, 0, TAU); ctx.fill();
          ctx.globalAlpha = al * 0.18;
          ctx.beginPath(); ctx.arc(x, y, s.s * 3.4, 0, TAU); ctx.fill();
        } else {
          ctx.fillRect(x - s.s / 2, y - s.s / 2, s.s, s.s);
        }
      }
      if (shoot) {
        var p = shoot.life / shoot.dur;
        var hx = shoot.x + shoot.vx * shoot.life, hy = shoot.y + shoot.vy * shoot.life;
        var len = 140 * Math.min(1, p * 3);
        var sp = Math.hypot(shoot.vx, shoot.vy);
        var tx = hx - (shoot.vx / sp) * len, ty = hy - (shoot.vy / sp) * len;
        var g = ctx.createLinearGradient(hx, hy, tx, ty);
        g.addColorStop(0, colors[0]);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.globalAlpha = Math.sin(Math.PI * Math.min(1, p));
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(tx, ty); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function loop(now) {
      if (!running) return;
      var dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      rot += dt * 0.012;
      nextShoot -= dt;
      if (!shoot && nextShoot <= 0) {
        var dir = Math.random() < 0.5 ? 1 : -1;
        var ang = (18 + Math.random() * 20) * Math.PI / 180;
        var speed = 650 + Math.random() * 350;
        shoot = { x: W * (dir > 0 ? 0.1 + Math.random() * 0.4 : 0.5 + Math.random() * 0.4), y: H * (0.04 + Math.random() * 0.3), vx: Math.cos(ang) * speed * dir, vy: Math.sin(ang) * speed, life: 0, dur: 0.9 };
        nextShoot = 5 + Math.random() * 7;
      }
      if (shoot) { shoot.life += dt; if (shoot.life > shoot.dur) shoot = null; }
      draw(now / 1000);
      requestAnimationFrame(loop);
    }
    function start() {
      if (reduced || running || !visible || document.hidden) return;
      running = true; last = 0;
      requestAnimationFrame(loop);
    }
    function stop() { running = false; }

    build();
    draw(0);
    if ("ResizeObserver" in window) new ResizeObserver(function () { build(); draw(performance.now() / 1000); }).observe(cv);
    if (reduced) return;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); else stop(); }).observe(cv);
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
    start();
  }

  /* ================================================================
     6. REGISTON SILUETI (Ulug‘bek, Tillakori, Sherdor madrasalari)
     ================================================================ */
  function initSkyline() {
    var box = document.querySelector("[data-skyline]");
    if (!box) return;
    var GY = 170, out = "", seed = 11;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    function rect(x, y, w, h, c) { return '<rect class="' + c + '" x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"/>'; }
    function arch(x, y, w, h, c) {
      return '<path class="' + c + '" d="M' + f(x) + " " + f(y + h) + " V" + f(y + h * 0.42) + " Q" + f(x) + " " + f(y + h * 0.08) + " " + f(x + w / 2) + " " + f(y) +
        " Q" + f(x + w) + " " + f(y + h * 0.08) + " " + f(x + w) + " " + f(y + h * 0.42) + " V" + f(y + h) + 'Z"/>';
    }
    function dome(cx, base, r, h) {
      var s = rect(cx - r * 0.82, base, r * 1.64, 16, "sk-bino-2");
      s += '<path class="sk-gumbaz" d="M' + f(cx - r) + " " + f(base) + " C" + f(cx - r) + " " + f(base - h * 0.95) + " " + f(cx - r * 0.25) + " " + f(base - h) + " " + f(cx) + " " + f(base - h * 1.12) +
        " C" + f(cx + r * 0.25) + " " + f(base - h) + " " + f(cx + r) + " " + f(base - h * 0.95) + " " + f(cx + r) + " " + f(base) + 'Z"/>';
      for (var k = -2; k <= 2; k++) {
        s += '<path class="sk-qovurga" d="M' + f(cx + k * r * 0.38) + " " + f(base) + " Q" + f(cx + k * r * 0.34) + " " + f(base - h * 0.85) + " " + f(cx) + " " + f(base - h * 1.1) + '"/>';
      }
      s += '<path class="sk-gumbaz-2" d="M' + f(cx - r * 0.7) + " " + f(base - h * 0.5) + " Q" + f(cx - r * 0.55) + " " + f(base - h * 0.95) + " " + f(cx - r * 0.1) + " " + f(base - h * 1.02) + " Q" + f(cx - r * 0.4) + " " + f(base - h * 0.8) + " " + f(cx - r * 0.7) + " " + f(base - h * 0.5) + 'Z"/>';
      s += rect(cx - 1, base - h * 1.12 - 12, 2, 12, "sk-bino-2");
      return s;
    }
    function minaret(cx, h, w) {
      var top = GY - h;
      var s = '<path class="sk-bino" d="M' + f(cx - w / 2) + " " + GY + " L" + f(cx - w * 0.4) + " " + f(top) + " H" + f(cx + w * 0.4) + " L" + f(cx + w / 2) + " " + GY + 'Z"/>';
      s += rect(cx - w * 0.4, top + 14, w * 0.8, 4, "sk-naqsh");
      s += rect(cx - w * 0.4, top + 30, w * 0.8, 2.5, "sk-naqsh");
      s += rect(cx - w * 0.62, top - 7, w * 1.24, 7, "sk-bino-2");
      s += '<path class="sk-gumbaz" d="M' + f(cx - w * 0.42) + " " + f(top - 7) + " Q" + f(cx) + " " + f(top - 7 - w * 0.9) + " " + f(cx + w * 0.42) + " " + f(top - 7) + 'Z"/>';
      return s;
    }
    function windows(x0, x1, y, n, skip0, skip1) {
      var s = "", step = (x1 - x0) / n;
      for (var i = 0; i < n; i++) {
        var x = x0 + i * step + step * 0.28;
        if (x + step * 0.44 > skip0 && x < skip1) continue;
        var lit = rnd();
        s += arch(x, y, step * 0.44, 16, "sk-bino-2");
        if (lit > 0.45) {
          s += '<path class="sk-chiroq' + (lit > 0.85 ? " miltilla" : "") + '" style="opacity:' + f(0.35 + lit * 0.55) + (lit > 0.85 ? ";animation-delay:-" + f(lit * 4) + "s" : "") + '" d="M' + f(x + 2) + " " + f(y + 16) + " V" + f(y + 8) + " Q" + f(x + step * 0.22) + " " + f(y + 2) + " " + f(x + step * 0.44 - 2) + " " + f(y + 8) + " V" + f(y + 16) + 'Z"/>';
        }
      }
      return s;
    }
    function madrasa(x, w, o) {
      var fh = o.fh || 64, ph = o.ph || 112, pw = w * (o.pw || 0.36);
      var px = x + (w - pw) / 2;
      var s = "";
      (o.domes || []).forEach(function (d) { s += dome(x + w * d[0], GY - fh, d[1], d[2]); });
      s += rect(x, GY - fh, w, fh, "sk-bino");
      s += rect(x, GY - fh, w, 3, "sk-naqsh");
      s += windows(x + 18, x + w - 18, GY - fh + 12, o.win || 9, px - 6, px + pw + 6);
      s += windows(x + 18, x + w - 18, GY - fh + 36, o.win || 9, px - 6, px + pw + 6);
      s += rect(px, GY - ph, pw, ph, "sk-bino-2");
      s += rect(px + 5, GY - ph + 5, pw - 10, 4, "sk-naqsh");
      s += rect(px + 5, GY - ph + 5, 4, ph - 5, "sk-naqsh");
      s += rect(px + pw - 9, GY - ph + 5, 4, ph - 5, "sk-naqsh");
      s += arch(px + pw * 0.2, GY - ph * 0.78, pw * 0.6, ph * 0.78, "sk-bino");
      s += '<path class="sk-chiroq" style="opacity:.28" d="M' + f(px + pw * 0.3) + " " + GY + " V" + f(GY - ph * 0.42) + " Q" + f(px + pw * 0.5) + " " + f(GY - ph * 0.66) + " " + f(px + pw * 0.7) + " " + f(GY - ph * 0.42) + " V" + GY + 'Z"/>';
      s += minaret(x + 7, o.mh || 136, 14);
      s += minaret(x + w - 7, o.mh || 136, 14);
      return s;
    }
    function houses(x0, x1) {
      var s = "", x = x0;
      while (x < x1) {
        var w = 22 + rnd() * 38, h = 14 + rnd() * 26;
        s += rect(x, GY - h, Math.min(w, x1 - x), h, rnd() > 0.5 ? "sk-bino" : "sk-bino-2");
        if (rnd() > 0.55) s += '<ellipse class="sk-bino" cx="' + f(x + w * 0.5) + '" cy="' + f(GY - h - 16) + '" rx="' + f(4 + rnd() * 3) + '" ry="' + f(18 + rnd() * 10) + '"/>';
        if (rnd() > 0.6) s += rect(x + w * 0.3, GY - h + 6, 4, 5, "sk-chiroq");
        x += w;
      }
      return s;
    }
    out += houses(0, 160) + houses(530, 566) + houses(884, 920) + houses(1290, 1440);
    out += madrasa(160, 370, { mh: 152, domes: [], win: 10 });
    out += madrasa(566, 318, { fh: 58, ph: 96, mh: 78, domes: [[0.2, 34, 42]], win: 8 });
    out += madrasa(920, 370, { domes: [[0.2, 24, 30], [0.8, 24, 30]], win: 10 });
    out += rect(0, GY - 6, 1440, 6, "sk-bino");
    box.innerHTML = out;
  }

  /* ================================================================
     7. YUGURUVCHI FAKTLAR LENTASI
     ================================================================ */
  function initTicker() {
    var track = document.querySelector("[data-ticker]");
    if (!track) return;
    var STAR = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0l2 3.2 3.7-.9-.9 3.7L16 8l-3.2 2 .9 3.7-3.7-.9L8 16l-2-3.2-3.7.9.9-3.7L0 8l3.2-2-.9-3.7 3.7.9z"/></svg>';
    function first(t) { var i = t.indexOf(". "); return i > 0 ? t.slice(0, i + 1) : t; }
    var items = data.facts.slice().sort(function () { return Math.random() - 0.5; }).map(function (x) {
      return '<span class="ticker__item">' + STAR + "<b>" + QZ.catName(x.cat) + "</b>" + first(x.text) + "</span>";
    }).join("");
    track.innerHTML = items + '<span aria-hidden="true" style="display:contents">' + items + "</span>";
    requestAnimationFrame(function () {
      var half = track.scrollWidth / 2;
      if (half) track.style.setProperty("--ticker-dur", Math.round(half / 55) + "s");
    });
  }

  /* ================================================================
     8. SCROLL BILAN PAYDO BO‘LISH
     ================================================================ */
  function initReveal() {
    if (reduced || !("IntersectionObserver" in window)) return;
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-reveal], .tcard"));
    var vh = window.innerHeight;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        el.classList.remove("rv-wait");
        el.classList.add("rv-in");
        el.addEventListener("animationend", function done(ev) {
          if (ev.target !== el) return;
          el.classList.remove("rv-in");
          el.removeEventListener("animationend", done);
        });
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el, i) {
      if (el.getBoundingClientRect().top < vh * 0.94) return; /* birinchi ekrandagilar darhol ko‘rinadi */
      var col = el.classList.contains("tcard") ? Array.prototype.indexOf.call(el.parentNode.children, el) % 3 : (el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) % 4 : 0);
      el.style.setProperty("--rv-delay", (col * 0.09).toFixed(2) + "s");
      el.classList.add("rv-wait");
      io.observe(el);
    });
  }

  /* ================================================================ */
  initSky();
  initSkyline();
  buildAstrolabe();
  initAstroMotion();
  initTicker();
  initFacts();
  renderChips();
  renderTopics("all");
  initTilt();
  initCounters();
  initReveal();
})();
