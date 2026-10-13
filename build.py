#!/usr/bin/env python3
"""Scrie index.html din parts/head.html + pages/index.html, apoi compilează Tailwind în style.css.

Stilul e numai Tailwind. Clasele care se repetă (cadrele din galerie, clipurile din fundal, rândurile
de la transfer) stau o singură dată în CLASSES și se pun în pagină prin {nume}. Tot aici se pun singure
width/height la pozele locale. Rulează: python3 build.py"""
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).parent
V = '6'

META = dict(path='', title='Misiune în Tanzania: donează pentru Kusekwa | Integritas',
            desc='Clasa a XII-a a Liceului Integritas pleacă o lună la Kusekwa, lângă Bariadi, să construiască o biserică și un dispensar. Donează online sau prin transfer.',
            preload='<link rel="preload" href="assets/img/scoala-2400.webp" as="image">')

CLASSES = {
    # titlurile: Archivo gros, puțin lățit, strâns — ca un generic
    'display': 'font-[760] font-stretch-108% tracking-[-.04em]',
    'grain': "after:pointer-events-none after:absolute after:-inset-1/2 after:z-9 after:bg-[url(assets/img/grain.png)] "
             "after:opacity-[.06] after:mix-blend-overlay after:content-[''] after:animate-grain motion-reduce:after:animate-none",
    'navlink': 'rounded-btn px-3.5 py-[11px] text-[13.5px] leading-none font-semibold text-bone/65 transition-colors duration-300 hover:bg-bone/10 hover:text-bone',
    'menulink': 'flex items-baseline gap-3.5 text-[clamp(42px,12vw,64px)] leading-[1.05] font-[760] font-stretch-108% tracking-[-.035em]',
    'btn': 'inline-flex items-center justify-center rounded-btn px-6 py-[17px] text-[15px] leading-none font-[650] transition-colors duration-300 ease-soft',
    'heroimg': 'absolute inset-0 size-full object-cover opacity-0 scale-[1.12] saturate-[.88] contrast-[1.05] '
               '[transition:opacity_1.8s_var(--ease-soft),scale_9s_linear] [&.is-on]:opacity-100 [&.is-on]:scale-[1.02] '
               'motion-reduce:transition-none',
    'heroline': 'invisible absolute bottom-0 left-0 max-w-[12em] [&.is-on]:visible',
    'filmclip': 'absolute inset-0 size-full object-cover opacity-0 scale-[1.08] brightness-[.42] saturate-[.75] contrast-[1.05] '
                '[transition:opacity_1.6s_var(--ease-soft),scale_8s_linear] [&.is-on]:opacity-100 [&.is-on]:scale-100',
    'beat': 'mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-[clamp(28px,6vw,96px)] px-gut py-[9vh] '
            'wide:min-h-[76svh] wide:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] wide:py-[8vh]',
    'kicker': 'm-0 mb-4 text-[13px] leading-[1.3] font-semibold text-ochre',
    'beath': 'm-0 text-[clamp(40px,5.6vw,92px)] leading-[.98] font-[760] font-stretch-108% tracking-[-.04em] [text-shadow:0_2px_30px_rgba(0,0,0,.25)]',
    'beatpic': 'm-0 aspect-[4/3] overflow-hidden rounded-frame bg-panel shadow-[0_40px_90px_rgba(0,0,0,.4)]',
    'beatimg': 'size-full object-cover saturate-[.9] contrast-[1.04] will-change-transform',
    'amb': 'absolute inset-0 size-full object-cover opacity-0 blur-[70px] brightness-[.38] saturate-[1.2] '
           'transition-opacity duration-[1200ms] ease-soft [&.is-on]:opacity-100',
    'fr': 'relative flex-none snap-center cursor-zoom-in overflow-hidden rounded-frame bg-panel h-[56vh] wide:h-[min(64vh,720px)] '
          'opacity-60 scale-[.94] [transition:opacity_.6s_var(--ease-soft),scale_.6s_var(--ease-soft),box-shadow_.6s_var(--ease-soft)] '
          '[&.is-on]:opacity-100 [&.is-on]:scale-100 [&.is-on]:shadow-[0_40px_100px_rgba(0,0,0,.55)] motion-reduce:transition-none',
    'frmedia': 'block h-full w-auto max-w-[84vw] object-cover wide:max-w-none',
    'frvideo': 'aspect-[var(--ar,9/16)]',
    'bankrow': 'm-0 grid grid-cols-[5.4rem_minmax(0,1fr)_auto] items-center gap-2 border-t border-bone/15 py-3 text-sm',
    'banklabel': 'text-[11px] leading-tight font-bold tracking-[.06em] uppercase text-ochre',
    'bankvalue': 'font-sans text-sm leading-tight tracking-[.02em] tabular-nums break-words',
    'copybtn': 'cursor-pointer rounded-lg bg-bone/10 px-[11px] py-2 text-xs leading-none font-semibold transition-colors hover:bg-bone/20 '
               '[&.ok]:bg-ochre [&.ok]:text-ink',
    'amount': 'grid h-14 cursor-pointer place-items-center rounded-btn bg-raise text-[19px] leading-none font-bold tabular-nums transition-colors '
              'hover:shadow-[inset_0_0_0_1px_rgba(242,236,227,.35)] peer-checked:bg-bone peer-checked:text-ink '
              'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ochre',
    'foothead': 'm-0 mb-3 text-xs leading-none font-bold tracking-[.08em] uppercase text-ochre',
    'footlink': 'text-bone/80 underline-offset-4 transition-colors hover:text-bone hover:underline',
    'social': 'grid size-10 place-items-center rounded-full bg-bone/10 text-bone transition-colors hover:bg-ochre hover:text-ink',
    'reelbtn': 'grid size-11 cursor-pointer place-items-center rounded-full bg-bone/10 text-[26px] leading-none text-bone transition-colors hover:bg-bone/20 disabled:cursor-default disabled:opacity-30',
    # secțiunile cu fundal pe toată lățimea își aliniază conținutul cu hero-ul (max 1440px, centrat)
    'alignpad': 'wide:px-[max(calc(var(--spacing-gut)-12px),calc(50%-732px+var(--spacing-gut)))]',
    'lbnav': 'absolute top-1/2 hidden size-[52px] -translate-y-1/2 cursor-pointer rounded-full bg-bone/10 text-[30px] leading-none hover:bg-bone/20 wide:block',
}

_dims = {}


def dims(src):
    if src not in _dims:
        out = subprocess.run(['identify', '-format', '%w %h', str(ROOT / src) + '[0]'], capture_output=True, text=True).stdout
        _dims[src] = out.split() if out else None
    return _dims[src]


def sized(html):
    def fix(m):
        tag = m.group(0)
        if ' width=' in tag:
            return tag
        src = re.search(r'\bsrc="(assets/[^"]+)"', tag)
        d = src and dims(src.group(1))
        return tag[:-1] + f' width="{d[0]}" height="{d[1]}">' if d else tag
    return re.sub(r'<img\b[^>]*>', fix, html)


def card(name):
    return (ROOT / 'parts' / 'card.html').read_text().replace('@', name).rstrip()


def fill(text):
    text = re.sub(r'\{card:(\w+)\}', lambda m: card(m.group(1)), text)
    return re.sub(r'\{(\w+)\}', lambda m: V if m.group(1) == 'v' else CLASSES[m.group(1)], text)


head = (ROOT / 'parts' / 'head.html').read_text().format(v=V, **META)
body = fill((ROOT / 'pages' / 'index.html').read_text())
(ROOT / 'index.html').write_text(sized(head + body))
print('index.html')

# adresele vechi (site-ul a fost o vreme pe mai multe pagini) duc la secțiunea lor
for old, anchor in {'drum': 'acasa', 'galerie': 'galerie', 'doneaza': 'doneaza'}.items():
    (ROOT / f'{old}.html').write_text(f'<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex">'
                                      f'<link rel="canonical" href="https://elod3.github.io/integritas-africa/">'
                                      f'<meta http-equiv="refresh" content="0; url=./#{anchor}"><title>Kusekwa</title>'
                                      f'<a href="./#{anchor}">Kusekwa</a>')

subprocess.run(['npx', 'tailwindcss', '-i', 'src/tailwind.css', '-o', 'style.css', '--minify'], cwd=ROOT, check=True)
