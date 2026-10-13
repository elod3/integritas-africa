/* Kusekwa — o singură pagină: genericul cu drumul, școala, galeria, donația (Stripe sau transfer).
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

  /* ---------- LOADER: cartela, drumul oraș cu oraș, apoi școala într-o ramă care devine hero-ul ---------- */
  const ROUTE = [['Târgu Mureș', 0], ['Budapesta', 432], ['Istanbul', 1497], ['Nairobi', 6272], ['Bariadi', 6737]];
  async function runLoader(onDone) {
    const loader = $('#loader');
    let seen = false; try { seen = sessionStorage.getItem('kk5-seen') === '1'; } catch (e) {}
    if (!motion) { loader.remove(); html.classList.remove('is-loading'); return false; }
    // la fiecare intrare; a doua oară în aceeași vizită merge mai repede, iar un click îl sare
    let speed = seen ? 1.8 : 1;
    gsap.globalTimeline.timeScale(speed);
    loader.addEventListener('click', () => { speed = 6; gsap.globalTimeline.timeScale(6); });
    const pause = (ms) => wait(ms / speed);
    const frame = $('#ldFrame'), card = $('#ldCard'), route = $('#ldRoute'), city = $('#ldCity'), kmEl = $('#ldKm'), line = $('#ldLine');
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    // rama în pixeli, ca GSAP să poată anima clip-path-ul fără salturi
    const vw = innerWidth / 100, vh = innerHeight / 100, narrow = innerWidth <= 820;
    const ty = narrow ? innerHeight / 2 - 30 * vw : innerHeight / 2 - Math.min(17 * vw, 19 * vh);
    const tx = narrow ? 8 * vw : innerWidth / 2 - Math.min(30 * vw, 34 * vh);
    // start și final dați amândoi, cu câte 4 valori: Firefox scurtează inset(a b a b) la inset(a b), iar dacă GSAP
    // citește valoarea din pagină, perechile nu se mai potrivesc și rama crește din colțul stânga-jos
    const ramaMica = `inset(${ty}px ${tx}px ${ty}px ${tx}px round 24px)`;
    gsap.set(frame, { opacity: 0, clipPath: ramaMica });
    gsap.fromTo(card.children, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .9, stagger: .3, ease: 'power2.out' });
    await Promise.all([pause(1500), fonts, Promise.race([loaded($('img', frame)), wait(3500)])]);
    await gsap.to(card, { opacity: 0, duration: .45, ease: 'power1.in' });

    // drumul: fiecare oraș urcă din mască, kilometrii se adună până la el
    gsap.set(route, { opacity: 1 });
    const km = { v: 0 };
    for (const [k, [name, dist]] of ROUTE.entries()) {
      city.textContent = name;
      gsap.fromTo(split(city, true), { yPercent: 105 }, { yPercent: 0, duration: .7, ease: 'power4.out', stagger: .018 });
      gsap.to(km, { v: dist, duration: .6, ease: 'power2.out', onUpdate: () => (kmEl.textContent = fmt(km.v)) });
      gsap.to(line, { width: `${(k / (ROUTE.length - 1)) * 100}%`, duration: .6, ease: 'power2.out' });
      await pause(k === ROUTE.length - 1 ? 1000 : 720);
      if (k < ROUTE.length - 1) await gsap.to(split(city), { yPercent: -105, duration: .25, ease: 'power3.in', stagger: .008 });
    }
    await gsap.to(route, { opacity: 0, duration: .4 });
    gsap.to('#ldSkip', { opacity: 0, duration: .3 });

    // școala apare în ramă, apoi rama se lărgește și devine hero-ul (același cadru: match cut)
    await gsap.fromTo(frame, { opacity: 0, scale: .94 }, { opacity: 1, scale: 1, duration: .8, ease: 'power3.out' });
    await pause(350);
    try { sessionStorage.setItem('kk5-seen', '1'); } catch (e) {}
    await gsap.fromTo(frame, { clipPath: ramaMica }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 1.25, ease: 'power4.inOut' });
    gsap.globalTimeline.timeScale(1);
    // rama are acum exact cadrul hero-ului (aceeași poză, aceeași scară): loaderul dispare dintr-o dată,
    // fără fade, ca să nu se vadă două poze una peste alta; umbra și textul hero-ului vin după
    html.classList.remove('is-loading');
    onDone();
    loader.remove();
    return true;
  }

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
  function rise(el, delay = 0) {
    const chars = split(el);
    if (motion) gsap.fromTo(chars, { yPercent: 105 }, { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: .02, delay });
  }

  /* ---------- FILMUL DIN SPATE: planuri care se schimbă de la o secțiune la alta ---------- */
  const film = $('#film'), clips = film ? [...film.children] : [];
  let clipOn = -1;
  const load = (v) => { if (v && v.tagName === 'VIDEO' && !v.src) { v.src = v.dataset.src; v.load(); } };
  function show(i) {
    if (i === clipOn || !clips[i]) return;
    if (clipOn >= 0) { const old = clips[clipOn]; old.classList.remove('is-on'); if (old.pause) setTimeout(() => old.pause(), 1700); }
    clipOn = i;
    const v = clips[i]; load(v); load(clips[i + 1]);
    v.classList.add('is-on'); if (v.play) v.play().catch(() => {});
  }

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

  /* =================== ȘCOALA: hero + povestea peste film =================== */
  function acasa() {
    /* ---------- HERO ---------- */
    const lines = $$('[data-line]'), imgs = $$('[data-hero] img'), heroN = $('#heroN'), heroBar = $('#heroBar');
    let slide = 0, slideT = null;
    const DWELL = 6000;
    const runBar = () => { if (motion) gsap.fromTo(heroBar, { width: '0%' }, { width: '100%', duration: DWELL / 1000, ease: 'none' }); };
    function showSlide(i) {
      const prev = slide; slide = i;
      imgs[prev].classList.remove('is-on'); imgs[i].classList.add('is-on');
      if (motion) gsap.to(split(lines[prev]), { yPercent: -105, duration: .6, ease: 'power3.in', stagger: .01, onComplete: () => lines[prev].classList.remove('is-on') });
      else lines[prev].classList.remove('is-on');
      lines[i].classList.add('is-on'); rise(lines[i], .35);
      heroN.textContent = String(i + 1).padStart(2, '0');
      runBar();
      clearTimeout(slideT);
      slideT = setTimeout(() => showSlide((slide + 1) % imgs.length), DWELL);
    }
    function heroIn(matchCut) {
      split(lines[0]);
      if (motion) {
        if (matchCut) gsap.from('[data-shade]', { opacity: 0, duration: 1.4, ease: 'power2.out' });
        // poza are deja scale 1.02 din CSS; transformul GSAP vine peste ea și se șterge la final
        else gsap.fromTo('[data-hero] img.is-on', { scale: 1.18 }, { scale: 1, duration: 2.6, ease: 'power3.out', clearProps: 'transform' });
        gsap.from('[data-hero-in]', { y: 24, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: .1, delay: .7 });
        gsap.from('#nav', { opacity: 0, y: -12, duration: 1, delay: .6, ease: 'power3.out' });
        rise(lines[0], .45);
      }
      if (!STILL) { runBar(); slideT = setTimeout(() => showSlide(1), DWELL); }
    }
    new IntersectionObserver(([e]) => {
      if (STILL || html.classList.contains('is-loading')) return;
      clearTimeout(slideT);
      if (e.isIntersecting) slideT = setTimeout(() => showSlide((slide + 1) % imgs.length), DWELL);
    }).observe($('#acasa'));
    /* hero-ul se strânge într-o ramă rotunjită și se stinge, iar în spate pornește filmul */
    function story() {
      if (!motion || !window.ScrollTrigger) { film.style.opacity = 1; show(0); return; }
      const heroEl = $('#acasa');
      gsap.timeline({ scrollTrigger: { trigger: heroEl, start: 'top top', end: '+=90%', scrub: .8, pin: true, pinSpacing: true, onEnter: () => show(0) } })
        .to('[data-hero-copy], [data-hero-count]', { opacity: 0, y: -30, duration: .3 }, 0)
        .fromTo(heroEl, { clipPath: 'inset(0.01% 0.02% 0.03% 0.04% round 0px)' }, { clipPath: 'inset(16% 12% 22% 12% round 28px)', duration: .7, ease: 'power2.inOut' }, 0)
        .to('[data-hero]', { scale: .92, duration: .7, ease: 'power2.inOut' }, 0)
        .to(film, { opacity: 1, duration: .5 }, .25)
        .to(heroEl, { opacity: 0, y: -60, duration: .3 }, .7);
      load(clips[0]);
      $$('[data-film]').forEach((sec) => {
        const i = +sec.dataset.film;
        ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onEnter: () => show(i), onEnterBack: () => show(i) });
      });
      ScrollTrigger.create({ trigger: '#scoala', start: 'top bottom', end: 'bottom top',
        onLeave: () => clips[clipOn] && clips[clipOn].pause(), onEnterBack: () => clips[clipOn] && clips[clipOn].play().catch(() => {}) });
      $$('[data-beat]').forEach((b) => {
        const h = $('h2', b), pic = $('figure', b), rest = $$('[data-rest]', b);
        const tl = gsap.timeline({ scrollTrigger: { trigger: b, start: 'top 70%', toggleActions: 'play none none reverse' } });
        tl.fromTo(split(h), { yPercent: 105 }, { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: .015 }, 0);
        if (rest.length) tl.fromTo(rest, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .1 }, .2);
        if (pic) {
          tl.fromTo(pic, { clipPath: 'inset(12% 10% 12% 10% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.3, ease: 'power3.inOut' }, 0)
            .fromTo($('img', pic), { scale: 1.2 }, { scale: 1, duration: 1.6, ease: 'power3.out' }, 0);
          gsap.fromTo(pic, { y: 50 }, { y: -50, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true } });
        }
      });
    }
    story();
    runLoader(() => heroIn(true)).then((played) => { if (!played) heroIn(false); });
  }

  /* =================== GALERIA =================== */
  function galerie() {
    const frames = $$('#reel > li'), track = $('#reel'), nEl = $('#reelN');
    const amb = [$('#ambA'), $('#ambB')]; let ambI = 0;
    const total = String(frames.length).padStart(2, '0');
    const poster = (fr) => { const m = $('img, video', fr); return m.tagName === 'VIDEO' ? m.poster : m.currentSrc || m.src; };
    const mediaOf = (fr) => $('img, video', fr);

    // cadrele video primesc proporția din poster, ca rama să aibă lățimea corectă înainte să pornească
    frames.forEach((fr) => {
      const v = $('video', fr); if (!v) return;
      const im = new Image(); im.onload = () => fr.style.setProperty('--ar', `${im.naturalWidth} / ${im.naturalHeight}`); im.src = v.poster;
    });

    let active = -1;
    function activate(i) {
      if (i === active) return;
      active = i;
      frames.forEach((fr, j) => {
        fr.classList.toggle('is-on', j === i);
        const v = $('video', fr);
        if (!v) return;
        if (j === i) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
      });
      nEl.textContent = `${String(i + 1).padStart(2, '0')} / ${total}`;
      ambI ^= 1; amb[ambI].src = poster(frames[i]); amb[ambI].classList.add('is-on'); amb[ambI ^ 1].classList.remove('is-on');
    }

    // poziția (în px de translație) la care cadrul i stă exact în mijloc
    const centerOf = (fr) => fr.offsetLeft + fr.offsetWidth / 2 - innerWidth / 2;
    let st = null;
    if (motion) {
      const max = () => centerOf(frames[frames.length - 1]);
      const min = () => centerOf(frames[0]);
      gsap.set(track, { x: -min() });
      const tween = gsap.fromTo(track, { x: () => -min() }, { x: () => -max(), ease: 'none' });
      st = ScrollTrigger.create({
        trigger: '#galerie', start: 'top top', end: () => '+=' + (max() - min()) * 1.1, pin: true, scrub: .6, animation: tween, invalidateOnRefresh: true,
        snap: { snapTo: (p) => { const c = frames.map((f) => (centerOf(f) - min()) / (max() - min())); return c.reduce((a, b) => Math.abs(b - p) < Math.abs(a - p) ? b : a); },
          duration: { min: .25, max: .7 }, ease: 'power2.inOut', delay: .08 },
        onUpdate: () => {
          const x = -gsap.getProperty(track, 'x') + innerWidth / 2;
          let best = 0, d = Infinity;
          frames.forEach((f, j) => { const dd = Math.abs(f.offsetLeft + f.offsetWidth / 2 - x); if (dd < d) { d = dd; best = j; } });
          activate(best);
        }
      });
      // imaginile au lățimea abia după încărcare: recalculăm
      Promise.all($$('#reel img').map(loaded)).then(() => ScrollTrigger.refresh());
      frames.forEach((f) => { const v = $('video', f); if (v) v.addEventListener('loadedmetadata', () => ScrollTrigger.refresh(), { once: true }); });
    } else {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) activate(frames.indexOf(e.target)); }), { root: track, threshold: .6 });
      frames.forEach((f) => io.observe(f));
    }
    activate(0);

    // click pe cadrul din mijloc: se mărește; pe altul: rola vine la el
    const goTo = (i) => {
      if (!st) { frames[i].scrollIntoView({ inline: 'center', block: 'nearest' }); return; }
      const p = (centerOf(frames[i]) - centerOf(frames[0])) / (centerOf(frames[frames.length - 1]) - centerOf(frames[0]));
      go(st.start + (st.end - st.start) * p);
    };
    frames.forEach((fr, i) => fr.addEventListener('click', () => { if (i === active) openLb(i); else goTo(i); }));

    /* ---------- vizorul ---------- */
    const LB_MEDIA = 'max-h-full max-w-full rounded-card object-contain';
    const lb = $('#lb'), lbMedia = $('#lbMedia');
    let lbI = 0;
    function lbShow(i) {
      lbI = (i + frames.length) % frames.length;
      const src = mediaOf(frames[lbI]);
      let el;
      if (src.tagName === 'VIDEO') {
        el = document.createElement('video'); el.className = LB_MEDIA;
        Object.assign(el, { src: src.dataset.src, poster: src.poster, muted: true, loop: true, playsInline: true, autoplay: true, controls: true });
      } else {
        el = document.createElement('img'); el.className = LB_MEDIA; el.src = src.dataset.full; el.alt = src.alt;
      }
      lbMedia.replaceChildren(el);
      $('#lbN').textContent = `${String(lbI + 1).padStart(2, '0')} / ${total}`;
      if (motion) gsap.fromTo(el, { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .6, ease: 'power3.out' });
    }
    function openLb(i) { lbShow(i); lb.showModal(); if (lenis) lenis.stop(); }
    lb.addEventListener('close', () => { lbMedia.replaceChildren(); if (lenis) lenis.start(); });
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

  /* =================== DONEAZĂ: Stripe (card, Apple Pay, Google Pay) sau transfer bancar =================== */
  function doneaza() {
    const amount = () => {
      const other = parseInt($('#amtOther').value, 10);
      if (other >= 5) return other;
      const r = $('input[name=amt]:checked'); return r ? +r.value : 100;
    };
    const transfer = $('#transfer');
    const pay = () => {
      if (!CONFIG.stripeLink) {
        // fără link de plată încă: ducem omul la transfer și îl arătăm
        transfer.open = true; go(transfer);
        if (motion) gsap.fromTo(transfer, { boxShadow: 'inset 0 0 0 2px rgba(224,160,64,1)' }, { boxShadow: 'inset 0 0 0 2px rgba(224,160,64,0)', duration: 2, delay: .8 });
        return;
      }
      const u = new URL(CONFIG.stripeLink);
      u.searchParams.set(CONFIG.stripeAmountParam, amount() * 100);
      u.searchParams.set('client_reference_id', CONFIG.stripeTag);
      location.href = u.toString();
    };
    const refresh = () => { $('#cardAmt').textContent = `${amount()} lei`; };
    $$('input[name=amt]').forEach((r) => r.addEventListener('change', () => { $('#amtOther').value = ''; refresh(); }));
    $('#amtOther').addEventListener('input', () => { if (parseInt($('#amtOther').value, 10) >= 5) $$('input[name=amt]').forEach((r) => (r.checked = false)); refresh(); });
    $('#cardPay').addEventListener('click', pay);
    $('#applePay').addEventListener('click', pay);
    // butoanele oficiale Apple Pay și Google Pay; plata propriu-zisă se face pe pagina Stripe
    const add = (src, extra) => { const sc = document.createElement('script'); sc.src = src; sc.async = true; Object.assign(sc, extra); document.body.appendChild(sc); };
    add('https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js', { crossOrigin: 'anonymous' });
    add('https://pay.google.com/gp/p/js/pay.js', {
      onload: () => {
        try {
          const client = new google.payments.api.PaymentsClient({ environment: CONFIG.googlePayEnv });
          $('#googlePay').appendChild(client.createButton({ onClick: pay, buttonType: 'donate', buttonColor: 'white', buttonSizeMode: 'fill', buttonLocale: 'en', buttonRadius: 10 }));
        } catch (e) { $('#googlePay').remove(); }
      },
      onerror: () => $('#googlePay').remove(),
    });

    const ALL = ['Către: Fundația Educatio Plena', 'IBAN lei: RO77 RZBR 0000 0600 1886 6089', 'IBAN euro: RO27 RZBR 0000 0600 2135 5524',
      'Banca: Raiffeisen Bank, BIC RZBRROBU', 'Mențiune: Africa Kusekwa'].join('\n');
    const copy = async (b, text, label) => {
      try { await navigator.clipboard.writeText(text); b.textContent = 'Copiat'; b.classList.add('ok'); }
      catch (e) { b.textContent = 'Selectează manual'; }
      setTimeout(() => { b.textContent = label; b.classList.remove('ok'); }, 2000);
    };
    $$('[data-copy]').forEach((b) => b.addEventListener('click', () => copy(b, b.dataset.copy, 'Copiază')));
    const all = $('#copyAll'); all.addEventListener('click', () => copy(all, ALL, 'Copiază toate datele'));

    // rama urcă peste galerie și se lărgește; titlul urcă din mască
    if (motion) {
      const give = $('#doneaza');
      gsap.fromTo(give, { clipPath: 'inset(6% 5% 0% 5% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', ease: 'none',
        scrollTrigger: { trigger: give, start: 'top bottom', end: 'top 30%', scrub: true } });
      gsap.timeline({ scrollTrigger: { trigger: give, start: 'top 60%', toggleActions: 'play none none reverse' } })
        .fromTo(split($('#giveTitle')), { yPercent: 105 }, { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: .02 }, 0)
        .fromTo($$('[data-rest]', give), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .1 }, .2);
    }
  }

  acasa();
  galerie();
  doneaza();
})();
