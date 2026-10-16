/*
  GERBERN DREI — INHALTE
  Hier pflegst du Bilder, ALT-Texte, PAST EVENTS und NETZWERK.
  Pro Galerie maximal 12 Bilder.

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
      '01_hall.jpg',
      '02_stempel.jpg',
      '03_wenn-die-leute.png',
      '04_es-ist-leer.webp',
      '05_avoid-aggression.png'
    ]
  },

  about: {
    title: 'ABOUT',
    images: [
      '01_wenn-die-leute.png',
      '02_fenster.jpg',
      '03_eingang-skizze.jpg',
      '04_dach-foto.jpg',
      '05_can-i-use.webp',
      '06_dont-believe-something.png'
    ],
    alt: [
      'Hier kommt der ALT-Text für a-side.jpg hin',
      'Hier kommt der ALT-Text für b-side.jpg hin',
      'Hier kommt der ALT-Text für eingang.jpg hin',
      'Hier kommt der ALT-Text für roof.jpg hin',
      'Hier kommt der ALT-Text für room.jpg hin'
    ]
  },

  aktuell: {
    title: 'AKTUELL',
    images: [
      '01_flyer-front.png',
      '02_flyer-back.png',
      '03_nothing-makes-sense.webp',
      '04_love-and-compassion.png'
    ]
  },

  solothurn: {
    title: 'SOLOTHURN',
    images: [
      '01_krummturm.jpg',
      '02_oelberg.jpg',
      '03_einsiedelei.jpg',
      '04_weissenstein.jpg',
      '05_aare.jpg',
      '06_this-post-is.webp',
      '07_chutz.jpg',
      '08_kreuz.jpg',
      '09_nest.jpg',
      '10_postplatz.jpg',
      '11_gerberngasse.jpg'
    ]
  },

  kontakt: {
    title: 'KONTAKT',
    images: [
      'gerbern-drei.png',
      { image: '02_kroki.jpg', image_en: '02_kroki_en.jpg' },
      { image: '03_kroki.jpg', image_en: '03_kroki_en.jpg' },
      'trungpa.jpg',
      'before-enlightenment.webp'
    ]
  },

  misc: {
    title: 'MISC',
    images: [
      'ukies.jpg',
      'plastik.jpg',
      'peace.jpg',
      'my-mind-wont.webp'
    ]
  },

  pastEvents: `
2027
MÄRZ 04: Eröffnung`,
  pastEvents_en: `
2027
MARCH 04: Opening`, 


  legal: {
    imprint: 'Hier kommt dein kurzes Impressum hin.',
    imprint_en: 'Here comes your legal note.',
    privacy: 'Hier kommt deine kurze Datenschutzerklärung hin.',
    privacy_en: 'Here comes your privacy statement.'
  },

  network: [
    {
      label: "Miguel Guldimann, Solothurn",
      url: "https://www.zenmeditation.ch/",
      display: "www.zenmeditation.ch"
    },
    {
      label: "Shambhala Zentrum, Bern",
      label_en: "Shambhala Centre, Bern",
      url_en: "https://bern.shambhala.org/?lang=en",
      url: "https://bern.shambhala.org/",
      display: "bern.shambhala.org"
    },
    {
      label: "Shambhala Zentrum, Zürich",
      label_en: "Shambhala Centre, Zurich",
      url_en: "https://zuerich.shambhala.org/?lang=en",
      url: "https://zuerich.shambhala.org/",
      display: "zuerich.shambhala.org",
      spaceAfter: true
    },
    {
      label: "Lapis Dharma Centre, Mullumbimby Creek, Australien",
      label_en: "Lapis Dharma Centre, Mullumbimby Creek, Australia",
      url: "https://www.lapisdharma.com/",
      display: "www.lapisdharma.com"
    },
    {
      label: "Seminar für Gestalttherapie SfGT, Winterthur",
      autoWrap: true,
      url: "https://www.sfgt.ch/",
      display: "www.sfgt.ch"
    },
    {
      label: "Shambhala Zentrum, Köln",
      label_en: "Shambhala Centre, Cologne",
      url_en: "https://cologne.shambhala.org/?lang=en",
      url: "https://cologne.shambhala.org/",
      display: "cologne.shambhala.org"
    },
    {
      label: "Shambhala Zentrum, Wien",
      label_en: "Shambhala Centre, Vienna",
      url_en: "https://wien.shambhala.info/?lang=en",
      url: "https://wien.shambhala.info/",
      display: "wien.shambhala.info"
    },
    {
      label: "Siddhartha's Intent, Dzongsar Khyentse Rinpoche",
      url: "https://siddharthasintent.org/",
      display: "siddharthasintent.org"
    },
    {
      label: "Songtsen, Pema Wangyal Rinpoche",
      url: "https://www.songtsen.org/",
      display: "www.songtsen.org"
    }
  ]
};
