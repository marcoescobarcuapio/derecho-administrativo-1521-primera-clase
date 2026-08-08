(function () {
  "use strict";
  const root = document.getElementById("contenido");
  if (!root || typeof window.impress !== "function") return;

  const deck = window.impress("contenido");
  deck.init();
  const steps = deck.steps ? deck.steps() : [];
  const previous = document.getElementById("previous");
  const next = document.getElementById("next");
  const mapToggle = document.getElementById("map-toggle");
  const status = document.getElementById("live-status");
  const progressText = document.getElementById("progress-text");
  const progressFill = document.getElementById("progress-fill");
  let mapVisible = false;

  function updateHash(step) {
    if (!step) return;
    history.replaceState(null, "", "#" + step.id);
  }

  function announce(step) {
    if (!step) return;
    const heading = step.querySelector("h1, h2");
    const position = deck.index() + 1;
    progressText.textContent = position + " / " + steps.length;
    progressFill.style.width = ((position / steps.length) * 100) + "%";
    status.textContent = "Diapositiva " + position + " de " + steps.length + ": " + (heading ? heading.textContent : step.id);
  }

  function go(target, moveFocus) {
    mapVisible = false;
    document.body.classList.remove("map-view");
    mapToggle.setAttribute("aria-pressed", "false");
    const step = deck.goto(target);
    if (!step) return;
    window.scrollTo(0, 0);
    updateHash(step);
    announce(step);
    if (moveFocus) step.focus({preventScroll: true});
  }

  function move(delta) {
    go(Math.max(0, Math.min(steps.length - 1, deck.index() + delta)), true);
  }

  function toggleMap(force) {
    mapVisible = typeof force === "boolean" ? force : !mapVisible;
    document.body.classList.toggle("map-view", mapVisible);
    mapToggle.setAttribute("aria-pressed", String(mapVisible));
    status.textContent = mapVisible ? "Vista general activada" : "Vista general cerrada";
    if (!mapVisible) go(deck.index(), true);
  }

  previous.addEventListener("click", function () { move(-1); });
  next.addEventListener("click", function () { move(1); });
  mapToggle.addEventListener("click", function () { toggleMap(); });

  document.addEventListener("click", function (event) {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(link.getAttribute("href").slice(1));
    if (target && target.classList.contains("step")) {
      event.preventDefault();
      go(target, true);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    const forward = ["ArrowRight", "ArrowDown", "PageDown"];
    const backward = ["ArrowLeft", "ArrowUp", "PageUp"];
    if (forward.includes(event.key)) { event.preventDefault(); move(1); }
    else if (backward.includes(event.key)) { event.preventDefault(); move(-1); }
    else if (event.key === "Home") { event.preventDefault(); go(0, true); }
    else if (event.key === "End") { event.preventDefault(); go(steps.length - 1, true); }
    else if (event.key === "Escape") { event.preventDefault(); toggleMap(false); }
    else if (event.key.toLowerCase() === "m") { event.preventDefault(); toggleMap(); }
  });

  const initial = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
  go(initial && initial.classList.contains("step") ? initial : 0, false);
  window.scrollTo(0, 0);
})();
