"""Traducerile paginii: textul românesc (originalul) → engleză și spaniolă.

Cheia e textul exact din pagina românească (un nod de text sau valoarea unui atribut: alt, aria-label,
placeholder, content, title). build.py le caută pe rând și se oprește dacă rămâne text netradus.
Se traduce strict ce scrie în română, fără adaosuri. Moneda: „lei” devine „RON” (aceeași monedă).
"""

LANGS = {
    # cod: (fișier, html lang, og:locale, eticheta din comutator)
    'ro': ('index.html', 'ro', 'ro_RO', 'RO'),
    'en': ('en.html', 'en', 'en_US', 'EN'),
    'es': ('es.html', 'es', 'es_ES', 'ES'),
}

T = {
    # ---------- <head> ----------
    'Misiune în Tanzania: donează pentru Kusekwa | Integritas': (
        'Mission to Tanzania: donate for Kusekwa | Integritas',
        'Misión en Tanzania: dona para Kusekwa | Integritas'),
    'Clasa a XII-a a Liceului Integritas pleacă o lună la Kusekwa, lângă Bariadi, să construiască o biserică și un dispensar. Donează online sau prin transfer.': (
        'The 12th grade of Integritas High School is going to Kusekwa, near Bariadi, for a month to build a church and a clinic. Donate online or by bank transfer.',
        'La clase de 12.º del Liceo Integritas se va un mes a Kusekwa, cerca de Bariadi, para construir una iglesia y un dispensario. Dona en línea o por transferencia.'),
    'Copiii de la școala Kusekwa, lângă Bariadi, Tanzania': (
        'Children at Kusekwa School near Bariadi, Tanzania',
        'Niños de la escuela Kusekwa, cerca de Bariadi, Tanzania'),
    'Misiune în Tanzania: biserică și dispensar la Kusekwa': (
        'Mission to Tanzania: a church and a clinic at Kusekwa',
        'Misión en Tanzania: una iglesia y un dispensario en Kusekwa'),
    'Clasa a XII-a a Liceului Internațional Integritas, 30 de oameni, construiește o lună o biserică și un dispensar la școala Kusekwa.': (
        'The 12th grade of Integritas International High School, 30 people, spends a month building a church and a clinic at Kusekwa School.',
        'La clase de 12.º del Liceo Internacional Integritas, 30 personas, construye durante un mes una iglesia y un dispensario en la escuela Kusekwa.'),

    # ---------- bara de sus, meniul ----------
    'Liceul Internațional Integritas, la începutul paginii': (
        'Integritas International High School, back to top',
        'Liceo Internacional Integritas, volver arriba'),
    'Liceul Internațional Integritas': ('Integritas International High School', 'Liceo Internacional Integritas'),
    'Secțiuni': ('Sections', 'Secciones'),
    'Galerie': ('Gallery', 'Galería'),
    'Donează': ('Donate', 'Donar'),
    'Meniu': ('Menu', 'Menú'),
    'Limba': ('Language', 'Idioma'),

    # ---------- hero ----------
    'Copiii de la grădinița și școala primară Kusekwa, în fața clădirii, lângă Bariadi': (
        'Children from Kusekwa kindergarten and primary school in front of the building, near Bariadi',
        'Niños del jardín de infancia y la escuela primaria Kusekwa, delante del edificio, cerca de Bariadi'),
    'Misiune Tanzania · 12 ianuarie – 10 februarie 2027': (
        'Tanzania mission · 12 January – 10 February 2027',
        'Misión Tanzania · 12 de enero – 10 de febrero de 2027'),
    'Ajută-ne să construim o biserică și un dispensar în Tanzania.': (
        'Help us build a church and a clinic in Tanzania.',
        'Ayúdanos a construir una iglesia y un dispensario en Tanzania.'),
    '30 de oameni de la Liceul Integritas, dintre care 20 de elevi, pleacă o lună la școala Kusekwa, lângă Bariadi. Pune și tu o cărămidă.': (
        '30 people from Integritas High School, 20 of them students, are going to Kusekwa School near Bariadi for a month. Add a brick of your own.',
        '30 personas del Liceo Integritas, 20 de ellas alumnos, se van un mes a la escuela Kusekwa, cerca de Bariadi. Pon tú también un ladrillo.'),

    # ---------- cardul de donație ----------
    'Pune și tu o cărămidă': ('Add a brick of your own', 'Pon tú también un ladrillo'),
    'Alege suma': ('Choose an amount', 'Elige un importe'),
    '50 lei': ('50 RON', '50 RON'),
    '100 lei': ('100 RON', '100 RON'),
    '250 lei': ('250 RON', '250 RON'),
    '500 lei': ('500 RON', '500 RON'),
    'Altă sumă': ('Other amount', 'Otro importe'),
    'lei': ('RON', 'RON'),
    'Altă sumă, în lei': ('Other amount, in RON', 'Otro importe, en RON'),
    'cu cardul': ('by card', 'con tarjeta'),
    'ro-RO': ('en-US', 'es-ES'),
    'Sau prin transfer bancar': ('Or by bank transfer', 'O por transferencia bancaria'),
    'Către': ('To', 'Para'),
    'IBAN lei': ('IBAN RON', 'IBAN RON'),
    'IBAN euro': ('IBAN EUR', 'IBAN EUR'),
    'Mențiune': ('Reference', 'Concepto'),
    'Banca': ('Bank', 'Banco'),
    'Copiază': ('Copy', 'Copiar'),
    'Cu mențiunea „Africa Kusekwa”, fundația știe că banii sunt pentru misiune.': (
        'With the reference “Africa Kusekwa”, the foundation knows the money is for the mission.',
        'Con el concepto «Africa Kusekwa», la fundación sabe que el dinero es para la misión.'),
    'Copiază toate datele': ('Copy all details', 'Copiar todos los datos'),
    'Banii ajung la Fundația Educatio Plena, fundația Liceului Integritas.': (
        'The money goes to Fundația Educatio Plena, the foundation of Integritas High School.',
        'El dinero llega a la Fundația Educatio Plena, la fundación del Liceo Integritas.'),

    # ---------- clipurile ----------
    'Visul clasei a XII-a': ('The 12th grade’s dream', 'El sueño de la clase de 12.º'),

    # ---------- școala ----------
    'Peste 700 de elevi.': ('Over 700 students.', 'Más de 700 alumnos.'),
    'O școală cu multe nevoi.': ('A school with many needs.', 'Una escuela con muchas necesidades.'),
    'Elevii școlii Kusekwa, aliniați în curte': (
        'Kusekwa students lined up in the schoolyard',
        'Alumnos de la escuela Kusekwa, en fila en el patio'),
    'Clase pline.': ('Full classrooms.', 'Aulas llenas.'),
    'Dotări puține.': ('Little equipment.', 'Pocos medios.'),
    'Elevi în bănci, într-o clasă plină': (
        'Students at their desks in a full classroom',
        'Alumnos en sus pupitres, en un aula llena'),
    'Biserica se adună': ('The church meets', 'La iglesia se reúne'),
    'în sala de mese.': ('in the dining hall.', 'en el comedor.'),
    'Adunarea bisericii Kusekwa Memorial, în sala școlii': (
        'The Kusekwa Memorial church gathered in the school hall',
        'La congregación de Kusekwa Memorial, en la sala de la escuela'),
    '30 de oameni.': ('30 people.', '30 personas.'),
    'O lună.': ('One month.', 'Un mes.'),
    '20 de elevi și câțiva adulți pricepuți. Construim o biserică și un cabinet medical, ținem ore la clase și ducem alimente, rechizite și produse de igienă familiilor celor mai sărace. E al patrulea an la rând în care Integritas merge în Africa.': (
        '20 students and a few skilled adults. We are building a church and a medical clinic, teaching classes, and bringing food, school supplies and hygiene products to the poorest families. This is the fourth year in a row that Integritas has gone to Africa.',
        '20 alumnos y algunos adultos con oficio. Construimos una iglesia y un consultorio médico, damos clases y llevamos alimentos, material escolar y productos de higiene a las familias más pobres. Es el cuarto año seguido que Integritas va a África.'),
    'Clasa a XII-a a Liceului Integritas, în hanorace vișinii, pe dealul de lângă școală': (
        'The 12th grade of Integritas High School in maroon hoodies, on the hill next to the school',
        'La clase de 12.º del Liceo Integritas, con sudaderas granates, en la colina junto a la escuela'),

    # ---------- galeria ----------
    'Poza dinainte': ('Previous photo', 'Foto anterior'),
    'Poza următoare': ('Next photo', 'Foto siguiente'),
    'Adunarea de la Kusekwa, sub acoperișul de tablă': ('The Kusekwa congregation under the tin roof', 'La congregación de Kusekwa, bajo el techo de chapa'),
    'Elevii școlii, în curte, în uniforme mov': ('The school’s students in the yard, in purple uniforms', 'Los alumnos de la escuela en el patio, con uniformes morados'),
    'Sala mare, plină de elevi': ('The main hall, full of students', 'La sala grande, llena de alumnos'),
    'Copii și un profesor de la Kusekwa, de aproape': ('Children and a teacher from Kusekwa, up close', 'Niños y un profesor de Kusekwa, de cerca'),
    'Elevii, în jurul arcului de lemn al viitoarei biserici': ('Students around the wooden arch of the future church', 'Los alumnos, alrededor del arco de madera de la futura iglesia'),
    'Se măsoară fundația din grinzi': ('Measuring the beam foundation', 'Midiendo los cimientos de vigas'),
    'Cadrul fundației, pe teren': ('The foundation frame on site', 'El marco de los cimientos, en el terreno'),
    'Copii strânși în jurul unui telefon, pe iarbă': ('Children gathered around a phone on the grass', 'Niños reunidos alrededor de un teléfono, sobre la hierba'),
    'Elevii, în două rânduri, pe terenul școlii': ('Students in two rows on the school grounds', 'Los alumnos, en dos filas, en el terreno de la escuela'),
    'Scânduri descărcate lângă școală': ('Planks unloaded next to the school', 'Tablones descargados junto a la escuela'),
    'Arcul de lemn, ridicat pe teren': ('The wooden arch, raised on site', 'El arco de madera, levantado en el terreno'),
    'O girafă în savană': ('A giraffe in the savanna', 'Una jirafa en la sabana'),
    'Un elefant, lângă drum': ('An elephant by the road', 'Un elefante junto al camino'),
    'Elevii de la Integritas și sute de elevi africani, în sala cea mare': ('Integritas students and hundreds of African students in the main hall', 'Alumnos de Integritas y cientos de alumnos africanos, en la sala grande'),
    'Clip: Copiii fac cu mâna spre cameră': ('Video: Children waving at the camera', 'Vídeo: Los niños saludan a la cámara'),
    'Selfie cu două eleve de la Integritas și o clasă întreagă de copii': ('A selfie with two Integritas students and a whole class of children', 'Selfie de dos alumnas de Integritas con toda una clase de niños'),
    'Un elev de la Integritas face selfie cu o clasă care lucrează în bănci': ('An Integritas student takes a selfie with a class working at their desks', 'Un alumno de Integritas se hace un selfie con una clase que trabaja en los pupitres'),
    'Clip: O elevă de la Integritas desenează pe tablă': ('Video: An Integritas student drawing on the blackboard', 'Vídeo: Una alumna de Integritas dibuja en la pizarra'),
    'O stradă cu blocuri, mașini parcate și cer senin': ('A street with apartment blocks, parked cars and a clear sky', 'Una calle con bloques de pisos, coches aparcados y el cielo despejado'),
    'Atelierul: saci de ciment, scânduri și o bancă de lucru': ('The workshop: bags of cement, planks and a workbench', 'El taller: sacos de cemento, tablones y un banco de trabajo'),
    'Doi oameni sudează, cu scântei, în atelier': ('Two people welding in the workshop, sparks flying', 'Dos personas sueldan entre chispas en el taller'),
    'Clip: Se taie o placă cu fierăstrăul': ('Video: Sawing a board', 'Vídeo: Se corta una tabla con la sierra'),
    'Un profesor de la Integritas îi strânge mâna unui meșter, în atelier': ('An Integritas teacher shakes hands with a craftsman in the workshop', 'Un profesor de Integritas le da la mano a un artesano en el taller'),
    'Trei oameni la o bancă nouă, făcută în atelier': ('Three people at a new bench made in the workshop', 'Tres personas junto a un banco nuevo hecho en el taller'),

    # ---------- donația de la final ----------
    'Picătura fiecăruia': ('Every drop', 'Cada gota'),
    'contează.': ('counts.', 'cuenta.'),
    'Cei 700 de elevi merită condiții mai bune pentru educație și închinare.': (
        'These 700 students deserve better conditions for learning and worship.',
        'Estos 700 alumnos merecen mejores condiciones para la educación y la adoración.'),
    'Banii nu merg pe drum.': ('The money doesn’t go on travel.', 'El dinero no se va en el viaje.'),
    'Fiecare elev și adult își plătește singur călătoria. Tot ce donezi ajunge în misiunea din Tanzania.': (
        'Every student and adult pays for their own trip. Everything you give goes to the mission in Tanzania.',
        'Cada alumno y cada adulto se paga su propio viaje. Todo lo que donas llega a la misión en Tanzania.'),

    # ---------- footer ----------
    'Program': ('Opening hours', 'Horario'),
    'Luni – joi: 08:00 – 18:00': ('Monday – Thursday: 08:00 – 18:00', 'Lunes a jueves: 08:00 – 18:00'),
    'Vineri: 08:00 – 13:00': ('Friday: 08:00 – 13:00', 'Viernes: 08:00 – 13:00'),
    'Contact': ('Contact', 'Contacto'),
    'Linkuri utile': ('Useful links', 'Enlaces útiles'),
    'Acreditări': ('Accreditation', 'Acreditaciones'),
    'Informații pentru elevi': ('Information for students', 'Información para alumnos'),
    '2025 – © Liceul Internațional Integritas': ('2025 – © Integritas International High School', '2025 – © Liceo Internacional Integritas'),

    # ---------- poza mărită ----------
    'Poza mărită': ('Enlarged photo', 'Foto ampliada'),
    'Închide': ('Close', 'Cerrar'),
    'Înapoi': ('Previous', 'Anterior'),
    'Înainte': ('Next', 'Siguiente'),
}

# textele din app.js (meniul, butoanele de copiere, datele pentru transfer)
JS = {
    'ro': dict(menu='Meniu', close='Închide', copied='Copiat', manual='Selectează manual', cur='lei', clip='Clip de la Kusekwa',
               all=['Către: Fundația Educatio Plena', 'IBAN lei: RO77 RZBR 0000 0600 1886 6089', 'IBAN euro: RO27 RZBR 0000 0600 2135 5524',
                    'Banca: Raiffeisen Bank, BIC RZBRROBU', 'Mențiune: Africa Kusekwa']),
    'en': dict(menu='Menu', close='Close', copied='Copied', manual='Select it manually', cur='RON', clip='Video from Kusekwa',
               all=['To: Fundația Educatio Plena', 'IBAN RON: RO77 RZBR 0000 0600 1886 6089', 'IBAN EUR: RO27 RZBR 0000 0600 2135 5524',
                    'Bank: Raiffeisen Bank, BIC RZBRROBU', 'Reference: Africa Kusekwa']),
    'es': dict(menu='Menú', close='Cerrar', copied='Copiado', manual='Selecciónalo a mano', cur='RON', clip='Vídeo de Kusekwa',
               all=['Para: Fundația Educatio Plena', 'IBAN RON: RO77 RZBR 0000 0600 1886 6089', 'IBAN EUR: RO27 RZBR 0000 0600 2135 5524',
                    'Banco: Raiffeisen Bank, BIC RZBRROBU', 'Concepto: Africa Kusekwa']),
}
