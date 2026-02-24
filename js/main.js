/* ═══════════════════════════════════════
   main.js — Scroll reveals & init
   ═══════════════════════════════════════ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Scroll reveal observer ──
function initReveals() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('is-visible');
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .stagger').forEach(el => obs.observe(el));
}

// ── Visibility observer for canvases (pause when off-screen) ──
function observeCanvas(canvas, onVisible, onHidden) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) onVisible();
      else onHidden();
    });
  }, { threshold: 0.05 });
  obs.observe(canvas);
}

// ── Nav: collapses to hamburger when scrolled past hero ──
function initNav() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const hamburger = nav.querySelector('.nav-hamburger');
  const heroSection = document.querySelector('.hero');
  const threshold = heroSection ? heroSection.offsetHeight * 0.5 : 300;

  // Toggle collapsed state based on scroll position
  function updateNav() {
    const y = window.scrollY;
    if (y > threshold) {
      nav.classList.add('nav-collapsed');
    } else {
      nav.classList.remove('nav-collapsed');
      nav.classList.remove('nav-open'); // close menu when scrolling back up
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav(); // initial check

  // Hamburger toggle
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('nav-open');
    });
  }

  // Close menu when clicking a link
  nav.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav-open');
    });
  });

  // Close menu on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
      nav.classList.remove('nav-open');
    }
  });
}

// ── Boot ──
document.addEventListener('DOMContentLoaded', () => {
  initReveals();
  initNav();
});

export { observeCanvas, prefersReducedMotion };
