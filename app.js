/* Cloud Agent IQ — app.js
 * Lightweight enhancements: scroll-state nav, reveal-on-scroll, count-up metrics.
 * No framework. No dependencies.
 */

(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* 1. Nav scroll state                                                 */
  /* ------------------------------------------------------------------ */
  const nav = document.getElementById("nav");
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 24) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------------------------------------------ */
  /* 1b. Mobile menu toggle                                              */
  /* ------------------------------------------------------------------ */
  const toggle = document.querySelector(".nav-toggle");
  const drawer = document.getElementById("mobile-menu");
  if (toggle && drawer) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) {
        drawer.removeAttribute("hidden");
        drawer.setAttribute("data-open", "true");
        document.body.style.overflow = "hidden";
      } else {
        drawer.setAttribute("data-open", "false");
        setTimeout(() => drawer.setAttribute("hidden", ""), 200);
        document.body.style.overflow = "";
      }
    };
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      setOpen(!isOpen);
    });
    // Close on link click
    drawer.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setOpen(false));
    });
    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
      }
    });
    // Close if resized above breakpoint
    const mq = window.matchMedia("(min-width: 961px)");
    mq.addEventListener("change", (e) => {
      if (e.matches) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 2. Reveal-on-scroll                                                 */
  /* Targets section headings and major blocks.                          */
  /* ------------------------------------------------------------------ */
  const revealTargets = document.querySelectorAll(
    ".section-head, .agent-card, .case-card, .tier, .faq-item, .metric, .step, .arch-diagram, .security-grid, .cta-inner, .statement-title, .statement-grid p"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
  );
  revealTargets.forEach((el) => io.observe(el));

  /* ------------------------------------------------------------------ */
  /* 3. Count-up metrics                                                 */
  /* ------------------------------------------------------------------ */
  const counters = document.querySelectorAll(".metric-num");
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count || el.textContent);
        const decimals = (el.dataset.count || "").includes(".") ? 1 : 0;
        animateCount(el, target, decimals);
        counterIO.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => counterIO.observe(el));

  function animateCount(el, target, decimals) {
    const duration = 1400;
    const start = performance.now();
    const from = 0;
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const value = from + (target - from) * eased;
      el.textContent = decimals
        ? value.toFixed(decimals)
        : Math.round(value).toString();
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------ */
  /* 4. Demo CTA handler (placeholder — no real form yet)                */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll('a[href="#demo"], a[href="#book"], a[href="#trial"], a[href="#login"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      // Only intercept the explicit "demo"-action links, not the anchor scroll to #demo section
      if (a.getAttribute("href") === "#demo") return; // let it scroll
      e.preventDefault();
      const msg = a.getAttribute("href") === "#login"
        ? "Login is coming online soon.\n\nFor early access, book a demo from the top-right."
        : "Thanks for the interest in Cloud Agent IQ.\n\nWe'll wire up the booking flow shortly — for now, send us an email at hello@cloudagentiq.com and we'll get you on a demo this week.";
      alert(msg);
    });
  });

  /* ------------------------------------------------------------------ */
  /* 5. Live panel "ticker" — occasionally rotate agent action text      */
  /* ------------------------------------------------------------------ */
  const actionFeed = {
    0: [
      "Enriched 214 leads from Clearbit → HubSpot",
      "Scored 88 inbound leads · booked 6 meetings",
      "Sent 430 personalized outbounds · 12% reply rate",
      "Reclassified 1,100 stale opps in pipeline",
    ],
    1: [
      "Reconciled 1,402 transactions · flagged 3",
      "Closed April books · variance under 0.4%",
      "Chased 28 overdue invoices · collected $94k",
      "Posted 340 journal entries · tied out",
    ],
    2: [
      "Resolved 38 tier-1 tickets · CSAT 96%",
      "Escalated 2 tickets to senior engineer",
      "Answered 212 in-app questions in <40s",
      "Updated 14 help-center articles from FAQs",
    ],
    3: [
      "Scheduled 62 shifts · sent 4 escalations",
      "Restocked 8 SKUs hitting reorder threshold",
      "Reviewed 19 vendor SLAs · 2 breaches flagged",
      "Drafted weekly ops digest for leadership",
    ],
    4: [
      "Compiled weekly exec briefing (7 sources)",
      "Answered 'why did churn spike?' · attached SQL",
      "Built revenue cohort view · shared to #leadership",
      "Detected anomaly in signup funnel · day 3",
    ],
  };
  const rows = document.querySelectorAll(".agent-row .agent-action");
  if (rows.length) {
    const rotate = () => {
      rows.forEach((row, i) => {
        const feed = actionFeed[i];
        if (!feed) return;
        const current = row.textContent.trim();
        const idx = feed.indexOf(current);
        const next = feed[(idx + 1) % feed.length];
        row.style.opacity = "0";
        row.style.transform = "translateY(4px)";
        row.style.transition = "opacity 0.25s ease, transform 0.25s ease";
        setTimeout(() => {
          row.textContent = next;
          row.style.opacity = "1";
          row.style.transform = "translateY(0)";
        }, 280);
      });
    };
    // Start after initial render settles
    setTimeout(() => setInterval(rotate, 4200), 3000);
  }

})();
