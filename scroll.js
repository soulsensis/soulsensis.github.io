// soulsensis.com: the one moving thing on a page (10 Nov 2026, docs/specs/site-home-logic.md; 11 Nov: a journal).
// One file for every page except the book and Ask pages, which run their own scenes.
// 1. a thin crimson line across the top fills as the page is read;
// 2. the line art in a page's head, where a page shows it, turns slowly with the scroll.
// Nothing is ever hidden to be revealed (11 Nov 2026, the independent review: rows that rose in as they arrived left
// blank blocks on a fast flick, and a journal page is simply all there).
// Enhancement only: with reduced motion or no script, the page is the same page without the line.
(function () {
  var d = document, root = d.documentElement;
  try { if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; } catch (e) { return; }
  if (!("requestAnimationFrame" in window)) return;

  var st = d.createElement("style");
  st.textContent = ".readline{position:fixed;left:0;top:0;height:2px;width:100%;background:#E63946;transform-origin:0 50%;transform:scaleX(0);z-index:60;pointer-events:none}";
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

})();
