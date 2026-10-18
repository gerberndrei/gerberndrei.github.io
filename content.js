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
      '03_stilles-sitzen.png',
      '04_es-ist-leer.webp',
      '05_vermeide-aggression.png',
      '06_fenster.jpg'
    ]
  },

  about: {
    title: 'ABOUT',
    images: [
      '01_stilles-sitzen.png',
      '02_fenster.jpg',
      '03_eingang-skizze.jpg',
      '04_dach-foto.jpg',
      '05_darf-ich-emails.webp',
      '05_glaube-nichts.png'
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
      '03_nichts-ergibt-sinn.webp',
      '04_sei-freundlich-wann.png',
      '05_dach.jpg'
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
      '06_dieser-pfosten-steht.webp',
      '07_chutz.jpg',
      '08_nest.jpg',
      '09_kreuz.jpg',
      '10_postplatz.jpg',
      '11_gerberngasse.jpg',
      '12_im-anfaengergeist.png'
    ]
  },

  kontakt: {
    title: 'KONTAKT',
    images: [
      '01_gerbern-drei.png',
      '02_kroki.jpg',
      '03_kroki.jpg',
      '04_vor-der-erleuchtung.webp',
      '05_ego-muss-man.png',
      '06_eingang-foto.jpg'
    ]
  },

  meditation: {
    title: 'MEDITATION',
    // Diese Liste wird nach Bild-Uploads automatisch durch GitHub Actions gepflegt.
    // Ordner: images/meditation/. Optional: _en vor der Dateiendung.
    images: [
      '01_entspanne-dich.png',
      '02_wenn-leute-anfangen.png',
      '03_wenn-man-seinem.png',
      '04_ich-kann-mich.webp'
    ]
  },

  misc: {
    title: 'MISC',
    images: [
      '01_plastik.jpg',
      '02_peace.jpg',
      '03_ukies.jpg',
      '04_ich-habe-losgelassen.webp',
      '05_wir-sind-wie.png'
    ]
  },

  pastEvents: `
2027

MÄRZ 04: Eröffnung`,
  pastEvents_en: `
2027

MARCH 04: Opening`, 


  legal: {
    imprint: 'gerbern drei\nNiklaus Zumstein\nGerberngasse 3\n4500 Solothurn\nSchweiz\n\ngerbern.drei@gmail.com',
    imprint_en: 'gerbern drei\nNiklaus Zumstein\nGerberngasse 3\n4500 Solothurn\nSchweiz\n\ngerbern.drei@gmail.com',
    privacy: "Diese Website wird über GitHub Pages betrieben. Dabei können technische Zugriffsdaten, insbesondere IP-Adressen, auch im Ausland verarbeitet werden.\n\nWir verwenden keine eigenen Analyse- oder Werbetracker. Die Spracheinstellung wird lokal im Browser gespeichert. Für externe Links, etwa zu Google Maps oder Instagram, gelten die Datenschutzbestimmungen der jeweiligen Anbieter.\n\nE-Mail-Anfragen werden ausschliesslich zur Kontaktaufnahme und Beantwortung verwendet und nur so lange wie nötig aufbewahrt.\n\nFür Auskunft, Berichtigung oder Löschung Ihrer Daten kontaktieren Sie bitte die im Impressum genannte verantwortliche Person.",
    privacy_en: "This website is hosted on GitHub Pages. Technical access data, including IP addresses, may be processed outside Switzerland.\n\nWe do not use our own analytics or advertising trackers. Your language preference is stored locally in your browser. External links, such as Google Maps or Instagram, are subject to the respective providers' privacy policies.\n\nEmail enquiries are used solely for communication and replies and are retained only as long as necessary.\n\nTo request access to, correction or deletion of your data, please contact the responsible person listed in the legal notice."
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
