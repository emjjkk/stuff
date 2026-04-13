/* ========================================
   VISIT RWANDA — Interactive Script
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  const intro = document.getElementById('intro');
  const skipBtn = document.getElementById('skip-intro');
  const mainContent = document.getElementById('main-content');
  const navbar = document.getElementById('navbar');
  const heroImg = document.querySelector('.hero-img');
  const scrollProgress = document.getElementById('scroll-progress');
  const menuToggle = document.getElementById('menu-toggle');
  const menuClose = document.getElementById('menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  const customCursor = document.getElementById('custom-cursor');
  const cursorDot = customCursor ? customCursor.querySelector('.cursor-dot') : null;
  const cursorRing = customCursor ? customCursor.querySelector('.cursor-ring') : null;
  const mapPins = Array.from(document.querySelectorAll('.map-pin'));
  const mapPlace = document.getElementById('map-place');
  const mapText = document.getElementById('map-text');

  let introComplete = false;
  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;
  let ringX = 0;
  let ringY = 0;
  let countersStarted = false;

  function createRevealStrips() {
    const stripCount = 10;
    const width = Math.ceil(window.innerWidth / stripCount);
    const strips = [];

    for (let i = 0; i < stripCount; i += 1) {
      const strip = document.createElement('div');
      strip.className = 'reveal-strip';
      strip.style.left = `${i * width}px`;
      strip.style.width = `${width + 2}px`;
      strip.style.transitionDelay = `${i * 90}ms`;
      document.body.appendChild(strip);
      strips.push(strip);
    }

    requestAnimationFrame(() => {
      strips.forEach((strip) => strip.classList.add('animate'));
    });

    window.setTimeout(() => {
      strips.forEach((strip) => strip.remove());
    }, 1500);
  }

  function revealMain() {
    mainContent.style.transition = 'opacity 0.6s ease';
    mainContent.style.opacity = '1';
    navbar.classList.remove('opacity-0', 'pointer-events-none');
    navbar.classList.add('at-top');

    const heroFades = document.querySelectorAll('.hero-fade');
    heroFades.forEach((el) => {
      const delay = Number.parseFloat(el.style.animationDelay || '0') * 1000;
      window.setTimeout(() => el.classList.add('animate'), delay);
    });

    if (heroImg) {
      window.setTimeout(() => heroImg.classList.add('zoomed'), 150);
    }
  }

  function completeIntro() {
    if (introComplete) {
      return;
    }
    introComplete = true;

    intro.classList.add('fade-out');

    window.setTimeout(() => {
      createRevealStrips();
      revealMain();
      intro.style.transition = 'opacity 0.5s ease';
      intro.style.opacity = '0';
      window.setTimeout(() => {
        intro.style.display = 'none';
      }, 520);
    }, 520);
  }

  skipBtn.addEventListener('click', completeIntro);
  window.setTimeout(completeIntro, 4600);

  function updateScrollProgress() {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = total > 0 ? window.scrollY / total : 0;
    scrollProgress.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`;
  }

  function updateNavbarState() {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
      navbar.classList.remove('at-top');
    } else {
      navbar.classList.remove('scrolled');
      navbar.classList.add('at-top');
    }
  }

  function animateParallax() {
    const p = document.querySelector('.parallax-img');
    if (!p) {
      return;
    }
    const rect = p.closest('section').getBoundingClientRect();
    const sectionCenter = rect.top + rect.height / 2;
    const viewportCenter = window.innerHeight / 2;
    const delta = (sectionCenter - viewportCenter) * -0.12;
    p.style.transform = `translate3d(0, ${delta}px, 0)`;
  }

  function animateHorizontalJournal() {
    const section = document.querySelector('.horizontal-section');
    const content = document.querySelector('.horizontal-content');
    if (!section || !content) {
      return;
    }

    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight;
    const progress = Math.min(Math.max(-rect.top / (sectionHeight - window.innerHeight), 0), 1);
    const travel = Math.max(content.scrollWidth - window.innerWidth + 48, 0);
    const offsetX = travel * progress;
    content.style.transform = `translate3d(-${offsetX}px, 0, 0)`;

    const cards = document.querySelectorAll('.journal-card');
    cards.forEach((card, index) => {
      const threshold = index * 0.12;
      if (progress > threshold) {
        card.classList.add('visible');
      }
    });
  }

  function counterUp(el) {
    const target = Number.parseInt(el.dataset.target || '0', 10);
    const duration = 1400;
    const start = performance.now();

    const tick = (t) => {
      const n = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - n, 3);
      el.textContent = `${Math.floor(target * eased).toLocaleString('en-US')}`;
      if (n < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add('revealed');

        if (entry.target.id === 'wildlife' && !countersStarted) {
          countersStarted = true;
          document.querySelectorAll('.counter').forEach(counterUp);
        }

        if (entry.target.classList.contains('annotation-anchor')) {
          entry.target.classList.add('annotated');
        }
      });
    },
    { threshold: 0.25, rootMargin: '0px 0px -8% 0px' }
  );

  document.querySelectorAll('.reveal-up').forEach((el) => revealObserver.observe(el));
  const wildlifeSection = document.getElementById('wildlife');
  if (wildlifeSection) {
    revealObserver.observe(wildlifeSection);
  }

  function addSectionAnnotations() {
    const anchors = [
      { id: 'hills', text: 'look here', x: 8, y: 18, type: 'arrow' },
      { id: 'culture', text: 'note the rhythm', x: 78, y: 14, type: 'circle' },
      { id: 'kigali', text: 'city pulse', x: 12, y: 84, type: 'underline' }
    ];

    anchors.forEach((item) => {
      const section = document.getElementById(item.id);
      if (!section) {
        return;
      }

      section.classList.add('annotation-anchor');
      const note = document.createElement('div');
      note.className = `scroll-annotation ${item.type}`;
      note.style.left = `${item.x}%`;
      note.style.top = `${item.y}%`;
      if (item.type === 'circle') {
        note.innerHTML = `
          <svg viewBox="0 0 180 70" aria-hidden="true">
            <path d="M22 36 C28 10, 70 8, 118 12 C157 14, 171 34, 158 52 C144 66, 106 66, 68 61 C31 57, 16 48, 22 36" />
          </svg>
          <span>${item.text}</span>
        `;
      } else if (item.type === 'underline') {
        note.innerHTML = `
          <svg viewBox="0 0 190 60" aria-hidden="true">
            <path d="M14 38 C44 47, 96 48, 172 36" />
          </svg>
          <span>${item.text}</span>
        `;
      } else {
        note.innerHTML = `
          <svg viewBox="0 0 180 60" aria-hidden="true">
            <path d="M8 35 C35 12, 78 12, 160 30" />
            <path d="M148 22 L160 30 L145 38" />
          </svg>
          <span>${item.text}</span>
        `;
      }
      section.appendChild(note);
      revealObserver.observe(section);
    });
  }

  function updateMapNote(pin) {
    const place = pin.dataset.place || '';
    const note = pin.dataset.note || '';
    mapPlace.textContent = place;
    mapText.textContent = note;

    mapPins.forEach((p) => p.classList.remove('active'));
    pin.classList.add('active');
  }

  if (mapPins.length > 0 && mapPlace && mapText) {
    mapPins.forEach((pin) => {
      pin.addEventListener('mouseenter', () => updateMapNote(pin));
      pin.addEventListener('focus', () => updateMapNote(pin));
      pin.addEventListener('click', () => updateMapNote(pin));
    });
    updateMapNote(mapPins[0]);
  }

  if (menuToggle && menuClose && mobileMenu) {
    const closeMenu = () => {
      mobileMenu.classList.add('translate-x-full');
      mobileMenu.setAttribute('aria-hidden', 'true');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.focus();
    };

    const openMenu = () => {
      mobileMenu.classList.remove('translate-x-full');
      mobileMenu.setAttribute('aria-hidden', 'false');
      menuToggle.setAttribute('aria-expanded', 'true');
      const firstLink = mobileMenu.querySelector('a');
      if (firstLink) {
        firstLink.focus();
      }
    };

    menuToggle.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !mobileMenu.classList.contains('translate-x-full')) {
        closeMenu();
      }
    });
  }

  if (window.matchMedia('(pointer: fine)').matches && customCursor && cursorDot && cursorRing) {
    document.addEventListener('mousemove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    });

    const interactives = document.querySelectorAll('a, button, .highlight-card, .map-pin');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', () => customCursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => customCursor.classList.remove('hovering'));
    });

    const animateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.3;
      cursorY += (mouseY - cursorY) * 0.3;
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      cursorDot.style.transform = `translate(${cursorX - 3}px, ${cursorY - 3}px)`;
      cursorRing.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px)`;
      requestAnimationFrame(animateCursor);
    };

    requestAnimationFrame(animateCursor);
  }

  document.querySelectorAll('.magnetic-btn').forEach((btn) => {
    btn.addEventListener('mousemove', (event) => {
      const rect = btn.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });

  addSectionAnnotations();

  const onScroll = () => {
    updateScrollProgress();
    updateNavbarState();
    animateParallax();
    animateHorizontalJournal();
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', animateHorizontalJournal);
});