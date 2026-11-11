// soulsensis.com: what moves on a page as it is read (10 Nov 2026, docs/specs/site-home-logic.md; 11 Nov: the journal
// keeps its column and the motion comes back inside it). One file for every page except Ask, which runs its own scene.
// 1. a thin crimson line across the top fills as the page is read;
// 2. his own lines light as they are reached: [data-lit] word by word, [data-lit="lines"] child by child;
// 3. the logo's thin geometry draws itself: svg[data-draw] with the scroll, svg[data-draw="load"] once as the page opens;
//    svg[data-turn] and the line art in a page's head turn slowly with the scroll;
// 4. on a reading page the blocks after the essay light gently as they arrive. The essay's own text never waits.
// Nothing is ever hidden to be revealed (11 Nov 2026, the independent review: rows that rose in as they arrived left
// blank blocks on a fast flick): a line that waits is dim and readable, a line that has lit stays lit.
// Enhancement only: with reduced motion or no script, the page is the same page, all there and still.
(function () {
  var d = document, root = d.documentElement;
  try { if (matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]still/.test(location.search)) return; } catch (e) { return; }
  if (!("requestAnimationFrame" in window)) return;

  var st = d.createElement("style");
  st.textContent = ".readline{position:fixed;left:0;top:0;height:2px;width:100%;background:#E63946;transform-origin:0 50%;transform:scaleX(0);z-index:60;pointer-events:none}" +
    ".lw{opacity:.3;transition:opacity .5s ease}.lb{opacity:.42;transition:opacity .7s ease}.lw.lit,.lb.lit{opacity:1}";
  d.head.appendChild(st);

  var all = function (sel, el) { return [].slice.call((el || d).querySelectorAll(sel)); };
  var clamp = function (x) { return Math.min(1, Math.max(0, x)); };
  var ease = function (t) { return t * t * (3 - 2 * t); };

  var bar = d.createElement("div"); bar.className = "readline"; bar.setAttribute("aria-hidden", "true"); d.body.appendChild(bar);
  var turns = all("header .art svg, .solo .art svg, main > .art svg, svg[data-turn]");

  // lines that light: each group is a list of units lit in order as the group passes up the screen
  var groups = all("[data-lit]").map(function (el) {
    var units;
    if (el.getAttribute("data-lit") === "lines") { units = [].slice.call(el.children); units.forEach(function (u) { u.classList.add("lb"); }); }
    else {
      var words = el.textContent.split(/\s+/).filter(Boolean); el.textContent = "";
      units = words.map(function (w, i) { var s = d.createElement("span"); s.className = "lw"; s.textContent = w; if (i) el.appendChild(d.createTextNode(" ")); el.appendChild(s); return s; });
    }
    return { el: el, units: units, n: 0 };
  }).concat(all(".askcard, nav.next, .video-wrap.after").map(function (el) { el.classList.add("lb"); return { el: el, units: [el], n: 0 }; }));

  // geometry that draws: every stroked circle is a line of length 1, let out as the drawing passes up the screen
  var draws = all("svg[data-draw]").map(function (svg) {
    var cs = all("circle", svg).filter(function (c) { return (c.getAttribute("fill") || c.parentNode.getAttribute("fill") || (c.parentNode.parentNode.getAttribute && c.parentNode.parentNode.getAttribute("fill"))) === "none"; });
    cs.forEach(function (c) { c.setAttribute("pathLength", "1"); c.style.strokeDasharray = "1"; });
    return { svg: svg, cs: cs, load: svg.getAttribute("data-draw") === "load", t0: 0 };
  });
  function draw(g, p) {
    var n = g.cs.length;
    g.cs.forEach(function (c, i) { var o = 1 - ease(clamp(p * 1.7 - .7 * i / Math.max(1, n - 1))); c.style.strokeDashoffset = o.toFixed(4); c.style.visibility = o > .999 ? "hidden" : ""; });
  }
  function opening(now) {          // the head's drawing lets itself out once, in a second and a half; a tab that is not looked at is simply drawn
    var busy = false;
    draws.forEach(function (g) { if (!g.load || g.done) return; if (!g.t0) g.t0 = now; var p = d.hidden ? 1 : (now - g.t0) / 1600; draw(g, p); if (p >= 1) g.done = true; else busy = true; });
    if (busy) requestAnimationFrame(opening);
  }

  var ticking = false;
  function frame() {
    ticking = false;
    var vh = innerHeight, max = root.scrollHeight - vh, y = window.pageYOffset || 0;
    bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ")";
    turns.forEach(function (s) { s.style.transform = "rotate(" + (y * .04).toFixed(2) + "deg)"; });
    groups.forEach(function (g) {
      if (g.n >= g.units.length) return;
      var r = g.el.getBoundingClientRect(); if (r.top > vh) return;
      var n = Math.ceil(clamp((vh * .86 - r.top) / (r.height + vh * .3)) * g.units.length);
      if (max - y < 4) n = g.units.length;                                   // the foot of the page: nothing is left waiting
      for (; g.n < n; g.n++) g.units[g.n].classList.add("lit");
    });
    draws.forEach(function (g) {
      if (g.load) return;
      var r = g.svg.getBoundingClientRect(); if (r.bottom < -vh * .5 || r.top > vh * 1.5) return;
      draw(g, clamp((vh * .96 - r.top) / (vh * .5 + r.height * .5)));
    });
  }
  function ask() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener("scroll", ask, { passive: true }); addEventListener("resize", ask); addEventListener("load", ask); frame();
  draws.forEach(function (g) { if (g.load) draw(g, 0); });
  requestAnimationFrame(opening);
  setTimeout(function () { draws.forEach(function (g) { if (g.load && !g.done) { g.done = true; draw(g, 1); } }); }, 2600);   // where no frame is drawn (a tab behind another), the logo is simply whole
})();
