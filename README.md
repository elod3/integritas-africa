**Site: https://elod3.github.io/integritas-africa/**

# Kusekwa

Pagina misiunii clasei a XII-a de la Liceul Internațional Integritas: o lună la Școala Kusekwa,
lângă Bariadi, în Tanzania (12 ianuarie – 10 februarie 2027).

O singură pagină, statică (fără server): hero cu donația, școala, galeria și donația din nou.
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

## Clipurile

- **Buclele** (fundalul secțiunilor și cadrele cu clip din galerie) sunt MP4-uri mici, fără sunet, în `assets/loop/`
  (~2,3 MB toate, fiecare se încarcă abia când e nevoie de el). N-au butoane peste ele, spre deosebire de playerul YouTube.
- **Clipurile întregi, cu sunet** sunt pe YouTube, **nelistate**, pe canalul lui Előd; click pe un clip din galerie
  îl deschide de acolo în vizor (`data-yt="<id>"` în `pages/index.html`).

| Clip | ID |
|---|---|
| Curtea școlii | As-tGlI0Fdw |
| În clasă | zyvZzugyF6s |
| Corul | 28YPTOssxh0 |
| Careul de dimineață | rMd4yMUqTeU |
| Copiii fac cu mâna | 8pc8_PnY3-w |
| La tablă | HVuLQVL8-h8 |
| În atelier | vm9Qisqb5tA |

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
- `parts/card.html`: cardul de donație (apare în hero și la final).
- `app.js`: animațiile (GSAP + ScrollTrigger + Lenis, locale în `assets/vendor/`), clipurile de pe YouTube și plata.
- **Nu edita `index.html` și `style.css` direct**: le rescrie `build.py`.

## Publicare

Site-ul e publicat cu GitHub Pages direct din ramura `main` a acestui repo (rădăcina). După `python3 build.py`,
un commit + push îl pune online. `drum.html`, `galerie.html`, `doneaza.html` doar redirecționează adrese vechi.
