/* =============================================
   HARMONY DERNEĞİ — SCRIPT.JS
============================================= */

// ── Helpers ──────────────────────────────────────────────────────────────────
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── Navbar scroll effect ──────────────────────────────────────────────────────
(function initNavbar() {
  const navbar = qs('#navbar');
  const bttBtn = qs('#back-to-top-btn');
  
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    if (bttBtn) {
      bttBtn.classList.toggle('visible', window.scrollY > 500);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ── Hamburger menu ────────────────────────────────────────────────────────────
(function initHamburger() {
  const btn   = qs('#hamburger-btn');
  const links = qs('#nav-links');
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    links.classList.toggle('open');
  });
  qsa('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('open');
      links.classList.remove('open');
    });
  });
})();

// ── AOS – minimal Intersection Observer ──────────────────────────────────────
(function initAOS() {
  const elements = qsa('[data-aos]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add a tiny delay based on data-aos-delay if it exists
        const delay = entry.target.dataset.aosDelay || 0;
        setTimeout(() => {
          entry.target.classList.add('aos-visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.1, 
    rootMargin: '0px 0px -50px 0px' 
  });
  
  elements.forEach(el => observer.observe(el));
})();

// ── Counter animation ─────────────────────────────────────────────────────────
(function initCounters() {
  const counters = qsa('.hs-num[data-count]');
  let started = false;

  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('tr-TR');
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target.toLocaleString('tr-TR') + (target >= 100 ? '+' : '');
    };
    requestAnimationFrame(update);
  }

  const heroBar = qs('.hero-bottom-bar');
  if (!heroBar) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        counters.forEach(el => animateCount(el));
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });
  observer.observe(heroBar);
})();

// ── Gallery Lightbox ──────────────────────────────────────────────────────────
(function initLightbox() {
  const lightbox   = qs('#lightbox');
  const lbImg      = qs('#lightbox-img');
  const lbCaption  = qs('#lightbox-caption');
  const btnClose   = qs('#lightbox-close-btn');
  const btnPrev    = qs('#lightbox-prev-btn');
  const btnNext    = qs('#lightbox-next-btn');

  const items = qsa('.gallery-item');
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    const item = items[index];
    const img  = item.querySelector('img');
    const cap  = item.querySelector('.gallery-overlay span');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = cap ? cap.textContent : '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navigate(dir) {
    currentIndex = (currentIndex + dir + items.length) % items.length;
    openLightbox(currentIndex);
  }

  items.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
  btnClose.addEventListener('click', closeLightbox);
  btnPrev.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
  btnNext.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
})();

// ── Contact Form ─────────────────────────────────────────────────────────────
(function initContactForm() {
  const form    = qs('#contact-form');
  const success = qs('#c-success');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
      id: Date.now(),
      name: qs('#c-name').value.trim(),
      phone: qs('#c-phone').value.trim(),
      email: qs('#c-email').value.trim(),
      subject: qs('#c-subject').selectedOptions[0].text,
      message: qs('#c-message').value.trim(),
      date: new Date().toLocaleDateString('tr-TR'),
      status: 'Beklemede'
    };

    // Save to localStorage
    const existingMessages = JSON.parse(localStorage.getItem('kds_messages') || '[]');
    existingMessages.unshift(formData);
    localStorage.setItem('kds_messages', JSON.stringify(existingMessages));

    // UI Feedback
    success.classList.add('visible');
    form.reset();
    setTimeout(() => success.classList.remove('visible'), 5000);
  });
})();

// ── Newsletter ────────────────────────────────────────────────────────────────
(function initNewsletter() {
  const form    = qs('#newsletter-form');
  const success = qs('#newsletter-success');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = qs('#newsletter-email').value.trim();
    if (!email) return;
    success.classList.add('visible');
    form.reset();
    setTimeout(() => success.classList.remove('visible'), 5000);
  });
})();

// ── Form shake helper ─────────────────────────────────────────────────────────
function shakeForm(el) {
  el.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(-8px)' },
    { transform: 'translateX(8px)' },
    { transform: 'translateX(-6px)' },
    { transform: 'translateX(6px)' },
    { transform: 'translateX(0)' }
  ], { duration: 400, easing: 'ease-out' });
}

// ── Back to Top ───────────────────────────────────────────────────────────────
const backToTop = qs('#back-to-top-btn');
backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Smooth scroll for all anchor links ───────────────────────────────────────
(function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = qs(href);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

// ── Active nav link highlight on scroll ──────────────────────────────────────
(function initActiveNav() {
  const sections = qsa('section[id]');
  const navLinks = qsa('.nav-link[href^="#"]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.style.fontWeight = link.getAttribute('href') === `#${id}` ? '700' : '';
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
})();

// ── Parallax hero bg ──────────────────────────────────────────────────────────
(function initParallax() {
  const heroBg = qs('.hero-bg');
  if (!heroBg) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroBg.style.transform = `scale(1.05) translateY(${y * 0.25}px)`;
  }, { passive: true });
})();

console.log('%c🤝 Kadınların Sesi Derneği — Birlikte Daha Güçlüyüz', 'color:#b8863a;font-size:14px;font-weight:bold;');
