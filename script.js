/* ============================================================
   LIB TUNEZ – script.js
   ============================================================ */

(function () {
  'use strict';

  /* ── Element references ─────────────────────────────────── */
  const navbar     = document.getElementById('navbar');
  const themeToggle = document.getElementById('themeToggle');
  const toggleIcon  = themeToggle.querySelector('.toggle-icon');
  const hamburger   = document.getElementById('hamburger');
  const navLinks    = document.getElementById('navLinks');
  const html        = document.documentElement;

  /* ── Theme ──────────────────────────────────────────────── */
  const STORAGE_KEY = 'libtunez-theme';
  const DARK  = 'dark';
  const LIGHT = 'light';

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    toggleIcon.textContent = theme === DARK ? '🌙' : '☀️';
    localStorage.setItem(STORAGE_KEY, theme);
  }

  // Load saved theme (fallback: dark)
  const savedTheme = localStorage.getItem(STORAGE_KEY) || DARK;
  applyTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === DARK ? LIGHT : DARK);
  });

  /* ── Navbar scroll behaviour ────────────────────────────── */
  let ticking = false;
  const SCROLL_THRESHOLD = 20;

  function updateNavbar() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    ticking = false;
  }

  // Trigger immediately in case page loads mid-scroll
  updateNavbar();

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  /* ── Mobile hamburger menu ──────────────────────────────── */
  let menuOpen = false;

  function setMenuOpen(state) {
    menuOpen = state;
    navLinks.classList.toggle('open', menuOpen);
    hamburger.setAttribute('aria-expanded', String(menuOpen));

    // Animate the three bars → X
    const bars = hamburger.querySelectorAll('span');
    if (menuOpen) {
      bars[0].style.transform = 'translateY(7px) rotate(45deg)';
      bars[1].style.opacity   = '0';
      bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      bars[0].style.transform = '';
      bars[1].style.opacity   = '';
      bars[2].style.transform = '';
    }
  }

  hamburger.addEventListener('click', () => setMenuOpen(!menuOpen));

  // Close menu on nav-link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (menuOpen && !navbar.contains(e.target)) {
      setMenuOpen(false);
    }
  });

  /* ── Smooth scroll + active link highlighting ───────────── */
  const SECTION_IDS = ['hero', 'about', 'artists', 'features', 'contact'];
  const allNavLinks = document.querySelectorAll('.nav-link');

  // Wire each nav link to smooth-scroll to its section
  allNavLinks.forEach(link => {
    const text = link.textContent.trim().toLowerCase();
    const targetId = text === 'home' ? 'hero' : text;
    link.addEventListener('click', (e) => {
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Highlight link whose section is in view
  const sectionEls = SECTION_IDS.map(id => document.getElementById(id)).filter(Boolean);

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      const label = id === 'hero' ? 'home' : id;
      allNavLinks.forEach(l => {
        l.classList.toggle('active', l.textContent.trim().toLowerCase() === label);
      });
    });
  }, { threshold: 0.35 });

  sectionEls.forEach(el => navObserver.observe(el));

  /* ── Smooth hover ripple on buttons ─────────────────────── */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size   = Math.max(rect.width, rect.height) * 1.6;
      ripple.style.cssText = `
        position:absolute;
        border-radius:50%;
        width:${size}px;height:${size}px;
        top:${e.clientY - rect.top  - size/2}px;
        left:${e.clientX - rect.left - size/2}px;
        background:rgba(255,255,255,0.08);
        pointer-events:none;
        transform:scale(0);
        transition:transform 0.5s ease, opacity 0.5s ease;
      `;
      this.style.position = 'relative';
      this.style.overflow  = 'hidden';
      this.appendChild(ripple);
      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(1)';
        ripple.style.opacity   = '0';
      });
      ripple.addEventListener('transitionend', () => ripple.remove());
    });
  });

  /* ── Intersection observer: fade-in for future sections ─── */
  // Scaffold for later sprints — elements with class .reveal will animate in
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  /* ── Keyboard accessibility: close menu with Escape ─────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) setMenuOpen(false);
  });

})();

/* ============================================================
   ARTIST SLIDER MODULE
   ============================================================ */
(function () {
  'use strict';

  /* ── Artist data ─────────────────────────────────────────── */
  const ARTISTS = [
    {
      name: 'Zay Liberhan',
      tagline: 'Afrobeat Rising Star',
      genre: 'Afrobeat',
      img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80'
    },
    {
      name: 'Kolou Wave',
      tagline: 'Highlife & Soul Fusion',
      genre: 'Highlife',
      img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80'
    },
    {
      name: 'Nyanplee',
      tagline: 'Queen of Liberian Pop',
      genre: 'L-Pop',
      img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&q=80'
    },
    {
      name: 'Bassa Boy',
      tagline: 'Trap & Griot Storyteller',
      genre: 'Trap',
      img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'
    },
    {
      name: 'Saye D',
      tagline: 'Roots Reggae Vibes',
      genre: 'Reggae',
      img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80'
    },
    {
      name: 'Ma Pewu',
      tagline: 'Gospel & Heritage Voice',
      genre: 'Gospel',
      img: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&q=80'
    },
    {
      name: 'Flomo G',
      tagline: 'Street Rap & Consciousness',
      genre: 'Hip-Hop',
      img: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&q=80'
    },
    {
      name: 'Korto Beats',
      tagline: 'Electronic & Afro-fusion',
      genre: 'Electronic',
      img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80'
    }
  ];

  /* ── DOM references ──────────────────────────────────────── */
  const track     = document.getElementById('sliderTrack');
  const dotsWrap  = document.getElementById('sliderDots');
  const prevBtn   = document.getElementById('arrowPrev');
  const nextBtn   = document.getElementById('arrowNext');
  const viewport  = track ? track.closest('.slider-viewport') : null;
  const sliderRoot = document.getElementById('artistSlider');

  if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

  /* ── Config ──────────────────────────────────────────────── */
  const AUTO_DELAY  = 3500;   // ms between auto-slides
  const GAP         = 24;     // must match CSS gap

  /* ── State ───────────────────────────────────────────────── */
  let currentIndex  = 0;      // logical index (0 … ARTISTS.length-1)
  let autoTimer     = null;
  let isTransitioning = false;

  /* ── Build cards + dots ──────────────────────────────────── */
  function buildCard(artist) {
    const card = document.createElement('article');
    card.className = 'artist-card';
    card.setAttribute('role', 'group');
    card.setAttribute('aria-label', artist.name);

    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${artist.img}" alt="${artist.name}" loading="lazy" />
        <span class="card-genre">${artist.genre}</span>
      </div>
      <div class="card-body">
        <h3 class="card-name">${artist.name}</h3>
        <p class="card-tagline">${artist.tagline}</p>
        <button class="card-follow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Follow
        </button>
      </div>
    `;

    return card;
  }

  function buildDot(i) {
    const dot = document.createElement('button');
    dot.className = 'slider-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to artist ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    return dot;
  }

  // Render cards
  ARTISTS.forEach(a => track.appendChild(buildCard(a)));

  // Render dots
  ARTISTS.forEach((_, i) => dotsWrap.appendChild(buildDot(i)));

  const cards = Array.from(track.querySelectorAll('.artist-card'));
  const dots  = Array.from(dotsWrap.querySelectorAll('.slider-dot'));

  /* ── Layout calculation ──────────────────────────────────── */
  function getCardWidth() {
    return cards[0] ? cards[0].offsetWidth : 240;
  }

  function getViewportWidth() {
    return viewport ? viewport.offsetWidth : window.innerWidth;
  }

  /* Calculate the translate-x needed to centre card at `index` */
  function getOffsetForIndex(index) {
    const cw  = getCardWidth();
    const vw  = getViewportWidth();
    const centre = vw / 2 - cw / 2;
    return -(index * (cw + GAP)) + centre;
  }

  /* ── Apply position (optionally without animation) ──────── */
  function applyPosition(index, animate) {
    const offset = getOffsetForIndex(index);
    track.style.transition = animate
      ? 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)'
      : 'none';
    track.style.transform = `translateX(${offset}px)`;
  }

  /* ── Update card classes ─────────────────────────────────── */
  function updateClasses(index) {
    const total = cards.length;
    cards.forEach((card, i) => {
      card.classList.remove('is-active', 'is-adjacent');
      const diff = Math.abs(i - index);
      if (diff === 0) card.classList.add('is-active');
      else if (diff === 1) card.classList.add('is-adjacent');
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
      dot.setAttribute('aria-selected', String(i === index));
    });
  }

  /* ── Go to a specific index ──────────────────────────────── */
  function goTo(index, animate = true) {
    if (isTransitioning) return;
    const total = cards.length;
    // Clamp with wrap
    currentIndex = ((index % total) + total) % total;
    updateClasses(currentIndex);
    applyPosition(currentIndex, animate);

    if (animate) {
      isTransitioning = true;
      setTimeout(() => { isTransitioning = false; }, 560);
    }
  }

  function next() { goTo(currentIndex + 1); }
  function prev() { goTo(currentIndex - 1); }

  /* ── Auto-slide ──────────────────────────────────────────── */
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, AUTO_DELAY);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  /* ── Event listeners ─────────────────────────────────────── */
  nextBtn.addEventListener('click', () => { next(); startAuto(); });
  prevBtn.addEventListener('click', () => { prev(); startAuto(); });

  // Pause on hover
  sliderRoot.addEventListener('mouseenter', stopAuto);
  sliderRoot.addEventListener('mouseleave', startAuto);

  // Keyboard navigation when slider is focused
  sliderRoot.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); startAuto(); }
    if (e.key === 'ArrowLeft')  { prev(); startAuto(); }
  });

  // Click a side card to navigate to it
  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if (i !== currentIndex) { goTo(i); startAuto(); }
    });
  });

  /* ── Touch / swipe support ───────────────────────────────── */
  let touchStartX = 0;
  let touchDeltaX = 0;

  viewport.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    stopAuto();
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    touchDeltaX = e.touches[0].clientX - touchStartX;
  }, { passive: true });

  viewport.addEventListener('touchend', () => {
    if (Math.abs(touchDeltaX) > 50) {
      touchDeltaX < 0 ? next() : prev();
    }
    touchDeltaX = 0;
    startAuto();
  });

  /* ── Resize: recalculate position ───────────────────────── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      applyPosition(currentIndex, false);
    }, 120);
  }, { passive: true });

  /* ── Init ────────────────────────────────────────────────── */
  // Use intersection observer to trigger initialisation only once visible
  const initObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        goTo(0, false);   // set position without animation
        startAuto();
        initObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  if (sliderRoot) initObserver.observe(sliderRoot);

})();

/* ============================================================
   SCROLL REVEAL MODULE  (About & Features)
   ============================================================ */
(function () {
  'use strict';

  /**
   * Targets:  .reveal-fade  .reveal-up  .reveal-card
   * On intersection, adds class "in-view" which triggers the
   * CSS transition defined in style.css.
   */

  const SELECTORS = '.reveal-fade, .reveal-up, .reveal-card';
  const THRESHOLD = 0.18;   // how much of the element must be visible

  function buildObserver() {
    return new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);   // fire once
        }
      });
    }, { threshold: THRESHOLD });
  }

  const observer = buildObserver();

  // Observe all current targets
  document.querySelectorAll(SELECTORS).forEach(el => observer.observe(el));

  // If sections are injected dynamically later (e.g. future sprints),
  // a MutationObserver re-scans for new targets.
  const mutation = new MutationObserver(() => {
    document.querySelectorAll(`${SELECTORS}:not(.in-view)`).forEach(el => {
      observer.observe(el);
    });
  });

  mutation.observe(document.body, { childList: true, subtree: true });

  // Immediately mark elements that are already in the viewport on load
  // (e.g. if user refreshed mid-page)
  requestAnimationFrame(() => {
    document.querySelectorAll(SELECTORS).forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * (1 - THRESHOLD)) {
        el.classList.add('in-view');
        observer.unobserve(el);
      }
    });
  });

})();

/* ============================================================
   CONTACT FORM MODULE
   ============================================================ */
(function () {
  'use strict';

  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('submitBtn');
  const successMsg = document.getElementById('formSuccess');
  if (!form) return;

  const fields = {
    name:    { input: document.getElementById('contactName'),  error: document.getElementById('nameError')  },
    email:   { input: document.getElementById('contactEmail'), error: document.getElementById('emailError') },
    message: { input: document.getElementById('contactMessage'), error: document.getElementById('msgError') }
  };

  /* ── Validators ───────────────────────────────────────── */
  function validateField(key) {
    const { input, error } = fields[key];
    const val = input.value.trim();
    let msg = '';

    if (!val) {
      msg = 'This field is required.';
    } else if (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      msg = 'Please enter a valid email address.';
    } else if (key === 'name' && val.length < 2) {
      msg = 'Name must be at least 2 characters.';
    } else if (key === 'message' && val.length < 10) {
      msg = 'Message must be at least 10 characters.';
    }

    error.textContent = msg;
    input.classList.toggle('invalid', !!msg);
    return !msg;
  }

  /* Live validation on blur */
  Object.keys(fields).forEach(key => {
    const { input } = fields[key];
    input.addEventListener('blur', () => validateField(key));
    input.addEventListener('input', () => {
      if (input.classList.contains('invalid')) validateField(key);
    });
  });

  /* ── Submit ───────────────────────────────────────────── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const valid = Object.keys(fields).map(k => validateField(k)).every(Boolean);
    if (!valid) return;

    /* Simulate async send */
    submitBtn.classList.add('sending');
    const label = submitBtn.querySelector('.submit-label');
    const original = label.textContent;
    label.textContent = 'Sending';

    setTimeout(() => {
      submitBtn.classList.remove('sending');
      label.textContent = original;
      form.reset();

      // Clear any lingering invalid states
      Object.values(fields).forEach(({ input, error }) => {
        input.classList.remove('invalid');
        error.textContent = '';
      });

      // Show success toast
      successMsg.classList.add('visible');
      setTimeout(() => successMsg.classList.remove('visible'), 5000);
    }, 1800);
  });

})();

/* ============================================================
   FOOTER YEAR MODULE
   ============================================================ */
(function () {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ============================================================
   MUSIC PLAYER + JAMENDO API  —  LIB TUNEZ
   ============================================================ */
(function () {
  'use strict';

  /* ── Jamendo config ─────────────────────────────────────────
     👉 GET YOUR FREE KEY: https://devportal.jamendo.com/signup
        Paste it below to replace 'YOUR_CLIENT_ID_HERE'
  ────────────────────────────────────────────────────────── */
  const CLIENT_ID = '2d931180';
  const API       = 'https://api.jamendo.com/v3.0';

  const VIEWS = {
    home:     { fuzzytags: 'pop',         order: 'popularity_total', limit: 20 },
    trending: { fuzzytags: 'electronic',  order: 'popularity_week',  limit: 20 },
    artists:  { fuzzytags: 'acoustic',    order: 'buzzrate',         limit: 20 },
  };

  /* ── State ───────────────────────────────────────────────── */
  let songs        = [];
  let currentIdx   = 0;
  let isPlaying    = false;
  let isShuffle    = false;
  let isRepeat     = false;
  let isMuted      = false;
  let volume       = 0.8;
  let currentView  = 'home';
  let isDragProg   = false;
  let isDragVol    = false;
  let fakeTimer    = null;
  let fakeCurrentSec  = 0;
  let fakeDurationSec = 210;

  /* ── DOM refs ────────────────────────────────────────────── */
  const landingPage   = document.getElementById('landingPage');
  const playerPage    = document.getElementById('playerPage');
  const audioEl       = document.getElementById('audioEngine');

  // Sidebar
  const sidebar       = document.getElementById('playerSidebar');
  const overlay       = document.getElementById('sidebarOverlay');
  const toggleBtn     = document.getElementById('sidebarToggleBtn');
  const closeBtn      = document.getElementById('sidebarCloseBtn');
  const playlistEl    = document.getElementById('playlist');
  const trackCount    = document.getElementById('trackCount');
  const navItems      = document.querySelectorAll('.ps-nav-item');

  // Main area
  const pmCover       = document.getElementById('pmCover');
  const coverWrap     = pmCover?.closest('.pm-cover-wrap');
  const pmTitle       = document.getElementById('pmTitle');
  const pmArtist      = document.getElementById('pmArtist');
  const pmGenre       = document.getElementById('pmGenre');
  const pmCurrentTime = document.getElementById('pmCurrentTime');
  const pmDuration    = document.getElementById('pmDuration');
  const progressTrack = document.getElementById('progressTrack');
  const progressFill  = document.getElementById('progressFill');
  const progressThumb = document.getElementById('progressThumb');
  const playBtn       = document.getElementById('playBtn');
  const prevBtn       = document.getElementById('prevBtn');
  const nextBtn       = document.getElementById('nextBtn');
  const shuffleBtn    = document.getElementById('shuffleBtn');
  const repeatBtn     = document.getElementById('repeatBtn');
  const muteBtn       = document.getElementById('muteBtn');
  const volTrack      = document.getElementById('volTrack');
  const volFill       = document.getElementById('volFill');
  const volThumb      = document.getElementById('volThumb');
  const volLabel      = document.getElementById('volLabel');
  const visualizer    = document.getElementById('visualizer');
  const vizBars       = visualizer ? [...visualizer.querySelectorAll('.viz-bar')] : [];

  // Mini bar
  const miniCover     = document.getElementById('miniCover');
  const miniTitle     = document.getElementById('miniTitle');
  const miniArtist    = document.getElementById('miniArtist');
  const miniPlayBtn   = document.getElementById('miniPlayBtn');
  const miniBarEl     = document.getElementById('miniBar');

  // Back / theme
  const backBtns      = ['pmBackBtn','backToHome'].map(id => document.getElementById(id)).filter(Boolean);
  const pmThemeToggle = document.getElementById('pmThemeToggle');

  if (!playerPage || !landingPage) return;

  /* ══════════════════════════════════════════════════════════
     PAGE TRANSITIONS
  ══════════════════════════════════════════════════════════ */
  function showPlayer() {
    landingPage.classList.add('page-exit');
    playerPage.style.display = 'flex';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      playerPage.classList.add('page-visible');
    }));
    document.body.style.overflow = 'hidden';
    if (!songs.length) fetchSongs('home');
  }

  function showLanding() {
    playerPage.classList.remove('page-visible');
    landingPage.classList.remove('page-exit');
    pauseAudio();
    setTimeout(() => {
      playerPage.style.display = 'none';
      document.body.style.overflow = '';
    }, 460);
  }

  // All "Start Listening" CTAs
  document.querySelectorAll('a, button').forEach(el => {
    if (el.textContent.trim() === 'Start Listening') {
      el.addEventListener('click', e => { e.preventDefault(); showPlayer(); });
    }
  });

  backBtns.forEach(b => b.addEventListener('click', e => { e.preventDefault(); showLanding(); }));

  /* ══════════════════════════════════════════════════════════
     JAMENDO API FETCH
  ══════════════════════════════════════════════════════════ */
  async function fetchSongs(view) {
    currentView = view;
    const q = VIEWS[view] || VIEWS.home;

    // Guard: no key set yet
    if (!CLIENT_ID || CLIENT_ID === 'YOUR_CLIENT_ID_HERE') {
      showKeyMissingUI();
      return;
    }

    setLoadingState(true);

    const buildUrl = (params) => {
      const u = new URL(`${API}/tracks/`);
      u.searchParams.set('client_id',   CLIENT_ID);
      u.searchParams.set('format',      'json');
      u.searchParams.set('limit',       q.limit);
      u.searchParams.set('order',       q.order);
      u.searchParams.set('audioformat', 'mp32');
      u.searchParams.set('imagesize',   '600');
      Object.entries(params).forEach(([k,v]) => u.searchParams.set(k, v));
      return u.toString();
    };

    const attempts = [
      buildUrl({ fuzzytags: q.fuzzytags }),         // e.g. "pop"
      buildUrl({ fuzzytags: q.fuzzytags.split(' ')[0] }), // first word only
      buildUrl({}),                                  // no tag — just order
    ];

    let lastErr;
    for (const url of attempts) {
      try {
        const res  = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data.headers?.status === 'failed') {
          const msg = (data.headers.error_message || '').toLowerCase();
          // Invalid key — stop retrying, show setup guide
          if (msg.includes('client') || msg.includes('credential') || msg.includes('authorized')) {
            showKeyInvalidUI();
            setLoadingState(false);
            return;
          }
          throw new Error(data.headers.error_message || 'API error');
        }

        if (!data.results?.length) throw new Error('Empty results');

        songs = data.results
          .filter(t => t.audio)
          .map(t => ({
            id:          t.id,
            title:       t.name        || 'Unknown Track',
            artist:      t.artist_name || 'Unknown Artist',
            genre:       t.genre       || view,
            duration:    formatTime(t.duration),
            durationSec: Number(t.duration) || 180,
            cover:       t.image || `https://picsum.photos/seed/${t.id}/600/600`,
            thumb:       t.album_image || t.image || `https://picsum.photos/seed/${t.id}/80/80`,
            audio:       t.audio,
          }));

        if (!songs.length) throw new Error('No playable tracks after filter');

        setLoadingState(false);
        buildPlaylist();
        loadSong(0, false);
        return;

      } catch (err) {
        lastErr = err;
        console.warn(`Attempt failed: ${err.message}`);
      }
    }

    console.error('All attempts failed:', lastErr);
    showPlaylistError();
    setLoadingState(false);
  }

  function setLoadingState(loading) {
    if (!playlistEl) return;
    if (loading) {
      playlistEl.innerHTML = `
        <li class="pl-loading">
          <div class="pl-spinner"></div>
          <span>Loading songs…</span>
        </li>`;
    }
  }

  function showPlaylistError() {
    if (!playlistEl) return;
    playlistEl.innerHTML = `
      <li class="pl-error">
        <span>⚠️ Couldn't load songs.<br>Check your connection.</span>
        <button class="pl-retry-btn" id="plRetryBtn">Retry</button>
      </li>`;
    document.getElementById('plRetryBtn')?.addEventListener('click', () => fetchSongs(currentView));
  }

  function showKeyMissingUI() {
    if (!playlistEl) return;
    playlistEl.innerHTML = `
      <li class="pl-setup">
        <div class="pl-setup-icon">🔑</div>
        <strong>API Key Required</strong>
        <p>Get your free key at<br>
           <a href="https://devportal.jamendo.com/signup" target="_blank" rel="noopener">
             devportal.jamendo.com
           </a>
        </p>
        <p>Then open <code>script.js</code> and replace<br>
           <code>YOUR_CLIENT_ID_HERE</code><br>
           with your key.</p>
      </li>`;
  }

  function showKeyInvalidUI() {
    if (!playlistEl) return;
    playlistEl.innerHTML = `
      <li class="pl-setup">
        <div class="pl-setup-icon">❌</div>
        <strong>Invalid API Key</strong>
        <p>The client ID in <code>script.js</code> was rejected by Jamendo.</p>
        <p>Get a new free key at<br>
           <a href="https://devportal.jamendo.com/signup" target="_blank" rel="noopener">
             devportal.jamendo.com
           </a>
        </p>
        <p>Then replace <code>YOUR_CLIENT_ID_HERE</code> with it.</p>
      </li>`;
  }

  /* ══════════════════════════════════════════════════════════
     BUILD PLAYLIST UI
  ══════════════════════════════════════════════════════════ */
  function buildPlaylist() {
    if (!playlistEl) return;
    playlistEl.innerHTML = '';

    songs.forEach((song, i) => {
      const li = document.createElement('li');
      li.className = 'pl-item';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-label', `${song.title} by ${song.artist}`);
      li.dataset.index = i;
      li.innerHTML = `
        <img class="pl-thumb" src="${song.thumb}" alt="" loading="lazy"
             onerror="this.src='https://picsum.photos/seed/${song.id}/80/80'" />
        <div class="pl-info">
          <div class="pl-name">${escHtml(song.title)}</div>
          <div class="pl-artist">${escHtml(song.artist)}</div>
        </div>
        <span class="pl-duration">${song.duration}</span>
        <span class="pl-playing-indicator" aria-hidden="true">
          <span class="pl-bar"></span>
          <span class="pl-bar"></span>
          <span class="pl-bar"></span>
        </span>`;
      li.addEventListener('click', () => loadSong(i, true));
      playlistEl.appendChild(li);
    });

    if (trackCount) trackCount.textContent = `${songs.length} songs`;
  }

  /* ══════════════════════════════════════════════════════════
     LOAD SONG
  ══════════════════════════════════════════════════════════ */
  function loadSong(index, autoPlay) {
    if (!songs.length) return;
    currentIdx = ((index % songs.length) + songs.length) % songs.length;
    const s = songs[currentIdx];

    // Cover image with fallback
    if (pmCover)  {
      pmCover.src = s.cover;
      pmCover.onerror = () => { pmCover.src = `https://picsum.photos/seed/${s.id}/600/600`; };
    }
    if (pmTitle)  pmTitle.textContent  = s.title;
    if (pmArtist) pmArtist.textContent = s.artist;
    if (pmGenre)  pmGenre.textContent  = capitalise(s.genre);

    // Mini bar
    if (miniCover)  {
      miniCover.src = s.thumb;
      miniCover.onerror = () => { miniCover.src = `https://picsum.photos/seed/${s.id}/80/80`; };
    }
    if (miniTitle)  miniTitle.textContent  = s.title;
    if (miniArtist) miniArtist.textContent = s.artist;

    // Audio
    stopFakeTimer();
    fakeCurrentSec  = 0;
    fakeDurationSec = s.durationSec || 180;
    setProgress(0);
    if (pmCurrentTime) pmCurrentTime.textContent = '0:00';
    if (pmDuration)    pmDuration.textContent    = s.duration;

    if (audioEl) {
      audioEl.pause();
      audioEl.src = s.audio || '';
      audioEl.load();
    }

    randomizeViz();
    updatePlaylistHighlight();

    if (autoPlay) playAudio(); else pauseAudio();
  }

  /* ══════════════════════════════════════════════════════════
     PLAYBACK
  ══════════════════════════════════════════════════════════ */
  function playAudio() {
    isPlaying = true;
    const s = songs[currentIdx];

    if (audioEl && s?.audio) {
      audioEl.volume = isMuted ? 0 : volume;
      audioEl.play().catch(() => startFakeTimer()); // fallback if blocked
    } else {
      startFakeTimer();
    }

    setPlayingUI(true);
  }

  function pauseAudio() {
    isPlaying = false;
    if (audioEl) audioEl.pause();
    stopFakeTimer();
    setPlayingUI(false);
  }

  function togglePlay() {
    isPlaying ? pauseAudio() : playAudio();
  }

  function setPlayingUI(playing) {
    [playBtn, miniPlayBtn].forEach(b => b?.classList.toggle('playing', playing));
    coverWrap?.classList.toggle('playing', playing);
    visualizer?.classList.toggle('viz-playing', playing);
    updatePlaylistHighlight();
  }

  function onSongEnded() {
    if (isRepeat) {
      fakeCurrentSec = 0;
      if (audioEl) audioEl.currentTime = 0;
      playAudio();
    } else {
      loadSong(isShuffle ? randIdx() : currentIdx + 1, true);
    }
  }

  function randIdx() {
    let i;
    do { i = Math.floor(Math.random() * songs.length); } while (i === currentIdx && songs.length > 1);
    return i;
  }

  /* ── Real audio events ───────────────────────────────────── */
  if (audioEl) {
    audioEl.volume = volume;

    audioEl.addEventListener('timeupdate', () => {
      if (isDragProg || !audioEl.duration) return;
      updateProgressFromSecs(audioEl.currentTime, audioEl.duration);
    });

    audioEl.addEventListener('loadedmetadata', () => {
      if (pmDuration) pmDuration.textContent = formatTime(audioEl.duration);
      fakeDurationSec = audioEl.duration || fakeDurationSec;
    });

    audioEl.addEventListener('ended', onSongEnded);

    audioEl.addEventListener('error', () => {
      // Audio load failed — fall back to fake timer so UI still animates
      if (isPlaying) startFakeTimer();
    });
  }

  /* ── Fake timer (when audio fails / no src) ──────────────── */
  function startFakeTimer() {
    stopFakeTimer();
    fakeTimer = setInterval(() => {
      fakeCurrentSec = Math.min(fakeCurrentSec + 1, fakeDurationSec);
      updateProgressFromSecs(fakeCurrentSec, fakeDurationSec);
      if (fakeCurrentSec >= fakeDurationSec) { stopFakeTimer(); onSongEnded(); }
    }, 1000);
  }

  function stopFakeTimer() {
    if (fakeTimer) { clearInterval(fakeTimer); fakeTimer = null; }
  }

  function updateProgressFromSecs(current, total) {
    const pct = total > 0 ? (current / total) * 100 : 0;
    setProgress(pct);
    if (pmCurrentTime) pmCurrentTime.textContent = formatTime(current);
  }

  /* ══════════════════════════════════════════════════════════
     PROGRESS BAR
  ══════════════════════════════════════════════════════════ */
  function setProgress(pct) {
    const c = Math.max(0, Math.min(100, pct));
    if (progressFill)  progressFill.style.width = `${c}%`;
    if (progressThumb) progressThumb.style.left  = `${c}%`;
    if (progressTrack) progressTrack.setAttribute('aria-valuenow', Math.round(c));
    // Mini bar strip
    if (miniBarEl) miniBarEl.style.setProperty('--mini-progress', `${c}%`);
  }

  function seekFromEvent(e) {
    if (!progressTrack) return;
    const rect = progressTrack.getBoundingClientRect();
    const x    = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const pct  = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const total = (audioEl?.duration) || fakeDurationSec;
    const secs  = (pct / 100) * total;
    setProgress(pct);
    if (pmCurrentTime) pmCurrentTime.textContent = formatTime(secs);
    if (audioEl?.duration) audioEl.currentTime = secs;
    else fakeCurrentSec = secs;
  }

  if (progressTrack) {
    progressTrack.addEventListener('mousedown',  e => { isDragProg = true; seekFromEvent(e); });
    progressTrack.addEventListener('touchstart', e => { isDragProg = true; seekFromEvent(e); }, { passive: true });
    progressTrack.addEventListener('click', seekFromEvent);
    progressTrack.addEventListener('keydown', e => {
      let pct = parseFloat(progressFill?.style.width) || 0;
      if (e.key === 'ArrowRight') pct = Math.min(100, pct + 2);
      if (e.key === 'ArrowLeft')  pct = Math.max(0, pct - 2);
      seekFromEvent({ clientX: progressTrack.getBoundingClientRect().left + (pct / 100) * progressTrack.offsetWidth });
    });
  }

  /* ══════════════════════════════════════════════════════════
     VOLUME
  ══════════════════════════════════════════════════════════ */
  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    if (audioEl) audioEl.volume = isMuted ? 0 : volume;
    const pct = volume * 100;
    if (volFill)  volFill.style.width  = `${pct}%`;
    if (volThumb) volThumb.style.left  = `${pct}%`;
    if (volLabel) volLabel.textContent = `${Math.round(pct)}%`;
    if (volTrack) volTrack.setAttribute('aria-valuenow', Math.round(pct));
  }

  function volFromEvent(e) {
    if (!volTrack) return;
    const rect = volTrack.getBoundingClientRect();
    const x    = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    setVolume(Math.max(0, Math.min(1, x / rect.width)));
  }

  if (volTrack) {
    volTrack.addEventListener('mousedown',  e => { isDragVol = true; volFromEvent(e); });
    volTrack.addEventListener('touchstart', e => { isDragVol = true; volFromEvent(e); }, { passive: true });
    volTrack.addEventListener('click', volFromEvent);
  }

  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      muteBtn.classList.toggle('muted', isMuted);
      if (audioEl) audioEl.volume = isMuted ? 0 : volume;
    });
  }

  setVolume(0.8);

  /* ── Global drag end ─────────────────────────────────────── */
  document.addEventListener('mousemove', e => {
    if (isDragProg) seekFromEvent(e);
    if (isDragVol)  volFromEvent(e);
  });
  document.addEventListener('touchmove', e => {
    if (isDragProg) seekFromEvent(e);
    if (isDragVol)  volFromEvent(e);
  }, { passive: true });
  document.addEventListener('mouseup',  () => { isDragProg = false; isDragVol = false; });
  document.addEventListener('touchend', () => { isDragProg = false; isDragVol = false; });

  /* ══════════════════════════════════════════════════════════
     CONTROLS
  ══════════════════════════════════════════════════════════ */
  playBtn?.addEventListener('click', togglePlay);
  miniPlayBtn?.addEventListener('click', togglePlay);

  nextBtn?.addEventListener('click', () => loadSong(isShuffle ? randIdx() : currentIdx + 1, true));

  prevBtn?.addEventListener('click', () => {
    const elapsed = audioEl?.currentTime ?? fakeCurrentSec;
    if (elapsed > 3) {
      if (audioEl) audioEl.currentTime = 0;
      fakeCurrentSec = 0;
      setProgress(0);
    } else {
      loadSong(currentIdx - 1, true);
    }
  });

  shuffleBtn?.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
    shuffleBtn.setAttribute('aria-pressed', String(isShuffle));
  });

  repeatBtn?.addEventListener('click', () => {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle('active', isRepeat);
    repeatBtn.setAttribute('aria-pressed', String(isRepeat));
    if (audioEl) audioEl.loop = isRepeat;
  });

  /* ══════════════════════════════════════════════════════════
     SIDEBAR NAV (Home / Trending / Artists)
  ══════════════════════════════════════════════════════════ */
  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (!view || !VIEWS[view]) return;

      navItems.forEach(b => b.classList.remove('ps-nav-active'));
      btn.classList.add('ps-nav-active');

      if (view !== currentView) fetchSongs(view);

      // Close drawer on mobile after nav tap
      if (window.innerWidth <= 700) setTimeout(closeSidebar, 200);
    });
  });

  /* ══════════════════════════════════════════════════════════
     PLAYLIST HIGHLIGHT
  ══════════════════════════════════════════════════════════ */
  function updatePlaylistHighlight() {
    if (!playlistEl) return;
    playlistEl.querySelectorAll('.pl-item').forEach((li, i) => {
      const active = i === currentIdx;
      li.classList.toggle('pl-active', active);
      li.classList.toggle('pl-is-playing', active && isPlaying);
      li.setAttribute('aria-selected', String(active));
    });
    const active = playlistEl.querySelectorAll('.pl-item')[currentIdx];
    active?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /* ══════════════════════════════════════════════════════════
     WAVE VISUALIZER
  ══════════════════════════════════════════════════════════ */
  const VIZ_PATTERNS = [
    [0.2,0.6,1.0,0.7,0.4,0.9,0.8,0.3,0.6,1.0,0.7,0.4,0.9,0.5,0.8,0.3,0.6,1.0,0.5,0.7],
    [0.7,0.3,0.8,0.5,1.0,0.4,0.9,0.6,0.2,0.8,0.5,1.0,0.4,0.9,0.6,0.2,0.8,0.5,0.3,0.7],
    [1.0,0.6,0.3,0.8,0.5,0.2,0.9,0.4,0.7,0.6,0.3,0.8,0.5,0.2,0.9,0.4,0.7,0.6,0.3,0.8],
  ];

  function randomizeViz() {
    const pattern = VIZ_PATTERNS[currentIdx % VIZ_PATTERNS.length];
    vizBars.forEach((b, i) => b.style.setProperty('--viz-h', (pattern[i] ?? 0.5).toFixed(2)));
  }

  /* ══════════════════════════════════════════════════════════
     THEME TOGGLE (player)
  ══════════════════════════════════════════════════════════ */
  function syncThemeIcons() {
    const t = document.documentElement.getAttribute('data-theme');
    const icon = t === 'dark' ? '🌙' : '☀️';
    document.querySelectorAll('.toggle-icon').forEach(el => el.textContent = icon);
  }

  pmThemeToggle?.addEventListener('click', () => {
    const cur  = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('libtunez-theme', next);
    syncThemeIcons();
  });

  syncThemeIcons();

  /* ══════════════════════════════════════════════════════════
     KEYBOARD SHORTCUTS
  ══════════════════════════════════════════════════════════ */
  document.addEventListener('keydown', e => {
    if (!playerPage.classList.contains('page-visible')) return;
    if (['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return;
    switch (e.code) {
      case 'Space':      e.preventDefault(); togglePlay(); break;
      case 'ArrowRight': e.preventDefault(); loadSong(currentIdx + 1, true); break;
      case 'ArrowLeft':  e.preventDefault(); loadSong(currentIdx - 1, true); break;
      case 'KeyM':       muteBtn?.click(); break;
      case 'Escape':     showLanding(); break;
    }
  });

  /* ══════════════════════════════════════════════════════════
     MOBILE SIDEBAR
  ══════════════════════════════════════════════════════════ */
  let sidebarOpen = false;

  function openSidebar() {
    sidebarOpen = true;
    sidebar?.classList.add('sidebar-open');
    overlay?.classList.add('overlay-visible');
    toggleBtn?.setAttribute('aria-expanded', 'true');
    sidebar?.setAttribute('aria-hidden', 'false');
    sidebar?.querySelector('.ps-nav-item')?.focus();
  }

  function closeSidebar() {
    sidebarOpen = false;
    sidebar?.classList.remove('sidebar-open');
    overlay?.classList.remove('overlay-visible');
    toggleBtn?.setAttribute('aria-expanded', 'false');
    sidebar?.setAttribute('aria-hidden', 'true');
    if (window.innerWidth <= 700) toggleBtn?.focus();
  }

  toggleBtn?.addEventListener('click', () => sidebarOpen ? closeSidebar() : openSidebar());
  closeBtn?.addEventListener('click',  closeSidebar);
  overlay?.addEventListener('click',   closeSidebar);

  // Swipe left to close drawer
  let swipeX = 0;
  sidebar?.addEventListener('touchstart', e => { swipeX = e.touches[0].clientX; }, { passive: true });
  sidebar?.addEventListener('touchend',   e => { if (e.changedTouches[0].clientX - swipeX < -60) closeSidebar(); }, { passive: true });

  // Close on resize to desktop
  window.addEventListener('resize', () => { if (window.innerWidth > 700 && sidebarOpen) closeSidebar(); }, { passive: true });

  // Escape closes drawer too
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && sidebarOpen) closeSidebar(); });

  // Close drawer after playlist tap on mobile
  playlistEl?.addEventListener('click', () => { if (window.innerWidth <= 700) setTimeout(closeSidebar, 200); });

  // Init sidebar aria state
  if (window.innerWidth <= 700) sidebar?.setAttribute('aria-hidden', 'true');

  /* ══════════════════════════════════════════════════════════
     HELPERS
  ══════════════════════════════════════════════════════════ */
  function formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function capitalise(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '—';
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

})();
