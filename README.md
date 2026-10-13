**Site: https://elod3.github.io/integritas-africa/**

# Kusekwa

Pagina misiunii clasei a XII-a de la Liceul Internațional Integritas: o lună la Școala Kusekwa,
lângă Bariadi, în Tanzania (12 ianuarie – 10 februarie 2027).

O singură pagină, statică (fără server): genericul cu drumul, școala, galeria și donația.
Stilul e numai **Tailwind CSS v4**.

## Plata online (Stripe)

Pagina are deja sumele, butoanele Apple Pay / Google Pay și „Donează cu cardul”. Ele trimit omul
pe un **Stripe Payment Link**, cu suma aleasă deja completată. Nu e nevoie de server.

1. În Stripe (contul fundației): **Payment Links → New**.
2. Produs: `Donație – Misiunea Africa (Kusekwa)`, preț: **Customers choose what to pay**, monedă **RON**.
3. **Create link** și copiază adresa (`https://buy.stripe.com/...`).
4. În `app.js`, sus de tot, pune adresa în `CONFIG.stripeLink`. Când e live, `googlePayEnv: 'PRODUCTION'`.

Fiecare plată ajunge în Stripe cu `client_reference_id = africa-kusekwa`, deci se vede că e pentru Africa.
Cât timp `stripeLink` e gol, butoanele duc la transferul bancar (care se deschide singur).

Apple Pay apare doar unde merge (Safari pe Mac/iPhone). Pe alte browsere SDK-ul Apple îl ascunde.

## Transfer bancar

Fundația Educatio Plena, Raiffeisen Bank, cu mențiunea **Africa Kusekwa**. Datele sunt în `pages/index.html`.

## Cum modifici

```bash
npm install          # o dată: Tailwind CLI
python3 build.py     # scrie index.html și compilează Tailwind în style.css
python3 -m http.server 8763   # apoi http://localhost:8763
```

- `pages/index.html`: conținutul paginii, cu clase Tailwind. `{nume}` = o listă de clase din `build.py`
  (`CLASSES`), pentru clasele care se repetă (cadrele din galerie, rândurile de la transfer).
- `parts/head.html`: `<head>` (titlu, descriere, imaginea pentru WhatsApp/Facebook).
- `src/tailwind.css`: tema (culori, font, margini, colțuri) și fontul local Archivo.
- `app.js`: animațiile (GSAP + ScrollTrigger + Lenis, locale în `assets/vendor/`) și plata.
- **Nu edita `index.html` și `style.css` direct**: le rescrie `build.py`.

## Publicare

Site-ul e publicat cu GitHub Pages direct din ramura `main` a acestui repo (rădăcina). După `python3 build.py`,
un commit + push îl pune online. `drum.html`, `galerie.html`, `doneaza.html` doar redirecționează adrese vechi.
