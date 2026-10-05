/*
  GERBERN DREI — INHALTE
  Hier pflegst du Bilder, ALT-Texte, PAST EVENTS und NETZWERK.
  Pro Galerie maximal 11 Bilder.

  ENGLISCH IST IMMER OPTIONAL:
  - Text: title_en, pastEvents_en, label_en, display_en usw.
    Fehlt die _en-Variante, bleibt im EN-Modus automatisch das Original stehen.
  - Slides können weiterhin einfach Strings sein: 'bild.jpg' = in DE und EN dasselbe.
  - Für eine englische Bildalternative: { image: 'bild.jpg', image_en: 'bild-en.jpg' }
    Fehlt bild-en.jpg im Ordner, fällt die Website automatisch auf bild.jpg zurück.
*/

window.SITE_CONTENT = {
  start: {
    title: 'START',
    images: [
      'stempel.jpg',
      'IG a side.jpg',
      'hall.jpg'
]
  },

  about: {
    title: 'ABOUT',
    images: [
      'IG b side.jpg',
      'fenster.jpg',
      'eingang skizze.jpg',
      'dach skizze.jpg',
      'dach foto.jpg'
    ],
    alt: [
      'Hier kommt der ALT-Text für a-side.jpg hin',
      'Hier kommt der ALT-Text für b-side.jpg hin',
      'Hier kommt der ALT-Text für eingang.jpg hin',
      'Hier kommt der ALT-Text für roof.jpg hin',
      'Hier kommt der ALT-Text für room.jpg hin',
      'Hier kommt der ALT-Text für trungpa.jpg hin'
    ]
  },

  aktuell: {
    title: 'AKTUELL',
    images: [
      'IG a side.jpg',
      'IG b side.jpg'
]
  },

  solothurn: {
    title: 'SOLOTHURN',
    images: [
      'krummturm.jpg',
      'oelberg.jpg',
      'felsenkapelle.jpg',
      'einsiedelei.jpg',
      'verena.jpg',
      'weissenstein.jpg',
      'ruettenen.jpg',
      'jesuiten.jpg',
      'aare.jpg'
]
  },

  kontakt: {
    title: 'KONTAKT',
    images: [
      'trungpa.jpg'
]
  },

  misc: {
    title: 'MISC',
    images: [
      'ukies.jpg',
      'plastik.jpg',
      'peace.jpg'
]
  },

  pastEvents: `2027

MÄRZ 15: Once upon a time there will neither this nor that
OKTOBER 11: Gestern war heute  noch morgen
NOVEMBER 01: Glory to Ukraine

2028

JANUAR 02: TBA

…`,


  legal: {
    imprint: 'Hier kommt dein kurzes Impressum hin.',
    imprint_en: 'Here comes your legal note.',
    privacy: 'Hier kommt deine kurze Datenschutzerklärung hin.',
    privacy_en: 'Here comes your privacy statement.'
  },

  network: [
    {
      label: 'Miguel Guldimann, Solothurn',
      url: 'https://www.zenmeditation.ch',
      display: 'www.zenmeditation.ch'
    },
    {
      label: 'Niklaus Zumstein, Solothurn',
      url: 'mailto:niklauszumstein@gmail.com',
      display: 'niklauszumstein@gmail.com',
      spaceAfter: true
    },
    {
      label: 'Shambhala Zentrum, Bern',
      url: 'https://bern.shambhala.org/',
      display: 'bern.shambhala.org'
    }

  ]
};
