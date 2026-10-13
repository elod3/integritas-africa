/* Kusekwa — o singură pagină: hero cu donația, școala, galeria, donația din nou (Stripe sau transfer).
   Stilul e numai Tailwind; JS-ul se agață de id-uri și de atribute data-*, iar clasele pe care le
   pune singur (literele, vizorul) sunt tot clase Tailwind. */
/* PLATA ONLINE — singurul loc de schimbat. Cine are contul Stripe al fundației face un Payment Link
   („Customers choose what to pay”) și pune adresa lui în stripeLink. Până atunci, butoanele duc la transfer. */
const CONFIG = {
  stripeLink: '',                          // ex.: 'https://buy.stripe.com/...'
  stripeAmountParam: '__prefilled_amount', // Stripe primește suma în bani (lei × 100)
  stripeTag: 'africa-kusekwa',            // client_reference_id: în Stripe, fiecare plată poartă eticheta asta
  googlePayEnv: 'TEST',                   // butonul Google Pay doar redirecționează; 'PRODUCTION' când e live
};

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const STILL = new URLSearchParams(location.search).has('still');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = !RM && !STILL && window.gsap;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const loaded = (img) => img.complete && img.naturalWidth ? Promise.resolve()
    : new Promise((r) => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); });
  const fmt = (n) => Math.round(n).toLocaleString('ro-RO');

  /* ---------- literele urcă din spatele unei măști (cuvântul taie ce iese; padding jos pentru Ș/Ț) ---------- */
  const WORD = 'inline-block overflow-hidden whitespace-nowrap align-bottom pt-[.2em] pb-[.14em] -mt-[.12em] -mb-[.14em]';
  function split(el, again) {
    if (el.dataset.split && !again) return $$('[data-ch]', el);
    el.dataset.split = '1';
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.textContent = '';
    parts.forEach((part, pi) => {
      const tmp = document.createElement('div'); tmp.innerHTML = part;
      const words = tmp.textContent.trim().split(/\s+/).filter(Boolean);
      words.forEach((w, wi) => {
        const word = document.createElement('span');
        word.className = WORD;
        [...w].forEach((c) => { const s = document.createElement('span'); s.className = 'inline-block will-change-transform'; s.dataset.ch = ''; s.textContent = c; word.appendChild(s); });
        el.appendChild(word);
        if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
      });
      if (pi < parts.length - 1) el.appendChild(document.createElement('br'));
    });
    return $$('[data-ch]', el);
  }

  /* ---------- YOUTUBE: clipurile stau pe YouTube (nelistate); iframe-ul se pune abia când e nevoie de el ---------- */
  // fără loop=1/playlist (YouTube ar pune butoane de playlist peste clip): bucla o facem noi prin API-ul iframe-ului
  const ytSrc = (id, bg) => `https://www.youtube-nocookie.com/embed/${id}?` + new URLSearchParams(bg
    ? { autoplay: 1, mute: 1, controls: 0, playsinline: 1, rel: 0, modestbranding: 1, disablekb: 1, iv_load_policy: 3, fs: 0, enablejsapi: 1, origin: location.origin }
    : { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1 });
  const ytSay = (f, func, args = []) => f?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
  addEventListener('message', (e) => {
    if (!/youtube(-nocookie)?\.com$/.test(new URL(e.origin).hostname)) return;
    let d; try { d = JSON.parse(e.data); } catch (err) { return; }
    const f = [...document.querySelectorAll('iframe[data-bg]')].find((x) => x.contentWindow === e.source);
    if (!f) return;
    const state = d.event === 'onStateChange' ? d.info : d.info?.playerState;
    if (state === 0) { ytSay(f, 'seekTo', [0, true]); ytSay(f, 'playVideo'); }   // s-a terminat: de la capăt
    if (state === 1) {                                                              // a pornit: îl arătăm peste poster
      f.classList.add('is-on');
      f.parentElement.querySelector('span[aria-hidden]')?.classList.add('opacity-0');
      // clipurile de fundal pregătite din timp așteaptă pe pauză până le vine rândul
      if (f.closest('#film') && !f.parentElement.classList.contains('is-on')) ytSay(f, 'pauseVideo');
    }
  });
  const ytFrame = (id, bg, cls) => {
    const f = document.createElement('iframe');
    f.src = ytSrc(id, bg); f.className = cls; f.title = bg ? '' : 'Clip de la Kusekwa';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.loading = 'lazy';
    if (bg) {
      f.tabIndex = -1; f.setAttribute('aria-hidden', 'true'); f.dataset.bg = '';
      // ne abonăm la evenimentele playerului, ca să aflăm când se termină clipul
      f.addEventListener('load', () => f.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: f.dataset.yt || 1, channel: 'widget' }), '*'));
    }
    return f;
  };
  // fundalul: un iframe 16:9 mai mare decât ecranul, ca să-l acopere ca object-fit: cover
  // cu 20% mai mare: marginile tăiate ascund titlul și logoul YouTube; apare abia după ce pornește, peste poster
  const BG_FRAME = 'pointer-events-none absolute top-1/2 left-1/2 h-[max(120vh,67.5vw)] w-[max(120vw,213.34vh)] -translate-1/2 border-0 opacity-0 transition-opacity duration-1000 [&.is-on]:opacity-100';

  /* ---------- FILMUL DIN SPATE: planuri care se schimbă de la o secțiune la alta ---------- */
  const film = $('#film'), clips = film ? [...film.children] : [];
  let clipOn = -1;
  // iframe-ul se pune o dată și rămâne; între secțiuni doar pornim și oprim clipurile
  const ensure = (box) => { if (box && !box.querySelector('iframe')) box.appendChild(ytFrame(box.dataset.yt, true, BG_FRAME)); };
  const frameOf = (i) => clips[i]?.querySelector('iframe');
  function show(i) {
    if (i === clipOn || !clips[i]) return;
    if (clipOn >= 0) {
      const old = clips[clipOn]; old.classList.remove('is-on');
      setTimeout(() => { if (!old.classList.contains('is-on')) ytSay(old.querySelector('iframe'), 'pauseVideo'); }, 1700);
    }
    clipOn = i;
    ensure(clips[i]); ensure(clips[i + 1]);   // și pe următorul, ca să fie gata când ajungi la el
    clips[i].classList.add('is-on');
    ytSay(frameOf(i), 'playVideo');
  }
  const pauseFilm = () => clips.forEach((c) => ytSay(c.querySelector('iframe'), 'pauseVideo'));
  // primul clip se pregătește imediat după ce s-a încărcat pagina, ca să fie deja pornit când ajungi la el
  addEventListener('load', () => setTimeout(() => ensure(clips[0]), 1200), { once: true });

  /* ---------- NAVBAR ---------- */
  const nav = $('#nav');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY, solid = y > innerHeight * .85;
    nav.classList.toggle('is-solid', solid);
    if (solid && y > lastY + 4) nav.classList.add('is-hidden');
    if (y < lastY - 4 || !solid) nav.classList.remove('is-hidden');
    lastY = y;
  }, { passive: true });
  const burger = $('#burger'), menu = $('#menu');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open); menu.hidden = !open;
    $('span', burger).textContent = open ? 'Închide' : 'Meniu';
    if (open && motion) gsap.from($$('a', menu), { yPercent: 40, opacity: 0, stagger: .07, duration: .9, ease: 'power4.out' });
  });

  /* ---------- scroll lin ---------- */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new Lenis({ lerp: .09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  }
  const go = (y) => { if (lenis) lenis.scrollTo(y, { duration: 1.6 }); else if (typeof y === 'number') scrollTo({ top: y }); else y.scrollIntoView(); };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const el = $(a.getAttribute('href')); if (!el) return;
    e.preventDefault(); if (!menu.hidden) burger.click(); go(el);
  }));

  /* =================== ȘCOALA: hero fix + povestea peste film =================== */
  function acasa() {
    function heroIn() {
      if (!motion) return;
      // poza are deja scale 1.02 din CSS; transformul GSAP vine peste ea și se șterge la final
      gsap.fromTo('[data-hero] img', { scale: 1.12 }, { scale: 1, duration: 2.4, ease: 'power3.out', clearProps: 'transform' });
      gsap.fromTo(split($('#heroTitle')), { yPercent: 105 }, { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: .012, delay: .35 });
      gsap.from('[data-hero-in]', { y: 24, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: .12, delay: .6 });
      gsap.from('#nav', { opacity: 0, y: -12, duration: 1, delay: .5, ease: 'power3.out' });
    }

    /* filmul din spate pornește când ajungi la poveste; fiecare secțiune își aduce planul ei */
    function story() {
      if (!motion || !window.ScrollTrigger) { show(0); return; }
      ScrollTrigger.create({ trigger: '#scoala', start: 'top bottom', once: true, onEnter: () => show(0) });
      $$('[data-film]').forEach((sec) => {
        const i = +sec.dataset.film;
        ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onEnter: () => show(i), onEnterBack: () => show(i) });
      });
      ScrollTrigger.create({ trigger: '#scoala', start: 'top bottom', end: 'bottom top',
        onLeave: pauseFilm, onEnterBack: () => ytSay(frameOf(clipOn), 'playVideo') });
      $$('[data-beat]').forEach((b) => {
        const h = $('h2', b), pic = $('figure', b), rest = $$('[data-rest]', b);
        const tl = gsap.timeline({ scrollTrigger: { trigger: b, start: 'top 75%', toggleActions: 'play none none reverse' } });
        tl.fromTo(split(h), { yPercent: 105 }, { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: .015 }, 0);
        if (rest.length) tl.fromTo(rest, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .1 }, .2);
        if (pic) {
          tl.fromTo(pic, { clipPath: 'inset(12% 10% 12% 10% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.3, ease: 'power3.inOut' }, 0)
            .fromTo($('img', pic), { scale: 1.2 }, { scale: 1, duration: 1.6, ease: 'power3.out' }, 0);
          gsap.fromTo(pic, { y: 40 }, { y: -40, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true } });
        }
      });
    }
    story();
    heroIn();
  }

  /* =================== GALERIA: scroll orizontal nativ (swipe, trackpad, săgeți) =================== */
  function galerie() {
    const frames = $$('#reel > li'), track = $('#reel'), nEl = $('#reelN');
    const prev = $('[data-reel="prev"]'), next = $('[data-reel="next"]');
    const amb = [$('#ambA'), $('#ambB')]; let ambI = 0;
    const total = String(frames.length).padStart(2, '0');
    const mediaOf = (fr) => $('img', fr);
    const poster = (fr) => { const m = mediaOf(fr); return m.currentSrc || m.src; };

    let active = -1;
    function activate(i) {
      if (i === active) return;
      active = i;
      frames.forEach((fr, j) => fr.classList.toggle('is-on', j === i));
      autoplay();
      nEl.textContent = `${String(i + 1).padStart(2, '0')} / ${total}`;
      prev.disabled = i === 0; next.disabled = i === frames.length - 1;
      ambI ^= 1; amb[ambI].src = poster(frames[i]); amb[ambI].classList.add('is-on'); amb[ambI ^ 1].classList.remove('is-on');
    }
    // clipurile pornesc singure (fără sunet, în buclă) când cadrul lor e în mijloc și galeria e pe ecran
    const GAL_FRAME = 'pointer-events-none absolute top-1/2 left-1/2 h-[118%] w-[118%] -translate-1/2 border-0 opacity-0 transition-opacity duration-700 [&.is-on]:opacity-100';
    let galVisible = false;
    function autoplay() {
      frames.forEach((fr, j) => {
        const img = mediaOf(fr), on = galVisible && j === active && img.dataset.yt;
        const f = $('iframe', fr), badge = $('span[aria-hidden]', fr);
        if (on && !f) {
          fr.appendChild(ytFrame(img.dataset.yt, true, GAL_FRAME));
        } else if (!on && f) { f.remove(); badge?.classList.remove('opacity-0'); }
      });
    }
    new IntersectionObserver(([e]) => { galVisible = e.isIntersecting; autoplay(); }, { threshold: .25 }).observe($('#galerie'));

    // cadrul cel mai aproape de mijlocul rolei e cel treaz
    const nearest = () => {
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0, d = Infinity;
      frames.forEach((f, j) => { const dd = Math.abs(f.offsetLeft + f.offsetWidth / 2 - mid); if (dd < d) { d = dd; best = j; } });
      return best;
    };
    let raf = 0;
    track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => activate(nearest())); }, { passive: true });
    const goTo = (i) => {
      const f = frames[Math.max(0, Math.min(frames.length - 1, i))];
      track.scrollTo({ left: f.offsetLeft + f.offsetWidth / 2 - track.clientWidth / 2, behavior: RM ? 'auto' : 'smooth' });
    };
    prev.addEventListener('click', () => goTo(active - 1));
    next.addEventListener('click', () => goTo(active + 1));
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(active + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(active - 1); }
    });
    track.tabIndex = 0;
    activate(0);

    // click pe cadrul din mijloc: se mărește; pe altul: rola vine la el
    frames.forEach((fr, i) => fr.addEventListener('click', () => { if (i === active) openLb(i); else goTo(i); }));

    /* ---------- vizorul ---------- */
    const LB_MEDIA = 'max-h-full max-w-full rounded-card object-contain';
    const lb = $('#lb'), lbMedia = $('#lbMedia');
    let lbI = 0;
    function lbShow(i) {
      lbI = (i + frames.length) % frames.length;
      const src = mediaOf(frames[lbI]);
      let el;
      if (src.dataset.yt) {
        // clipurile vin de pe YouTube; rama are proporția posterului (orizontal sau vertical)
        const vertical = src.naturalHeight > src.naturalWidth;
        el = ytFrame(src.dataset.yt, false, `${LB_MEDIA} border-0 ${vertical ? 'aspect-[9/16] h-full w-auto' : 'aspect-video w-full h-auto'}`);
      } else {
        el = document.createElement('img'); el.className = LB_MEDIA; el.src = src.dataset.full; el.alt = src.alt;
      }
      lbMedia.replaceChildren(el);
      $('#lbN').textContent = `${String(lbI + 1).padStart(2, '0')} / ${total}`;
      if (motion) gsap.fromTo(el, { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .5, ease: 'power3.out' });
    }
    function openLb(i) { galVisible = false; autoplay(); lbShow(i); lb.showModal(); if (lenis) lenis.stop(); }
    lb.addEventListener('close', () => { lbMedia.replaceChildren(); if (lenis) lenis.start(); galVisible = true; goTo(lbI); autoplay(); });
    lb.addEventListener('click', (e) => {
      const b = e.target.closest('[data-lb]');
      if (b) { const a = b.dataset.lb; if (a === 'close') lb.close(); else lbShow(lbI + (a === 'next' ? 1 : -1)); return; }
      if (e.target === lb || e.target === lbMedia) lb.close();
    });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') lbShow(lbI + 1);
      if (e.key === 'ArrowLeft') lbShow(lbI - 1);
    });
    let x0 = null;
    lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) lbShow(lbI + (dx < 0 ? 1 : -1));
    });
  }

  /* =================== DONEAZĂ: același card în hero și la final =================== */
  function doneaza() {
    const ALL = ['Către: Fundația Educatio Plena', 'IBAN lei: RO77 RZBR 0000 0600 1886 6089', 'IBAN euro: RO27 RZBR 0000 0600 2135 5524',
      'Banca: Raiffeisen Bank, BIC RZBRROBU', 'Mențiune: Africa Kusekwa'].join('\n');
    const copy = async (b, text) => {
      const label = b.dataset.label || (b.dataset.label = b.textContent);
      try { await navigator.clipboard.writeText(text); b.textContent = 'Copiat'; b.classList.add('ok'); }
      catch (e) { b.textContent = 'Selectează manual'; }
      setTimeout(() => { b.textContent = label; b.classList.remove('ok'); }, 2000);
    };

    const cards = $$('[data-give]');
    const gpays = [];
    cards.forEach((card) => {
      const other = $('[data-other]', card), radios = $$('input[type=radio]', card), transfer = $('[data-transfer]', card);
      const amount = () => {
        const o = parseInt(other.value, 10);
        if (o >= 5) return o;
        const r = radios.find((x) => x.checked); return r ? +r.value : 100;
      };
      const pay = () => {
        if (!CONFIG.stripeLink) {
          // fără link de plată încă: deschidem transferul din cardul ăsta și îl arătăm
          transfer.open = true;
          if (motion) gsap.fromTo(transfer, { boxShadow: 'inset 0 0 0 2px rgba(224,160,64,1)' }, { boxShadow: 'inset 0 0 0 2px rgba(224,160,64,0)', duration: 2, delay: .3 });
          transfer.scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' });
          return;
        }
        const u = new URL(CONFIG.stripeLink);
        u.searchParams.set(CONFIG.stripeAmountParam, amount() * 100);
        u.searchParams.set('client_reference_id', CONFIG.stripeTag);
        location.href = u.toString();
      };
      const refresh = () => { $('[data-amt-label]', card).textContent = `${amount()} lei`; };
      radios.forEach((r) => r.addEventListener('change', () => { other.value = ''; refresh(); }));
      other.addEventListener('input', () => { if (parseInt(other.value, 10) >= 5) radios.forEach((r) => (r.checked = false)); refresh(); });
      $('[data-card]', card).addEventListener('click', pay);
      $('[data-apple]', card).addEventListener('click', pay);
      gpays.push([$('[data-gpay]', card), pay]);
      $$('[data-copy]', card).forEach((b) => b.addEventListener('click', () => copy(b, b.dataset.copy)));
      const all = $('[data-copy-all]', card); all.addEventListener('click', () => copy(all, ALL));
    });

    // butoanele oficiale Apple Pay și Google Pay; plata propriu-zisă se face pe pagina Stripe
    const add = (src, extra) => { const sc = document.createElement('script'); sc.src = src; sc.async = true; Object.assign(sc, extra); document.body.appendChild(sc); };
    add('https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js', { crossOrigin: 'anonymous' });
    add('https://pay.google.com/gp/p/js/pay.js', {
      onload: () => {
        try {
          const client = new google.payments.api.PaymentsClient({ environment: CONFIG.googlePayEnv });
          gpays.forEach(([box, pay]) => box.appendChild(client.createButton({ onClick: pay, buttonType: 'donate', buttonColor: 'white', buttonSizeMode: 'fill', buttonLocale: 'en', buttonRadius: 10 })));
        } catch (e) { gpays.forEach(([box]) => box.remove()); }
      },
      onerror: () => gpays.forEach(([box]) => box.remove()),
    });

    // rama de jos urcă peste galerie și se lărgește; titlul urcă din mască
    if (motion) {
      const give = $('#doneaza');
      gsap.fromTo(give, { clipPath: 'inset(6% 5% 0% 5% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', ease: 'none',
        scrollTrigger: { trigger: give, start: 'top bottom', end: 'top 40%', scrub: true } });
      gsap.timeline({ scrollTrigger: { trigger: give, start: 'top 65%', toggleActions: 'play none none reverse' } })
        .fromTo(split($('#giveTitle')), { yPercent: 105 }, { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: .02 }, 0)
        .fromTo($$('[data-rest]', give), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, .2);
    }
  }

  acasa();
  galerie();
  doneaza();
})();
