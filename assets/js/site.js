/*
 * The landing page's entrance, ported from the arcs site's React components
 * (HighlightMarkerTitle, HeroCTA, PreviewPanel) to plain GSAP.
 *
 * Highlight marker: each [data-marker] element is split into lines. Every
 * line gets a bar over it that fades in, then scales away to the right while
 * the line's text slides in from the left. Timing comes from the element's
 * data-marker-* attributes; a line's [data-bar-color] tints its bar.
 *
 * With reduced motion asked for, everything is simply shown.
 */
(function () {
  "use strict";

  var root = document.documentElement;
  // Running after all - the head's give-up timer isn't needed.
  clearTimeout(window.revealFallback);
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var markers = Array.prototype.slice.call(document.querySelectorAll("[data-marker]"));
  var badges = document.querySelector("[data-badges]");
  var preview = document.querySelector("[data-preview]");

  function showAll() {
    root.classList.remove("js");
  }

  if (reduced || !window.gsap || !window.SplitText || !window.ScrollTrigger) {
    showAll();
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);

  var DEFAULT_BAR = "#F7F7FA";

  function num(el, name, fallback) {
    var v = el.getAttribute("data-marker-" + name);
    return v === null || v === "" ? fallback : parseFloat(v);
  }

  function str(el, name, fallback) {
    var v = el.getAttribute("data-marker-" + name);
    return v === null || v === "" ? fallback : v;
  }

  /* Bar inside a clip, so the line itself stays overflow-visible for the slide. */
  function createBar(color) {
    var clip = document.createElement("div");
    clip.className = "highlight-marker-bar-clip";
    clip.style.cssText = "position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1";
    var bar = document.createElement("div");
    bar.className = "highlight-marker-bar";
    bar.style.backgroundColor = color;
    bar.style.transformOrigin = "right center";
    clip.appendChild(bar);
    return { clip: clip, bar: bar };
  }

  /* One inline-block wrapper per line, so transforms reach every glyph in it. */
  function wrapLineText(line) {
    var wrap = document.createElement("span");
    wrap.className = "highlight-marker-line-text";
    wrap.style.display = "inline-block";
    wrap.style.willChange = "transform, opacity";
    while (line.firstChild) wrap.appendChild(line.firstChild);
    line.appendChild(wrap);
    return wrap;
  }

  var after = {
    // HeroCTA: the store badges slide in as the subheading finishes.
    badges: function () {
      if (!badges) return;
      gsap.fromTo(
        badges.children,
        { opacity: 0, x: -18 },
        { opacity: 1, x: 0, duration: 0.6, ease: "back.out(1.2)", stagger: 0.1 }
      );
    },
  };

  function setUpMarker(el) {
    var staggerS = num(el, "stagger", 100) / 1000;
    var barDuration = num(el, "bar-duration", 0.6);
    var barEase = str(el, "bar-ease", "power3.inOut");
    var barFadeIn = num(el, "bar-fade-in", 0.18);
    var fromX = num(el, "from-x", -28);
    var textDuration = num(el, "text-duration", 0.55);
    var textEase = str(el, "text-ease", "power2.out");
    var textOffset = num(el, "text-offset", 0);
    var sectionOffset = num(el, "section", 0);
    var scrollStart = str(el, "scroll-start", "top 90%");
    var then = str(el, "then", "");
    var thenEarly = num(el, "then-early", 0);

    var timeline = null;
    var trigger = null;

    SplitText.create(el, {
      type: "lines",
      linesClass: "highlight-marker-line",
      autoSplit: true,
      deepSlice: false,
      onSplit: function (self) {
        if (timeline) timeline.kill();
        if (trigger) trigger.kill();

        var tl = gsap.timeline({ paused: true });

        self.lines.forEach(function (line, i) {
          gsap.set(line, {
            position: "relative",
            overflow: "visible",
            paddingBottom: "0.12em",
            paddingRight: "0.2em",
            paddingLeft: "0.02em",
          });

          var text = wrapLineText(line);
          var tinted = line.querySelector("[data-bar-color]");
          var color = (tinted && tinted.getAttribute("data-bar-color")) || el.getAttribute("data-bar-color") || DEFAULT_BAR;
          var parts = createBar(color);
          line.appendChild(parts.clip);

          var barStart = i * staggerS;
          gsap.set(parts.bar, { scaleX: 1, opacity: 0 });
          gsap.set(text, { opacity: 0, x: fromX });

          tl.to(parts.bar, { opacity: 1, duration: barFadeIn, ease: "power2.out" }, barStart);
          tl.to(parts.bar, { scaleX: 0, duration: barDuration, ease: barEase }, barStart + barFadeIn);
          tl.to(text, { opacity: 1, x: 0, duration: textDuration, ease: textEase }, barStart + textOffset);
        });

        if (then && after[then]) {
          tl.call(after[then], [], Math.max(0, tl.duration() - thenEarly));
        }

        gsap.set(el, { autoAlpha: 1 });
        timeline = tl;

        trigger = ScrollTrigger.create({
          trigger: el,
          start: scrollStart,
          once: true,
          onEnter: function () {
            if (sectionOffset > 0) gsap.delayedCall(sectionOffset, function () { tl.play(); });
            else tl.play();
          },
        });
      },
    });
  }

  // PreviewPanel: the panel fades up as the phone settles from 0.88 to full size.
  function setUpPreview() {
    if (!preview) return;
    var bg = preview.querySelector("[data-preview-bg]");
    var phone = preview.querySelector("[data-preview-phone]");
    gsap.set(phone, { scale: 0.88, transformOrigin: "50% 50%" });
    gsap
      .timeline({ scrollTrigger: { trigger: preview, start: "top 85%", toggleActions: "play none none none" } })
      .to(bg, { opacity: 1, duration: 0.95, ease: "power3.out" }, 0)
      .to(phone, { scale: 1, duration: 0.95, ease: "power3.out" }, 0);
  }

  // Split only once the web font is in, or the lines would be measured in the fallback.
  document.fonts.ready.then(function () {
    markers.forEach(setUpMarker);
    setUpPreview();
  });
})();
