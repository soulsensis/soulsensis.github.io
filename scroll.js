// soulsensis.com: every page moves with the scroll (10 Nov 2026, docs/specs/site-home-logic.md).
// One file for every page except the home and book pages, which run their own scenes.
// 1. a thin crimson line across the top fills as the page is read;
// 2. the line art in a page's head turns slowly with the scroll;
// 3. blocks below the fold rise in once as they arrive.
// Enhancement only: with reduced motion, no observer or no script, the page is simply all there.
(function () {
  var d = document, root = d.documentElement;
  try { if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; } catch (e) { return; }
  if (!("IntersectionObserver" in window) || !("requestAnimationFrame" in window)) return;

  var st = d.createElement("style");
  st.textContent = ".readline{position:fixed;left:0;top:0;height:2px;width:100%;background:#E63946;transform-origin:0 50%;transform:scaleX(0);z-index:60;pointer-events:none}" +
    ".sr{opacity:0;transform:translateY(16px)}" +
    ".sr.in{opacity:1;transform:none;transition:opacity .6s ease,transform .6s cubic-bezier(.2,.8,.2,1)}";
  d.head.appendChild(st);

  var bar = d.createElement("div"); bar.className = "readline"; bar.setAttribute("aria-hidden", "true"); d.body.appendChild(bar);
  var art = d.querySelector("header .art svg, .solo .art svg, main > .art svg");
  var ticking = false;
  function frame() {
    ticking = false;
    var max = root.scrollHeight - innerHeight, y = window.pageYOffset || 0;
    bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ")";
    if (art) art.style.transform = "rotate(" + (y * .04).toFixed(2) + "deg)";
  }
  function ask() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener("scroll", ask, { passive: true }); addEventListener("resize", ask); frame();

  // rise: only what is below the fold is hidden, and only after this script has run; reading text itself never waits
  var sel = ".row, nav.next a, .related a, .inbook, .bookband .wrap > *, .topic-grid > div:first-child, figure blockquote, " +
            ".card, .tile, .facts li, .book-card, main > section h2, main details, article.legal h2, .askq, .orn";
  var els = [].slice.call(d.querySelectorAll(sel)).filter(function (el) { return el.getBoundingClientRect().top > innerHeight * .92; });
  var io = new IntersectionObserver(function (es) {
    var k = 0;
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target; io.unobserve(el);
      el.style.transitionDelay = Math.min(k++, 5) * 70 + "ms"; el.classList.add("in");
      setTimeout(function () { el.classList.remove("sr", "in"); el.style.transitionDelay = ""; }, 1300);
    });
  }, { threshold: 0, rootMargin: "0px 0px -5% 0px" });
  els.forEach(function (el) { el.classList.add("sr"); io.observe(el); });
  // a filter that hides and shows rows (the essays page) must never leave one invisible
  addEventListener("hashchange", function () { els.forEach(function (el) { if (el.getBoundingClientRect().top < innerHeight) el.classList.add("in"); }); });
})();
