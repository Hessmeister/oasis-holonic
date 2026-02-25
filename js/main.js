/* ═══════════════════════════════════════
   main.js — Scroll reveals, canvas observe, nav
   ═══════════════════════════════════════ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Scroll-triggered reveals ──
function initReveals() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('is-visible');
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .stagger').forEach(el => obs.observe(el));
}

// ── Canvas visibility observer (play/pause animations) ──
function observeCanvas(canvas, onVisible, onHidden) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (onVisible) onVisible();
      } else {
        if (onHidden) onHidden();
      }
    });
  }, { threshold: 0.05 });
  obs.observe(canvas);
}

// ── Nav: scroll to sections + collapse on scroll ──
function initNav() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const hamburger = nav.querySelector('.nav-hamburger');

  // Smooth scroll nav links
  nav.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      nav.classList.remove('nav-open');
    });
  });

  // Hamburger toggle
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('nav-open');
    });
  }

  // Close menu on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
      nav.classList.remove('nav-open');
    }
  });

  // Close menu when clicking a link
  nav.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav-open');
    });
  });

  // Collapse nav on scroll
  const heroSection = document.querySelector('.hero');
  const collapseThreshold = heroSection ? heroSection.offsetHeight * 0.5 : 300;

  function updateNav() {
    const y = window.scrollY;
    if (y > collapseThreshold) {
      nav.classList.add('nav-collapsed');
    } else {
      nav.classList.remove('nav-collapsed');
      nav.classList.remove('nav-open');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
}

// ── Build section: idea submission ──
function initBuildChat() {
  const input = document.getElementById('buildInput');
  const submit = document.getElementById('buildSubmit');
  const confirm = document.getElementById('buildConfirm');
  const chips = document.querySelectorAll('.build-chip');

  if (!input || !submit) return;

  // Auto-resize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  // Submit handler
  function submitIdea() {
    const text = input.value.trim();
    if (!text) return;

    // Store in localStorage (swap for API call later)
    const ideas = JSON.parse(localStorage.getItem('oasis-ideas') || '[]');
    ideas.push({ text, timestamp: new Date().toISOString() });
    localStorage.setItem('oasis-ideas', JSON.stringify(ideas));

    // Show confirmation
    input.value = '';
    input.style.height = 'auto';
    confirm.hidden = false;

    // Hide after a few seconds
    setTimeout(() => { confirm.hidden = true; }, 4000);
  }

  submit.addEventListener('click', submitIdea);

  // Submit on Enter (Shift+Enter for newline)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitIdea();
    }
  });

  // Chips fill the input
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.textContent;
      input.focus();
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
  });
}

// ── Boot ──
function _init_main() {
  initNav();
  initBuildChat();
  if (!prefersReducedMotion) {
    initReveals();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _init_main);
} else {
  _init_main();
}

export { observeCanvas, prefersReducedMotion };
