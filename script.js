/*
 * GERBERN DREI — INTERAKTION UND ANZEIGE
 *
 * Dieses Skript steuert Galerien, Klick-/Touch-Bedienung, Sprachwechsel,
 * Navigation, Scrollposition und responsive Bildgrössen.
 * Texte, Bilderlisten und NETZWERK-Einträge bitte in content.js bearbeiten.
 * Für KONTAKT-Kartenlinks nach "contactMapLinks" suchen.
 *
 * Hinweis: Die Initialisierungsreihenfolge und Eventhandler sind wichtig.
 * Hinweise für manuelle Änderungen stehen in README.md.
 */

(function () {
  'use strict';

  // do not let the browser restore a slightly scrolled START position.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const content = window.SITE_CONTENT || {};
  const MAX_IMAGES = 12;

  // German/original is the default. English is an optional overlay:
  // whenever a *_en value is missing, the original value stays visible.
  const urlLanguage = new URLSearchParams(window.location.search).get('lang');
  let currentLanguage = urlLanguage === 'en' ? 'en' : (urlLanguage === 'de' ? 'de' : (localStorage.getItem('gerbern-drei-language') === 'en' ? 'en' : 'de'));

  function syncLanguageUrl() {
    const url = new URL(window.location.href);
    if (currentLanguage === 'en') url.searchParams.set('lang', 'en');
    else url.searchParams.delete('lang');
    history.replaceState(null, '', url.pathname + (url.search ? url.search : '') + url.hash);
  }
  const MONTHS_EN = {
    JANUAR:'JANUARY', FEBRUAR:'FEBRUARY', 'MÄRZ':'MARCH', APRIL:'APRIL',
    MAI:'MAY', JUNI:'JUNE', JULI:'JULY', AUGUST:'AUGUST',
    SEPTEMBER:'SEPTEMBER', OKTOBER:'OCTOBER', NOVEMBER:'NOVEMBER', DEZEMBER:'DECEMBER'
  };
  const NAV_LABELS = {
    de:{start:'START',about:'ABOUT',aktuell:'AKTUELL',solothurn:'SOLOTHURN',kontakt:'KONTAKT',past:'PAST EVENTS',netzwerk:'NETZWERK',misc:'MISC',imprint:'IMPRESSUM',privacy:'DATENSCHUTZ'},
    en:{start:'HOME',about:'ABOUT',aktuell:'NOW',solothurn:'SOLOTHURN',kontakt:'CONTACT',past:'PAST EVENTS',netzwerk:'NETWORK',misc:'MISC',imprint:'LEGAL',privacy:'PRIVACY'}
  };

  function localized(obj, key) {
    if (!obj) return '';
    const enKey = key + '_en';
    return currentLanguage === 'en' && obj[enKey] != null ? obj[enKey] : obj[key];
  }

  function galleryImageSpec(data, entry, index) {
    if (entry && typeof entry === 'object') {
      return { base:entry.image || '', en:entry.image_en || '', alt:localized(entry,'alt') || '' };
    }
    const enList = Array.isArray(data.images_en) ? data.images_en : [];
    const altList = currentLanguage === 'en' && Array.isArray(data.alt_en) ? data.alt_en : (Array.isArray(data.alt) ? data.alt : []);
    return { base:entry || '', en:enList[index] || '', alt:altList[index] || '' };
  }

  // =====================================================================
  // BILDVARIANTEN: zurzeit deaktiviert, alle Funktionen bleiben erhalten.
  //
  // HIER KANN DIE UNTERSTÜTZUNG VON DARK-MODE-SLIDES WIEDER AKTIVIERT WERDEN:
  // Den folgenden Wert von false auf true setzen. Dies betrifft ausschliesslich
  // _dark-Bilddateien, NICHT die normalen Dark-Mode-Farben der Website.
  const ENABLE_DARK_SLIDE_VARIANTS = false;

  // HIER KANN DIE UNTERSTÜTZUNG VON PHONE-MODE-SLIDES WIEDER AKTIVIERT WERDEN:
  // Den folgenden Wert von false auf true setzen (Handy-Hochformat).
  // Sind beide Schalter true, werden auch _dark_phone-Bilder gesucht.
  const ENABLE_PHONE_SLIDE_VARIANTS = false;
  // =====================================================================

  function galleryImageCandidates(spec) {
    const english = currentLanguage === 'en';
    const dark = ENABLE_DARK_SLIDE_VARIANTS &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    const phone = ENABLE_PHONE_SLIDE_VARIANTS &&
      window.matchMedia('(max-width:650px) and (orientation:portrait)').matches;
    const suffix = (name, extra) => name.replace(/(\.[^./?#]+)([?#].*)?$/, extra + '$1$2');
    const englishImage = spec.en || suffix(spec.base, '_en');
    const list = [];
    const add = (name, usePhone) => {
      if (!name) return;
      if (usePhone && ENABLE_PHONE_SLIDE_VARIANTS && dark) list.push(suffix(name, '_dark_phone'));
      if (usePhone && ENABLE_PHONE_SLIDE_VARIANTS) list.push(suffix(name, '_phone'));
      if (dark) list.push(suffix(name, '_dark'));
      list.push(name);
    };
    if (english) {
      add(englishImage, phone);
      add(spec.base, phone);
      add(englishImage, !phone);
      add(spec.base, !phone);
    } else {
      add(spec.base, phone);
      add(englishImage, phone);
      add(spec.base, !phone);
      add(englishImage, !phone);
    }
    return [...new Set(list.filter(Boolean))];
  }

  // Missing optional variants are remembered during this visit; changing
  // the system colour scheme must not retry them or reload an unchanged image.
  const missingGalleryImages = new Set();
  function setGalleryImage(img, spec, key) {
    const proposed = galleryImageCandidates(spec).map(name => 'images/' + key + '/' + name);
    const list = proposed.filter(name => !missingGalleryImages.has(name));
    const candidates = list.length ? list : proposed;
    img.dataset.imageCandidates = JSON.stringify(candidates);
    img.dataset.imageAttempt = '0';
    // Retain the already displayed bitmap and gallery/scroll position when
    // the selected picture is identical in light and dark mode.
    if (img.getAttribute('src') !== candidates[0]) img.src = candidates[0];
  }

  // v52: one random saturated-pastel original dot image per page load.
  // Clicking the large navigation dot chooses a different colour AND returns to START.
  const ACCENT_DOTS = [
    { colour: '#F3A51F', file: 'dot.png' },
    { colour: '#F28C8C', file: 'dot-coral.png' },
    { colour: '#E99BCB', file: 'dot-rose.png' },
    { colour: '#B69BE8', file: 'dot-lavender.png' },
    { colour: '#82AEE8', file: 'dot-sky.png' },
    { colour: '#72C7C0', file: 'dot-turquoise.png' },
    { colour: '#91C98D', file: 'dot-sage.png' },
    { colour: '#D6C85F', file: 'dot-mustard.png' }
  ];

  let accentDot = ACCENT_DOTS[Math.floor(Math.random() * ACCENT_DOTS.length)];

  function applyAccent(dot) {
    accentDot = dot;
    document.documentElement.style.setProperty('--accent', dot.colour);
    const image = document.querySelector('.mark-dot');
    if (image) {
      image.onerror = function () { this.onerror = null; this.src = 'dot.png'; };
      image.src = dot.file;
    }
  }

  function chooseDifferentAccent() {
    const alternatives = ACCENT_DOTS.filter(function (dot) { return dot.file !== accentDot.file; });
    applyAccent(alternatives[Math.floor(Math.random() * alternatives.length)]);
  }

  applyAccent(accentDot);

  const colourDot = document.querySelector('.mark');
  const whatDot = document.querySelector('.misc-divider-dot');

  function scrollToElement(el, hash) {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (history.replaceState) history.replaceState(null, '', hash);
  }

  // Touch labels: show briefly after a tap, then disappear automatically.
  function flashTouchLabel(button) {
    /* v66: no so?/what! labels on touch devices. Hover labels belong to real pointers only. */
    if (!button) return;
    button.classList.remove('touch-label-visible');
  }

  // so? changes the palette and leads to what! at the bottom.
  if (colourDot) {
    colourDot.addEventListener('click', function () {
      chooseDifferentAccent();
      flashTouchLabel(colourDot);
      colourDot.blur();
      scrollToElement(whatDot, '#what');
    });
  }

  // what! changes the palette and returns to the exact fitted START state.
  // Important: make START authoritative *before* fitting it.  Otherwise the
  // scroll bookkeeping can still regard MISC as the active gallery while the
  // page is travelling back from the bottom.
  if (whatDot) {
    whatDot.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      chooseDifferentAccent();
      flashTouchLabel(whatDot);
      whatDot.blur();

      const start = document.getElementById('start');
      const startGroup = start && start.querySelector('.window-group');
      if (startGroup) activeGallery = startGroup;
      if (history.replaceState) history.replaceState(null, '', '#start');

      // fitStartToViewport itself establishes scrollY=0, so do not start a
      // competing smooth-scroll animation here.  Re-measure once after layout
      // has settled; this is the same geometry used by the working START link.
      fitStartToViewport();
      requestAnimationFrame(function () {
        fitStartToViewport();
        window.scrollTo({ top:0, left:0, behavior:'auto' });
      });
    });
  }

  function buildGallery(carousel) {
    const key = carousel.dataset.gallery;
    const data = content[key] || {};
    const images = Array.isArray(data.images) ? data.images.slice(0, MAX_IMAGES) : [];
    const track = carousel.querySelector('.track');
    const dots = carousel.querySelector('.dots');
    const prev = carousel.querySelector('.prev');
    const next = carousel.querySelector('.next');
    // KONTAKT: second Kroki opens the address, third Kroki opens walking
    // directions. Other galleries keep their normal click-to-next behavior.
    const contactMapLinks = [null, "https://www.google.com/maps/place/Gerberngasse+3,+4500+Solothurn/@47.2063136,7.5151305,14z/data=!3m1!4b1!4m6!3m5!1s0x4791d7f8cca7ac59:0x75b4c51bc31c6aef!8m2!3d47.2063154!4d7.5356871!16s%2Fg%2F11c1x0930c?entry=ttu&g_ep=EgoyMDI2MTAxMS4wIKXMDSoASAFQAw%3D%3D", "https://www.google.com/maps/dir/Solothurn,+4500+Solothurn/Gerberngasse+3,+4500+Solothurn/@47.2063461,7.5235645,14.57z/data=!4m19!4m18!1m10!1m1!1s0x4791d7fcf3f5ef73:0xeba6a741959576c4!2m2!1d7.543276!2d47.204582!3m4!1m2!1d7.5356445!2d47.2059499!3s0x4791d7ff32718d2d:0x1253bffbb5ded8d2!1m5!1m1!1s0x4791d7f8cca7ac59:0x75b4c51bc31c6aef!2m2!1d7.5356871!2d47.2063154!3e2?entry=ttu&g_ep=EgoyMDI2MTAxMS4wIKXMDSoASAFQAw%3D%3D"];
    function openContactMap(url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    track.innerHTML = '';
    dots.innerHTML = '';
    carousel.setAttribute('role', 'region');
    carousel.setAttribute('aria-roledescription', 'carousel');
    carousel.setAttribute('aria-label', (NAV_LABELS[currentLanguage][key] || key) + ' Bildergalerie');
    track.setAttribute('tabindex', '0');
    track.setAttribute('aria-label', 'Bilder mit Pfeiltasten wechseln');

    if (!images.length) {
      const empty = document.createElement('div');
      empty.className = 'slide empty';
      empty.textContent = 'BILD';
      track.appendChild(empty);
      prev.hidden = true;
      next.hidden = true;
      dots.hidden = true;
      return;
    }

    images.forEach(function (name, index) {
      const slide = document.createElement('div');
      slide.className = 'slide';
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', (index + 1) + ' von ' + images.length);
      const img = document.createElement('img');
      const spec = galleryImageSpec(data, name, index);
      img.dataset.galleryKey = key;
      img.dataset.imageIndex = String(index);
      img.dataset.baseName = spec.base;
      img.dataset.enName = spec.en;
      setGalleryImage(img, spec, key);
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = spec.alt;
      img.onerror = function () {
        // Skip this absent variant the next time the theme changes.
        const failedSource = img.getAttribute('src');
        if (failedSource) missingGalleryImages.add(failedSource);
        const candidates = JSON.parse(img.dataset.imageCandidates || '[]');
        const next = Number(img.dataset.imageAttempt || '0') + 1;
        if (next < candidates.length) {
          img.dataset.imageAttempt = String(next);
          img.src = candidates[next];
          return;
        }
        slide.classList.add('missing');
        img.style.visibility = 'hidden';
      };
      img.onload = function () {
        slide.classList.remove('missing');
        img.style.visibility = '';
      };
      if (key === 'kontakt' && contactMapLinks[index]) {
        img.setAttribute('role', 'link');
        img.setAttribute('tabindex', '0');
        img.setAttribute('aria-label', index === 1
          ? 'Google Maps: Gerberngasse 3, Solothurn'
          : 'Google Maps: Fussweg zur Gerberngasse 3');
        img.title = img.getAttribute('aria-label');
        img.style.cursor = 'pointer';
        img.addEventListener('keydown', function (event) {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          event.stopPropagation();
          openContactMap(contactMapLinks[index]);
        });
      }
      slide.appendChild(img);
      // First KONTAKT image: make its IG and email text independently clickable.
      // Keep the original slide/image intact and preserve swipe navigation.
      if (key === 'kontakt' && index === 0) {
        slide.classList.add('contact-hotspot-slide');
        [
          { label:'Instagram: gerbern.drei', href:'https://www.instagram.com/gerbern.drei/', cls:'contact-instagram-hotspot' },
          { label:'E-Mail an gerbern.drei@gmail.com', href:'mailto:gerbern.drei@gmail.com', cls:'contact-email-hotspot' }
        ].forEach(function (item) {
          const link = document.createElement('a');
          link.className = 'contact-image-hotspot ' + item.cls;
          link.href = item.href;
          link.setAttribute('aria-label', item.label);
          link.title = item.label;
          if (item.href.startsWith('https://')) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
          link.addEventListener('click', function (event) { event.stopPropagation(); });
          slide.appendChild(link);
        });
      }
      track.appendChild(slide);

      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Bild ' + (index + 1));
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', function () { goTo(index); });
      dots.appendChild(dot);
    });

    if (images.length === 1) {
      prev.hidden = true;
      next.hidden = true;
      dots.hidden = true;
      return;
    }

    dots.hidden = false;
    let index = 0;

    function slideWidth() { return track.clientWidth || 1; }
    function goTo(i) {
      index = Math.max(0, Math.min(images.length - 1, i));
      track.scrollTo({ left: index * slideWidth(), behavior: 'smooth' });
      update();
    }
    function update() {
      index = Math.max(0, Math.min(images.length - 1, Math.round(track.scrollLeft / slideWidth())));
      Array.from(dots.children).forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
        if (i === index) dot.setAttribute('aria-current', 'true'); else dot.removeAttribute('aria-current');
      });
      prev.hidden = index === 0;
      next.hidden = index === images.length - 1;
    }

    prev.addEventListener('click', function (event) { event.stopPropagation(); goTo(index - 1); });
    next.addEventListener('click', function (event) { event.stopPropagation(); goTo(index + 1); });
    track.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(index - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); goTo(index + 1); }
    });

    // A mouse click or a short finger tap on the image advances one slide.
    // Ignore the compatibility click some phones fire after a swipe/scroll.
    // Contact overlays are links, not images, so they remain independently clickable.
    let suppressSwipeClick = false;
    track.addEventListener('click', function (event) {
      if (event.target.tagName !== 'IMG') return;
      if (suppressSwipeClick) { suppressSwipeClick = false; return; }
      const mapUrl = key === 'kontakt'
        ? contactMapLinks[Number(event.target.dataset.imageIndex)]
        : null;
      if (mapUrl) {
        openContactMap(mapUrl);
        return;
      }
      if (index < images.length - 1) goTo(index + 1);
    });

    // One swipe = one neighbouring slide. Horizontal native momentum is disabled
    // by touch-action:pan-y on the track, so fast swipes cannot skip slides.
    let touchOriginX = 0;
    let touchOriginY = 0;
    let touchStartIndex = 0;
    let touchActive = false;
    let touchMoved = false;
    track.addEventListener('touchstart', function (event) {
      if (event.touches.length !== 1) { touchActive = false; suppressSwipeClick = true; return; }
      suppressSwipeClick = false; // A new gesture may be a real tap after a swipe.
      touchMoved = false;
      touchOriginX = event.touches[0].clientX;
      touchOriginY = event.touches[0].clientY;
      touchStartIndex = Math.round(track.scrollLeft / slideWidth());
      touchActive = true;
    }, { passive:true });
    track.addEventListener('touchmove', function (event) {
      if (!touchActive || event.touches.length !== 1) return;
      const finger = event.touches[0];
      if (Math.abs(finger.clientX - touchOriginX) > 12 ||
          Math.abs(finger.clientY - touchOriginY) > 12) touchMoved = true;
    }, { passive:true });
    track.addEventListener('touchend', function (event) {
      if (!touchActive) return;
      touchActive = false;
      const finger = event.changedTouches[0];
      const dx = finger ? finger.clientX - touchOriginX : 0;
      const dy = finger ? finger.clientY - touchOriginY : 0;
      if (touchMoved || Math.abs(dx) > 12 || Math.abs(dy) > 12) {
        suppressSwipeClick = true;
      }
      if (Math.abs(dx) < 36 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      goTo(touchStartIndex + (dx < 0 ? 1 : -1));
    }, { passive:true });
    track.addEventListener('touchcancel', function () {
      touchActive = false;
      suppressSwipeClick = true;
    }, { passive:true });

    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });

    // Keep the selected slide locked when responsive sizing changes the window width.
    // Without this, the old pixel scrollLeft can land between slides during resize.
    let resizeFrame = 0;
    const keepSlideLocked = function () {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(function () {
        track.scrollTo({ left: index * slideWidth(), behavior: 'auto' });
        update();
      });
    };
    window.addEventListener('resize', keepSlideLocked, { passive: true });
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(keepSlideLocked);
      ro.observe(track);
    }
    update();
  }

  document.querySelectorAll('.carousel[data-gallery]').forEach(buildGallery);
  const past = document.getElementById('past-events');
  const network = document.getElementById('network-links');

  function translateMonth(dateText) {
    if (currentLanguage !== 'en') return dateText;
    return dateText.replace(/^([A-ZÄÖÜ]+)(\b|\s)/, function (whole, month, boundary) {
      return (MONTHS_EN[month] || month) + boundary;
    });
  }

  function renderPastEvents() {
    past.innerHTML = '';
    const source = currentLanguage === 'en' && content.pastEvents_en != null ? content.pastEvents_en : content.pastEvents;
    const pastLines = String(source || '').split(/\r?\n/);
    pastLines.forEach((raw, i) => {
      const line = raw.trim();
      if (!line) {
        if (i < pastLines.length - 1) {
          const gap = document.createElement('div'); gap.className = 'past-block-gap'; past.appendChild(gap);
        }
        return;
      }
      if (/^\d{4}$/.test(line)) {
        const year = document.createElement('div'); year.className = 'past-year'; year.textContent = '\u00A0\u00A0' + line; past.appendChild(year);
        return;
      }
      const m = line.match(/^([^:]+):\s*(.*)$/);
      if (m) {
        const dateText = translateMonth(m[1]);
        const row = document.createElement('div'); row.className = 'past-row';
        const date = document.createElement('span'); date.textContent = dateText;
        const sep = document.createElement('span'); sep.className = 'list-separator past-separator'; sep.textContent = '–';
        const desc = document.createElement('span'); desc.textContent = m[2];
        const mobileLine = document.createElement('span'); mobileLine.className = 'past-mobile-line';
        const mobileDate = document.createElement('span'); mobileDate.className = 'past-mobile-date'; mobileDate.textContent = dateText;
        const mobileDesc = document.createElement('span'); mobileDesc.className = 'past-mobile-desc'; mobileDesc.textContent = m[2];
        mobileLine.append(mobileDate, mobileDesc);
        row.append(date, sep, desc, mobileLine); past.appendChild(row);
      } else {
        const row = document.createElement('div'); row.textContent = line; past.appendChild(row);
      }
    });
  }

  // Keep an entire NETWORK name/location together if it fits on one
  // narrow portrait line. Never force a too-long label beyond the viewport.
  // A full-width/landscape list keeps its existing natural formatting.
  let networkWrapResizeFrame = 0;
  function fitNetworkLabels() {
    const labels = network.querySelectorAll('.network-row > .network-label');
    const narrow = window.matchMedia('(max-width:900px) and (orientation:portrait)').matches;
    const context = document.createElement('canvas').getContext('2d');
    labels.forEach(function (label) {
      label.classList.remove('network-label--keep');
      if (!narrow || !context) return;
      const row = label.parentElement;
      const rowStyle = window.getComputedStyle(row);
      const style = window.getComputedStyle(label);
      const space = row.clientWidth - (parseFloat(rowStyle.paddingLeft) || 0);
      context.font = style.font;
      const letterSpacing = parseFloat(style.letterSpacing) || 0;
      const text = label.textContent || '';
      const textWidth = context.measureText(text).width +
        Math.max(0, text.length - 1) * letterSpacing;
      if (textWidth > 0 && textWidth <= space - 10) {
        label.classList.add('network-label--keep');
      }
    });
  }
  function scheduleNetworkLabelFit() {
    if (networkWrapResizeFrame) return;
    networkWrapResizeFrame = window.requestAnimationFrame(function () {
      networkWrapResizeFrame = 0;
      fitNetworkLabels();
    });
  }
  window.addEventListener('resize', scheduleNetworkLabelFit, { passive:true });

  function renderNetwork() {
    network.innerHTML = '';
    const links = Array.isArray(content.network) ? content.network : [];
    links.forEach(function (item) {
      const row = document.createElement('div'); row.className = 'network-row';
      const labelText = localized(item, 'label');
      const url = localized(item, 'url') || item.url;
      const display = localized(item, 'display') || item.display;
      const email = localized(item, 'email') || item.email;
      const label = document.createElement('span'); label.className = 'network-label'; label.textContent = labelText || ''; row.appendChild(label);
      if (labelText) { const br = document.createElement('br'); br.className = 'network-link-break'; row.appendChild(br); const sep = document.createElement('span'); sep.className = 'list-separator'; sep.textContent = '|\u00A0'; row.appendChild(sep); }
      if (url) {
        const a = document.createElement('a'); a.href = url; a.textContent = display || url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
        if (/^https?:\/\//i.test(a.href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; } row.appendChild(a);
      }
      if (email) { const a = document.createElement('a'); a.href = 'mailto:' + email; a.textContent = email; row.appendChild(a); }
      network.appendChild(row);
      if (item.spaceAfter) {
      const gap = document.createElement('div');
      gap.className = 'network-block-gap';
      network.appendChild(gap);
}
    });
    scheduleNetworkLabelFit();
  }

  renderPastEvents();
  renderNetwork();


  function updateGalleryLanguage() {
    document.querySelectorAll('.carousel[data-gallery]').forEach(function (carousel) {
      const key = carousel.dataset.gallery;
      const data = content[key] || {};
      const entries = Array.isArray(data.images) ? data.images.slice(0, MAX_IMAGES) : [];
      carousel.querySelectorAll('.slide img').forEach(function (img, index) {
        const spec = galleryImageSpec(data, entries[index], index);
        const slide = img.closest('.slide');
        img.dataset.baseName = spec.base;
        img.dataset.enName = spec.en;
        img.alt = spec.alt;
        setGalleryImage(img, spec, key);
      });
    });
  }

  // Nur bei aktivierten Dark-Mode-Slides Bilder nach einem Systemwechsel pruefen.
  // Das Dark-Mode-CSS arbeitet unabhaengig davon automatisch weiter.
  if (ENABLE_DARK_SLIDE_VARIANTS) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateGalleryLanguage);
  }

  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el && value != null) el.textContent = value;
  }

  function applyLanguage() {
    const labels = NAV_LABELS[currentLanguage];
    document.documentElement.lang = currentLanguage;
    localStorage.setItem('gerbern-drei-language', currentLanguage);
    syncLanguageUrl();

    ['start','about','aktuell','solothurn','kontakt'].forEach(function (id) {
      setText('.primary-nav a[href="#' + id + '"]', labels[id]);
      const data = content[id] || {};
      const title = localized(data, 'title');
      setText('#' + id + ' .section-title', currentLanguage === 'en' && data.title_en == null ? labels[id] : title);
    });
    setText('.secondary-nav a[href="#past"]', labels.past);
    setText('.secondary-nav a[href="#netzwerk"]', labels.netzwerk);
    setText('#past .section-title', labels.past);
    setText('#netzwerk .section-title', labels.netzwerk);
    setText('#misc .section-title', currentLanguage === 'en' && content.misc && content.misc.title_en != null ? content.misc.title_en : labels.misc);
    setText('#legal-imprint-title', labels.imprint);
    setText('#legal-privacy-title', labels.privacy);

    const legal = content.legal || {};
    setText('#legal-imprint-text', localized(legal, 'imprint') || 'Hier kommt dein kurzes Impressum hin.');
    setText('#legal-privacy-text', localized(legal, 'privacy') || 'Hier kommt deine kurze Datenschutzerklärung hin.');

    const toggle = document.querySelector('.language-toggle');
    if (toggle) {
      toggle.textContent = currentLanguage === 'de' ? 'EN' : 'DE';
      toggle.setAttribute('aria-label', currentLanguage === 'de' ? 'Switch to English' : 'Zur deutschen Version wechseln');
    }

    const topTip = document.querySelector('.mark-tooltip');
    const bottomTip = document.querySelector('.misc-divider-tooltip');
    if (topTip) topTip.textContent = currentLanguage === 'de' ? 'na?' : 'so?';
    if (bottomTip) bottomTip.textContent = currentLanguage === 'de' ? 'und!' : 'what!';

    renderPastEvents();
    renderNetwork();
    updateGalleryLanguage();
    document.querySelectorAll('.carousel[data-gallery]').forEach(function (carousel) {
      const key = carousel.dataset.gallery;
      carousel.setAttribute('aria-label', (NAV_LABELS[currentLanguage][key] || key) + (currentLanguage === 'en' ? ' image gallery' : ' Bildergalerie'));
      const track = carousel.querySelector('.track');
      if (track) track.setAttribute('aria-label', currentLanguage === 'en' ? 'Use arrow keys to change image' : 'Bilder mit Pfeiltasten wechseln');
    });
  }

  const languageToggle = document.querySelector('.language-toggle');
  if (languageToggle) languageToggle.addEventListener('click', function () {
    currentLanguage = currentLanguage === 'de' ? 'en' : 'de';
    applyLanguage();
  });

  applyLanguage();


  // Track the actual visible phone viewport for every gallery. On Samsung
  // Internet the browser bars can shrink while scrolling. Keep native touch
  // scrolling untouched; only update a CSS geometry variable on resize.
  const portraitGalleryQuery = window.matchMedia('(max-width:650px) and (orientation:portrait)');
  const landscapeGalleryQuery = window.matchMedia('(orientation:landscape) and (max-height:650px) and (pointer:coarse)');
  const phoneGalleryQuery = window.matchMedia('(max-width:650px) and (orientation:portrait), (orientation:landscape) and (max-height:650px) and (pointer:coarse)');
  const phoneGalleryGroups = Array.from(document.querySelectorAll('main .section > .window-group'));
  let galleryViewportResizeFrame = 0;
  let lastGalleryOrientation = portraitGalleryQuery.matches ? 'portrait' : (landscapeGalleryQuery.matches ? 'landscape' : 'other');

  function phoneVisibleHeight() {
    const visual = window.visualViewport;
    return visual && visual.scale === 1 ? visual.height : window.innerHeight;
  }

  // Phone galleries update independently: a retracting browser toolbar
  // must not resize every earlier section or shift the current scroll.
  function setPhoneGalleryHeight(group) {
    if (!phoneGalleryQuery.matches || !group) return;
    const height = phoneVisibleHeight();
    if (!Number.isFinite(height) || height <= 0) return;
    const pixels = Math.round(height) + 'px';
    if (group.style.getPropertyValue('--gg-gallery-visible-height') !== pixels) {
      group.style.setProperty('--gg-gallery-visible-height', pixels);
    }
    // Match only this section's height to the visual viewport. Earlier
    // sections keep their prior geometry and cannot push the active one away.
    const section = group.closest('.section');
    if (section && section.style.getPropertyValue('--gg-gallery-visible-height') !== pixels) {
      section.style.setProperty('--gg-gallery-visible-height', pixels);
    }
  }

  function syncGalleryVisibleHeight() {
    const rootStyle = document.documentElement.style;
    const layout = portraitGalleryQuery.matches ? 'portrait' : (landscapeGalleryQuery.matches ? 'landscape' : 'other');
    if (layout !== lastGalleryOrientation) {
      // Recalculate from the new orientation; the delayed rotation handler
      // keeps the requested section in place after this single reset.
      phoneGalleryGroups.forEach(function (group) {
        group.style.removeProperty('--gg-gallery-visible-height');
        const section = group.closest('.section');
        if (section) section.style.removeProperty('--gg-gallery-visible-height');
      });
      lastGalleryOrientation = layout;
    }
    if (!phoneGalleryQuery.matches) {
      rootStyle.removeProperty('--gg-gallery-visible-height');
      phoneGalleryGroups.forEach(function (group) {
        group.style.removeProperty('--gg-gallery-visible-height');
        const section = group.closest('.section');
        if (section) section.style.removeProperty('--gg-gallery-visible-height');
      });
      return;
    }

    const height = phoneVisibleHeight();
    if (!Number.isFinite(height) || height <= 0) return;
    // Hoch- und Querformat verwenden dieselbe Berechnung. Nur die aktuell
    // sichtbare Galerie wird an die sichtbare Viewport-Hoehe angepasst.
    rootStyle.removeProperty('--gg-gallery-visible-height');
    const head = document.querySelector('.fixed-head');
    const headHeight = head ? head.getBoundingClientRect().height : 0;
    let visibleGroup = null;
    let greatestOverlap = 0;
    phoneGalleryGroups.forEach(function (group) {
      const rect = group.getBoundingClientRect();
      const overlap = Math.max(0, Math.min(rect.bottom, height) - Math.max(rect.top, headHeight));
      if (overlap > greatestOverlap) {
        greatestOverlap = overlap;
        visibleGroup = group;
      }
    });
    if (visibleGroup) setPhoneGalleryHeight(visibleGroup);


  }

  function scheduleGalleryVisibleHeight() {
    if (galleryViewportResizeFrame) return;
    galleryViewportResizeFrame = window.requestAnimationFrame(function () {
      galleryViewportResizeFrame = 0;
      syncGalleryVisibleHeight();
    });
  }

  // Activate each visible phone gallery independently. Browser toolbar
  // changes resize only the current one, never all galleries in the document.
  if ('IntersectionObserver' in window) {
    const galleryObserver = new IntersectionObserver(function (entries) {
      if (!phoneGalleryQuery.matches) return;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setPhoneGalleryHeight(entry.target);
      });
    }, { rootMargin: '-30% 0px -25% 0px', threshold: 0 });
    phoneGalleryGroups.forEach(function (group) { galleryObserver.observe(group); });
  }
  syncGalleryVisibleHeight();
  window.addEventListener('resize', scheduleGalleryVisibleHeight, { passive:true });
  window.addEventListener('scroll', function () {
    if (landscapeGalleryQuery.matches) scheduleGalleryVisibleHeight();
  }, { passive:true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scheduleGalleryVisibleHeight, { passive:true });
  }

  // Gallery navigation: title + image + dots are one visual unit.
  // During a browser resize, the section named in the URL hash is authoritative.
  // This avoids scroll events generated by Chrome's maximize/restore operation
  // accidentally switching the active gallery while the viewport is changing.
  let activeGallery = null;
  let resizeInProgress = false;
  let resizeSettleTimer = 0;

  function fitStartToViewport() {
    if (window.matchMedia('(max-width:900px), (pointer:coarse)').matches) return;
    const start = document.getElementById('start');
    const group = start && start.querySelector('.window-group');
    if (!group) return;

    /* START has one geometry only: at scrollY 0 the complete unit
       (title + square + gallery dots) must fit inside the visible viewport.
       Because the unit is vertically centred, reducing its width moves its
       top down as well; therefore we measure again after every reduction. */
    group.style.width = '';
    group.style.maxWidth = '';

    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    void group.offsetHeight;

    const foot = document.querySelector('.fixed-foot');
    const footH = foot ? foot.getBoundingClientRect().height : 0;
    const bottomLimit = window.innerHeight - footH - 8;

    for (let pass = 0; pass < 5; pass += 1) {
      const r = group.getBoundingClientRect();
      const overflow = r.bottom - bottomLimit;
      if (overflow <= 0.5) break;
      const fitted = Math.max(180, r.width - (overflow * 2) - 3);
      group.style.setProperty('width', fitted + 'px', 'important');
      group.style.setProperty('max-width', fitted + 'px', 'important');
      void group.offsetHeight;
    }

    window.scrollTo(0, 0);
    root.style.scrollBehavior = previousScrollBehavior;
  }

  function galleryLimits() {
    const mobile = window.matchMedia('(max-width: 650px), (orientation:landscape) and (max-height:650px)').matches;
    if (mobile) {
      const head = document.querySelector('.fixed-head');
      const headH = head ? head.getBoundingClientRect().height : 0;
      return { top: headH + (window.matchMedia('(orientation:landscape) and (max-height:650px)').matches ? 0 : 22), bottom: window.innerHeight - 4 };
    }
    const head = document.querySelector('.fixed-head');
    const headH = head ? head.getBoundingClientRect().height : 0;
    const underStrip = 34.02; // 9 mm white finish below navigation
    return { top: headH + underStrip, bottom: window.innerHeight - 4 };
  }

  function galleryFromHash() {
    const id = location.hash;
    if (!id) return null;
    const section = document.querySelector(id);
    return section && section.classList.contains('section') ? section.querySelector('.window-group') : null;
  }

  function chooseActiveGallery() {
    const hashed = galleryFromHash();
    if (hashed) { activeGallery = hashed; return activeGallery; }
    const limits = galleryLimits();
    const viewportCenter = (limits.top + limits.bottom) / 2;
    let best = null;
    let bestOverlap = -1;
    let bestDistance = Infinity;
    document.querySelectorAll('.section .window-group').forEach(function (group) {
      const r = group.getBoundingClientRect();
      const overlap = Math.max(0, Math.min(r.bottom, limits.bottom) - Math.max(r.top, limits.top));
      const distance = Math.abs(((r.top + r.bottom) / 2) - viewportCenter);
      if (overlap > bestOverlap || (overlap === bestOverlap && distance < bestDistance)) {
        best = group; bestOverlap = overlap; bestDistance = distance;
      }
    });
    if (best && bestOverlap > 0) activeGallery = best;
    return activeGallery;
  }

  function centerGallery(group) {
    if (!group || !document.documentElement.contains(group)) return;
    if (group.closest('#start') && !window.matchMedia('(max-width:900px), (pointer:coarse)').matches) { fitStartToViewport(); window.scrollTo({top:0,left:0,behavior:'auto'}); return; }
    const limits = galleryLimits();
    const available = limits.bottom - limits.top;
    const r = group.getBoundingClientRect();
    if (r.height > available) return;
    const desiredTop = window.matchMedia('(orientation:landscape) and (max-height:650px)').matches ? limits.top : limits.top + (available - r.height) / 2;
    const absoluteTop = window.scrollY + r.top;
    const wantedScroll = Math.max(0, absoluteTop - desiredTop);
    window.scrollTo({ top: wantedScroll, left: 0, behavior: 'auto' });
  }

  function keepWholeGalleryVisible(group) {
    if (!group || !document.documentElement.contains(group)) return;
    const limits = galleryLimits();
    const r = group.getBoundingClientRect();
    const pad = 10;
    if (r.bottom > limits.bottom - pad) {
      window.scrollBy({ top: r.bottom - (limits.bottom - pad), left: 0, behavior: 'auto' });
    }
    const r2 = group.getBoundingClientRect();
    if (r2.top < limits.top + pad && r2.height <= (limits.bottom - limits.top - 2 * pad)) {
      window.scrollBy({ top: r2.top - (limits.top + pad), left: 0, behavior: 'auto' });
    }
  }

  let scrollPickTimer = 0;
  if (!window.matchMedia('(max-width:900px), (pointer:coarse)').matches) {
    window.addEventListener('scroll', function () {
      if (resizeInProgress) return;
      window.clearTimeout(scrollPickTimer);
      scrollPickTimer = window.setTimeout(chooseActiveGallery, 70);
    }, { passive:true });
  }

  // Resizing a desktop window in either direction must not move the open section.
  // The previous resize handler repeatedly called centerGallery for 1.35s,
  // also jumping back to START when its hash was still in the address bar.
  // Remember the visible section's actual screen position BEFORE layout
  // changes, and correct only the offset caused by responsive reflow.
  // Touch-phone browser toolbar changes are ignored; rotation keeps its
  // own dedicated handler below.
  let lastResizeWidth = window.innerWidth;
  let lastResizeHeight = window.innerHeight;
  let resizeAnchorSnapshot = null;
  let resizeRememberFrame = 0;

  function visibleSectionAnchor() {
    const sections = document.querySelectorAll('main .section, main .list-section');
    const head = document.querySelector('.fixed-head');
    const headH = head ? head.getBoundingClientRect().height : 0;
    const viewTop = Math.min(window.innerHeight - 8, Math.max(0, headH));
    const viewBottom = window.innerHeight;
    let best = null;
    let mostVisible = 0;
    sections.forEach(function (section) {
      const rect = section.getBoundingClientRect();
      const overlap = Math.max(0, Math.min(rect.bottom, viewBottom) - Math.max(rect.top, viewTop));
      if (overlap > mostVisible) {
        mostVisible = overlap;
        best = section;
      }
    });
    if (!best) return null;
    if (best.classList.contains('section')) {
      return best.querySelector('.window-group') || best;
    }
    return best.querySelector('.list-inner') || best;
  }

  function rememberResizePosition() {
    if (resizeInProgress || window.innerWidth !== lastResizeWidth ||
        window.innerHeight !== lastResizeHeight) return;
    const anchor = visibleSectionAnchor();
    if (!anchor) return;
    resizeAnchorSnapshot = {
      anchor: anchor,
      top: anchor.getBoundingClientRect().top,
      atPageTop: window.scrollY <= 1
    };
  }

  function scheduleRememberResizePosition() {
    if (resizeInProgress || resizeRememberFrame) return;
    resizeRememberFrame = window.requestAnimationFrame(function () {
      resizeRememberFrame = 0;
      rememberResizePosition();
    });
  }
  window.addEventListener('scroll', scheduleRememberResizePosition, { passive:true });
  window.addEventListener('pageshow', scheduleRememberResizePosition);
  window.requestAnimationFrame(rememberResizePosition);

  function restoreResizePosition() {
    const state = resizeAnchorSnapshot;
    if (!state || !state.anchor.isConnected) return;
    const delta = state.anchor.getBoundingClientRect().top - state.top;
    const targetY = state.atPageTop ? 0 : window.scrollY + delta;
    if (!Number.isFinite(targetY) || Math.abs(targetY - window.scrollY) < 1) return;
    // The stylesheet has scroll-behavior:smooth; resizing must never
    // initiate an animated scroll.
    const root = document.documentElement;
    const oldBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo({ top:Math.max(0, targetY), left:0, behavior:'instant' });
    root.style.scrollBehavior = oldBehavior;
  }

  function settleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (width === lastResizeWidth && height === lastResizeHeight) return;
    lastResizeWidth = width;
    lastResizeHeight = height;
    // Mobile browser bars can change the viewport height while scrolling.
    // Keep their existing native behavior (and the separate rotation handler).
    if (window.matchMedia('(pointer:coarse)').matches) return;

    resizeInProgress = true;
    window.clearTimeout(resizeSettleTimer);
    window.requestAnimationFrame(restoreResizePosition);
    resizeSettleTimer = window.setTimeout(function () {
      restoreResizePosition();
      resizeInProgress = false;
      rememberResizePosition();
    }, 180);
  }
  // Preserve the selected section when the phone rotates; ignore browser toolbar resizes.
  const phoneOrientation = window.matchMedia('(orientation: portrait)');
  function restorePhoneSectionAfterRotation() {
    if (!window.matchMedia('(pointer: coarse), (max-width: 650px)').matches) return;
    const id = location.hash;
    if (!/^#(?:start|about|aktuell|solothurn|kontakt|past|netzwerk|misc)$/.test(id)) return;
    const target = document.getElementById(id.slice(1));
    if (!target) return;
    [120, 360, 650].forEach(function (delay) {
      window.setTimeout(function () {
        const landscape = window.matchMedia('(orientation: landscape)').matches;
        const head = document.querySelector('.fixed-head');
        const headH = head ? head.getBoundingClientRect().height : 0;
        const group = target.querySelector('.window-group');
        if (group) setPhoneGalleryHeight(group);
        const bottomFitGallery = group && portraitGalleryQuery.matches && window.matchMedia('(pointer:coarse)').matches;
        const anchor = bottomFitGallery ? target : (group || target);
        const gap = landscape || bottomFitGallery ? 0 : (7 * 96 / 25.4);
        const top = window.scrollY + anchor.getBoundingClientRect().top - headH - gap;
        window.scrollTo({top: Math.max(0, top), left: 0, behavior: 'instant'});
      }, delay);
    });
  }
  phoneOrientation.addEventListener('change', restorePhoneSectionAfterRotation);

  window.addEventListener('resize', settleResize, { passive:true });

  // Wide desktop: NETZWERK should scroll to the same title baseline as
  // the gallery sections (their groups are centered in galleryLimits()).
  function alignWideDesktopNetworkHeading(behavior) {
    if (!window.matchMedia('(min-width:1201px) and (min-height:651px) and (hover:hover) and (pointer:fine)').matches) return false;
    const heading = document.querySelector('#netzwerk .list-inner > .section-title');
    const gallery = document.querySelector('#kontakt .window-group');
    const galleryTitle = gallery && gallery.querySelector('.section-title');
    if (!heading || !gallery || !galleryTitle) return false;
    const limits = galleryLimits();
    const available = Math.max(0, limits.bottom - limits.top);
    const galleryRect = gallery.getBoundingClientRect();
    const titleOffset = galleryTitle.getBoundingClientRect().top - galleryRect.top;
    const desiredTop = limits.top + Math.max(0, (available - galleryRect.height) / 2) + titleOffset;
    const targetTop = window.scrollY + heading.getBoundingClientRect().top - desiredTop;
    window.scrollTo({top:Math.max(0,targetTop),behavior:behavior || 'auto'});
    return true;
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;

      // On phones the navigation remains fixed, so all anchor targets reserve
      // the actual current header height (portrait or compact landscape).
      const mobile = window.matchMedia('(max-width: 650px), (orientation:landscape) and (max-height:650px)').matches;
      if (mobile && (target.classList.contains('section') || id === '#past' || id === '#netzwerk')) {
        event.preventDefault();
        if (history.replaceState) history.replaceState(null, '', id);
        const head = document.querySelector('.fixed-head');
        const headH = head ? head.getBoundingClientRect().height : 0;
        const landscapePhone = window.matchMedia('(orientation:landscape) and (max-height:650px)').matches;
        const group = target.classList.contains('section') ? target.querySelector('.window-group') : null;
        if (group) setPhoneGalleryHeight(group);
        const bottomFitGallery = group && portraitGalleryQuery.matches && window.matchMedia('(pointer:coarse)').matches;
        const anchor = bottomFitGallery ? target : (group || target);
        const top = window.scrollY + anchor.getBoundingClientRect().top - headH - (landscapePhone || bottomFitGallery ? 0 : 22);
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        if (secondaryPast) secondaryPast.classList.toggle('active-secondary', id === '#past');
        if (secondaryNetwork) secondaryNetwork.classList.toggle('active-secondary', id === '#netzwerk');
        return;
      }

      // Reading sections (PAST EVENTS / NETZWERK) need their title to remain
      // visibly below the fixed header + 9 mm white finish. Native anchor
      // scrolling would otherwise tuck the title underneath the header.
      if (id === '#past' || id === '#netzwerk') {
        event.preventDefault();
        if (history.replaceState) history.replaceState(null, '', id);
        if (id === '#netzwerk' && alignWideDesktopNetworkHeading('smooth')) {
          readingNavLock = 'netzwerk';
          window.clearTimeout(readingNavLockTimer);
          readingNavLockTimer = window.setTimeout(function () { readingNavLock = null; updateNavDots(); }, 1250);
          if (secondaryPast) secondaryPast.classList.toggle('active-secondary', false);
          if (secondaryNetwork) secondaryNetwork.classList.toggle('active-secondary', true);
          return;
        }
        const head = document.querySelector('.fixed-head');
        const headH = head ? head.getBoundingClientRect().height : 0;
        const underStrip = 34.02; // 9 mm
        const breathingRoom = 22;
        const top = window.scrollY + target.getBoundingClientRect().top - headH - underStrip - breathingRoom;
        readingNavLock = id.slice(1);
        window.clearTimeout(readingNavLockTimer);
        readingNavLockTimer = window.setTimeout(function () { readingNavLock = null; updateNavDots(); }, 1250);
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        if (secondaryPast) secondaryPast.classList.toggle('active-secondary', id === '#past');
        if (secondaryNetwork) secondaryNetwork.classList.toggle('active-secondary', id === '#netzwerk');
        return;
      }

      if (!target.classList.contains('section')) return;
      const group = target.querySelector('.window-group');
      if (!group) return;
      event.preventDefault();
      activeGallery = group;
      if (id === '#start' && !window.matchMedia('(max-width:900px), (pointer:coarse)').matches) {
        if (history.replaceState) history.replaceState(null, '', id);
        fitStartToViewport();
        window.scrollTo({top:0,left:0,behavior:'smooth'});
        return;
      }
      if (history.replaceState) history.replaceState(null, '', id);
      const limits = galleryLimits();
      const available = Math.max(0, limits.bottom - limits.top);
      const groupH = group.getBoundingClientRect().height;
      const desiredTop = limits.top + Math.max(0, (available - groupH) / 2);
      const targetTop = window.scrollY + group.getBoundingClientRect().top - desiredTop;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
      if (!window.matchMedia('(max-width:900px), (pointer:coarse)').matches) {
        [180, 420, 760].forEach(function (delay) {
          window.setTimeout(function () { keepWholeGalleryVisible(group); }, delay);
        });
      }
    });
  });
  // Direct NETWORK URLs/reloads use the same wide-desktop title position.
  window.addEventListener('load', function () {
    if (location.hash === '#netzwerk') {
      window.requestAnimationFrame(function () { alignWideDesktopNetworkHeading('auto'); });
    }
  }, {once:true});
  activeGallery = galleryFromHash() || chooseActiveGallery();
  if (!location.hash || location.hash === '#start') {
    // START is a fitted first screen, never a remembered scroll position.
    window.scrollTo({top:0,left:0,behavior:'auto'});
    requestAnimationFrame(function(){
      fitStartToViewport();
      window.scrollTo({top:0,left:0,behavior:'auto'});
      requestAnimationFrame(function(){ window.scrollTo({top:0,left:0,behavior:'auto'}); });
    });
    fitStartToViewport();
    if (!window.matchMedia('(max-width:900px), (pointer:coarse)').matches) window.scrollTo({top:0,left:0,behavior:'auto'});
  }


  // The first START measurement can run before images/browser scroll
  // restoration have settled. Refit after the complete page loads and when
  // restoring a tab from the back-forward cache. Keep mobile untouched.
  function finalizeInitialDesktopStart() {
    if (location.hash && location.hash !== '#start') return;
    if (window.matchMedia('(max-width:900px), (pointer:coarse)').matches) return;
    window.requestAnimationFrame(fitStartToViewport);
  }
  window.addEventListener('load', finalizeInitialDesktopStart, { once:true });
  window.addEventListener('pageshow', finalizeInitialDesktopStart);

  // Navigation marker: the yellow dot follows the section that actually
  // occupies the centre of the visible browser area. This prevents KONTAKT
  // from staying active once PAST EVENTS has reached the reading position.
  let readingNavLock = null;
  let readingNavLockTimer = 0;
  const primaryIds = ['start', 'about', 'aktuell', 'solothurn', 'kontakt'];
  const primaryLinks = Array.from(document.querySelectorAll('.primary-nav a'));
  const secondaryPast = document.querySelector('.secondary-nav a[href="#past"]');
  const secondaryNetwork = document.querySelector('.secondary-nav a[href="#netzwerk"]');
  const navSectionIds = ['start', 'about', 'aktuell', 'solothurn', 'kontakt', 'past', 'netzwerk', 'misc'];

  function currentNavSection() {
    const head = document.querySelector('.fixed-head');
    const mobile = window.matchMedia('(max-width: 650px)').matches;
    const headH = head ? head.getBoundingClientRect().height : 0;

    // For the reading sections use a stable reading line just below the fixed
    // navigation. This keeps NETZWERK active for its whole section instead of
    // letting a short section lose its dot immediately to the following gap.
    const readingY = headH + 34.02 + 24;
    const pastSection = document.getElementById('past');
    const networkSection = document.getElementById('netzwerk');
    const miscSection = document.getElementById('misc');
    if (networkSection && miscSection) {
      const nr = networkSection.getBoundingClientRect();
      const mr = miscSection.getBoundingClientRect();
      if (nr.top <= readingY && mr.top > readingY) return 'netzwerk';
    }
    if (pastSection && networkSection) {
      const pr = pastSection.getBoundingClientRect();
      const nr = networkSection.getBoundingClientRect();
      if (pr.top <= readingY && nr.top > readingY) return 'past';
    }

    const y = headH + (window.innerHeight - headH) / 2;

    for (const id of navSectionIds) {
      const section = document.getElementById(id);
      if (!section) continue;
      const r = section.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) return id;
    }

    // Fallback for gaps between sections: choose the nearest section centre.
    let nearest = null;
    let nearestDistance = Infinity;
    navSectionIds.forEach(function (id) {
      const section = document.getElementById(id);
      if (!section) return;
      const r = section.getBoundingClientRect();
      const distance = Math.abs((r.top + r.bottom) / 2 - y);
      if (distance < nearestDistance) { nearestDistance = distance; nearest = id; }
    });
    return nearest;
  }

  function updateNavDots() {
    const activeId = readingNavLock || currentNavSection();

    primaryLinks.forEach(function (link) {
      link.classList.toggle('active-section', link.getAttribute('href') === '#' + activeId);
    });

    if (secondaryPast) secondaryPast.classList.toggle('active-secondary', activeId === 'past');
    if (secondaryNetwork) secondaryNetwork.classList.toggle('active-secondary', activeId === 'netzwerk');
  }

  // On phones, doing several getBoundingClientRect() reads on every raw scroll
  // event can interrupt Chrome's inertial fling. Limit navigation bookkeeping to
  // at most one animation frame and never write scroll position from this path.
  let navDotFrame = 0;
  function scheduleNavDotUpdate() {
    if (navDotFrame) return;
    navDotFrame = window.requestAnimationFrame(function () {
      navDotFrame = 0;
      updateNavDots();
    });
  }
  const touchLayout = window.matchMedia('(max-width:900px), (pointer:coarse)').matches;
  let touchScrollTimer = 0;
  if (touchLayout) {
    window.addEventListener('scroll', function () {
      window.clearTimeout(touchScrollTimer);
      touchScrollTimer = window.setTimeout(updateNavDots, 180);
    }, { passive:true });
  } else {
    window.addEventListener('scroll', scheduleNavDotUpdate, { passive:true });
  }
  window.addEventListener('resize', scheduleNavDotUpdate, { passive:true });
  updateNavDots();
})();

// v57: make the what! dot follow the *actual visible MISC viewport* axis.
(function alignWhatDotToMiscWindow(){
  const misc = document.getElementById('misc');
  const viewport = misc && misc.querySelector('.window-group .viewport');
  const axis = misc && misc.querySelector('.misc-dot-axis');
  if (!misc || !viewport || !axis) return;

  function align(){
    const mr = misc.getBoundingClientRect();
    const vr = viewport.getBoundingClientRect();
    const cs = getComputedStyle(misc);
    const padLeft = parseFloat(cs.paddingLeft) || 0;
    axis.style.width = vr.width + 'px';
    axis.style.marginLeft = (vr.left - mr.left - padLeft) + 'px';
  }

  align();
  requestAnimationFrame(align);
  window.addEventListener('load', align, {once:true});
  window.addEventListener('resize', align, {passive:true});
  if (!window.matchMedia('(max-width:900px), (pointer:coarse)').matches) {
    if (window.visualViewport) window.visualViewport.addEventListener('resize', align, {passive:true});
    if ('ResizeObserver' in window) new ResizeObserver(align).observe(viewport);
  }
})();

/* Symmetrical landscape-phone reading margins, aligned a little past the
   right edge of SOLOTHURN in the fixed navigation. */
(function alignLandscapeReadingColumns(){
  const solothurn = document.querySelector('.fixed-head .primary-nav a[href="#solothurn"]');
  if (!solothurn) return;
  const landscapePhone = window.matchMedia('(orientation:landscape) and (max-height:650px) and (pointer:coarse)');
  function align(){
    if (!landscapePhone.matches) {
      document.documentElement.style.removeProperty('--gg-landscape-reading-inset');
      return;
    }
    const inset = Math.ceil(solothurn.getBoundingClientRect().right + 16);
    document.documentElement.style.setProperty('--gg-landscape-reading-inset', inset + 'px');
  }
  align();
  window.addEventListener('resize', align, {passive:true});
  window.addEventListener('pageshow', align);
})();

/* Desktop: cap the NETWORK link column at the end of the word PAST in
   the right-hand navigation. Only actual text bounds are used, not the
   width of the full PAST EVENTS link or the browser window. */
(function capWideDesktopNetworkColumn(){
  const links = document.querySelector('#netzwerk #network-links');
  const pastNav = document.querySelector('.fixed-head .secondary-nav a[href="#past"]');
  if (!links || !pastNav) return;
  const desktop = window.matchMedia('(min-width:861px) and (min-height:651px) and (hover:hover) and (pointer:fine)');
  const wide = window.matchMedia('(min-width:1201px) and (min-height:651px) and (hover:hover) and (pointer:fine)');
  function align(){
    if (!desktop.matches) {
      links.style.removeProperty('--gg-wide-network-reading-width');
      return;
    }
    // Medium desktop: use the full reading area with 22px right gutter.
    // Wide desktop: retain the end of the word PAST as the right limit.
    const viewportRight = document.documentElement.clientWidth - 22;
    let right = viewportRight;
    if (wide.matches) {
      right = pastNav.getBoundingClientRect().right;
      const node = pastNav.firstChild;
      if (node && node.nodeType === 3 && node.textContent.length >= 4) {
        const range = document.createRange();
        range.setStart(node,0);
        range.setEnd(node,4);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0) right = rect.right;
      }
      right = Math.min(right, viewportRight);
    }
    const left = links.getBoundingClientRect().left;
    const width = Math.floor(right - left);
    if (width > 0) links.style.setProperty('--gg-wide-network-reading-width',width+'px');
    else links.style.removeProperty('--gg-wide-network-reading-width');
  }
  align();
  window.addEventListener('resize',align,{passive:true});
  window.addEventListener('pageshow',align);
  window.addEventListener('load',align,{once:true});
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(align).observe(pastNav,{childList:true,characterData:true,subtree:true});
  }
})();
