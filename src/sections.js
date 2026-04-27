import { config, galleryImages, couplePhotos } from './config.js';

const fmtDate = (iso) => {
  const d = new Date(iso);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dayShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return {
    iso,
    date: d,
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    dayKo: days[d.getDay()],
    dayEn: dayShort[d.getDay()],
    hh: d.getHours(),
    mm: d.getMinutes(),
    timeText: d.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })
  };
};

const variantHref = () => {
  const v = document.body.dataset.variant || 'ring';
  return v === 'photo' ? './index.html' : './photo.html';
};

const variantLabel = () => {
  const v = document.body.dataset.variant || 'ring';
  return v === 'photo' ? '반지 인트로 보기 →' : '사진 인트로 보기 →';
};

const splitChars = (text) =>
  [...text]
    .map((ch) =>
      ch === ' '
        ? '<span class="char char--space">&nbsp;</span>'
        : `<span class="char">${ch}</span>`
    )
    .join('');

export function buildSections() {
  const w = fmtDate(config.wedding.datetime);
  const root = document.getElementById('app');

  root.innerHTML = `
    ${heroHTML(w)}
    ${greetingHTML()}
    ${coupleHTML()}
    ${gallerySectionHTML()}
    ${calendarHTML(w)}
    ${locationHTML()}
    ${accountHTML()}
    ${shareHTML()}
    <footer class="footer">
      <div>${config.groom.nameEn} &amp; ${config.bride.nameEn} &middot; ${w.year}.${String(w.month).padStart(2, '0')}.${String(w.day).padStart(2, '0')}</div>
      <a class="footer__variant" href="${variantHref()}" data-variant-link>${variantLabel()}</a>
    </footer>
  `;

  bindAccountCopy();
  bindShareButtons();
  bindMapButtons();
  bindCalendarLink();
}

function heroHTML(w) {
  const variant = document.body.dataset.variant || 'ring';
  return variant === 'photo' ? heroPhotoHTML(w) : heroRingHTML(w);
}

function heroRingHTML(w) {
  return `
    <header class="section hero" data-section="hero">
      <div class="hero__top">
        <span>The Wedding of</span>
        <span>${w.year}.${String(w.month).padStart(2, '0')}.${String(w.day).padStart(2, '0')}</span>
      </div>
      <div class="hero__center">
        <h1 class="hero__title">
          <span class="reveal-text" data-text>${splitChars(config.groom.nameEn)}</span>
          <span class="hero__amp">&amp;</span>
          <span class="reveal-text" data-text>${splitChars(config.bride.nameEn)}</span>
        </h1>
        <p class="hero__date reveal">${w.year} &middot; ${String(w.month).padStart(2, '0')} &middot; ${String(w.day).padStart(2, '0')} &middot; ${w.dayEn}</p>
      </div>
      <div class="hero__bottom">
        <span class="hero__scroll">Scroll</span>
        <span>${config.wedding.venueName.split(' ')[0]}</span>
      </div>
    </header>
  `;
}

function heroPhotoHTML(w) {
  return `
    <header class="section hero hero--photo" data-section="hero">
      <div class="hero__photo" style="background-image: url('${couplePhotos.together}')"></div>
      <div class="hero__photo-overlay"></div>
      <div class="hero__top">
        <span>The Wedding of</span>
        <span>${w.year}.${String(w.month).padStart(2, '0')}.${String(w.day).padStart(2, '0')}</span>
      </div>
      <div class="hero__center">
        <h1 class="hero__title">
          <span class="reveal-text" data-text>${splitChars(config.groom.nameEn)}</span>
          <span class="hero__amp">&amp;</span>
          <span class="reveal-text" data-text>${splitChars(config.bride.nameEn)}</span>
        </h1>
        <p class="hero__date reveal">${w.year} &middot; ${String(w.month).padStart(2, '0')} &middot; ${String(w.day).padStart(2, '0')} &middot; ${w.dayEn}</p>
        <p class="hero__names-ko reveal">${config.groom.nameKo} &nbsp;·&nbsp; ${config.bride.nameKo}</p>
      </div>
      <div class="hero__bottom">
        <span class="hero__scroll">Scroll</span>
        <span>${config.wedding.venueName.split(' ')[0]}</span>
      </div>
    </header>
  `;
}

function greetingHTML() {
  return `
    <section class="section greeting" data-section="greeting">
      <p class="eyebrow reveal">Invitation &middot; 모시는 글</p>
      <p class="greeting__text reveal">
        서로의 다름을 마주하며 <em>같은 곳을 바라보기로</em> 약속한 날,<br/>
        가장 따뜻한 마음으로 두 사람의 시작을 함께해 주세요.
      </p>
      <div class="greeting__parents reveal">
        <div>
          <span class="greeting__role">Groom&rsquo;s Parents</span>
          ${config.groom.father} &middot; ${config.groom.mother}
        </div>
        <span class="divider"></span>
        <div>
          <span class="greeting__role">Bride&rsquo;s Parents</span>
          ${config.bride.father} &middot; ${config.bride.mother}
        </div>
      </div>
    </section>
  `;
}

function coupleHTML() {
  return `
    <section class="section couple" data-section="couple">
      <article class="couple__card reveal">
        <div class="couple__photo" style="background-image:url('${couplePhotos.groom}')"></div>
        <div class="couple__role">Groom</div>
        <div class="couple__name">${config.groom.nameEn}</div>
        <div class="couple__name-ko">${config.groom.nameKo}</div>
      </article>
      <article class="couple__card reveal">
        <div class="couple__photo" style="background-image:url('${couplePhotos.bride}')"></div>
        <div class="couple__role">Bride</div>
        <div class="couple__name">${config.bride.nameEn}</div>
        <div class="couple__name-ko">${config.bride.nameKo}</div>
      </article>
    </section>
  `;
}

function gallerySectionHTML() {
  const cells = galleryImages
    .map((src, i) => `<div class="gallery__cell ${i % 5 === 0 ? 'gallery__cell--tall' : ''}" style="background-image:url('${src}')"></div>`)
    .join('');
  return `
    <section class="section gallery section--wide" data-section="gallery">
      <p class="eyebrow reveal">Moments &middot; 우리의 순간들</p>
      <h2 class="display display--script reveal">우리의 순간들</h2>
      <div class="gallery__grid reveal" style="margin-top:48px">${cells}</div>
    </section>
  `;
}

function calendarHTML(w) {
  const date = w.date;
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const headers = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    .map((d) => `<div class="calendar__head">${d}</div>`)
    .join('');

  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += '<div class="calendar__cell"></div>';
  for (let d = 1; d <= lastDate; d++) {
    const isToday = d === w.day;
    cells += `<div class="calendar__cell${isToday ? ' calendar__cell--today' : ''}">${d}</div>`;
  }

  return `
    <section class="section calendar" data-section="calendar">
      <p class="eyebrow reveal">When &middot; 일시</p>
      <h2 class="display display--script reveal">${w.year}<br/>${w.date.toLocaleString('en-US', { month: 'long' })} ${w.day}</h2>
      <p class="lead reveal" style="margin-top:18px">${w.dayKo}요일 &middot; ${w.timeText}</p>
      <div class="calendar__grid reveal">${headers}${cells}</div>
      <div class="calendar__dday reveal" data-dday>
        <div class="calendar__dday-cell"><span class="calendar__dday-num" data-d>--</span><span class="calendar__dday-label">Days</span></div>
        <div class="calendar__dday-cell"><span class="calendar__dday-num" data-h>--</span><span class="calendar__dday-label">Hours</span></div>
        <div class="calendar__dday-cell"><span class="calendar__dday-num" data-m>--</span><span class="calendar__dday-label">Minutes</span></div>
        <div class="calendar__dday-cell"><span class="calendar__dday-num" data-s>--</span><span class="calendar__dday-label">Seconds</span></div>
      </div>
      <div class="location__buttons reveal" style="margin-top:36px;max-width:420px;margin-left:auto;margin-right:auto">
        <a class="btn" data-cal href="#" target="_blank" rel="noopener">캘린더에 추가</a>
      </div>
    </section>
  `;
}

function locationHTML() {
  return `
    <section class="section location" data-section="location">
      <p class="eyebrow reveal">Where &middot; 오시는 길</p>
      <h2 class="location__name reveal">${config.wedding.venueName}</h2>
      <p class="location__address reveal">${config.wedding.venueAddress}</p>
      <div class="location__map-placeholder reveal">Map &middot; coming soon</div>
      <div class="location__buttons reveal">
        <button class="btn" data-map="kakao">Kakao Map</button>
        <button class="btn" data-map="naver">Naver Map</button>
        <button class="btn" data-map="tmap">T Map</button>
      </div>

      <dl class="transport reveal">
        <div class="transport__row"><dt>Subway</dt><dd>이태원역(6호선) 2번 출구에서 도보 8분</dd></div>
        <div class="transport__row"><dt>Bus</dt><dd>해방촌오거리 정류장 하차 (110, 421)</dd></div>
        <div class="transport__row"><dt>Parking</dt><dd>호텔 지하주차장 3시간 무료</dd></div>
      </dl>
    </section>
  `;
}

function accountHTML() {
  return `
    <section class="section account" data-section="account">
      <p class="eyebrow reveal">Heart &middot; 마음</p>
      <h2 class="display display--script reveal">마음 전하실 곳</h2>
      <p class="lead reveal" style="margin-top:14px">참석이 어려우신 분들을 위해 안내드립니다</p>

      <div class="account__group reveal">
        <details class="account__row">
          <summary class="account__summary"><span>Groom &middot; ${config.groom.nameKo}</span></summary>
          <div class="account__list">
            ${accountRow(config.groom.account)}
          </div>
        </details>
        <details class="account__row">
          <summary class="account__summary"><span>Bride &middot; ${config.bride.nameKo}</span></summary>
          <div class="account__list">
            ${accountRow(config.bride.account)}
          </div>
        </details>
      </div>
    </section>
  `;
}

function accountRow(text) {
  return `
    <div class="account__item">
      <div class="account__item-info">
        <b>${text}</b>
      </div>
      <button class="account__copy" data-copy="${text}" type="button">Copy</button>
    </div>
  `;
}

function shareHTML() {
  return `
    <section class="section share" data-section="share">
      <p class="eyebrow reveal">Share &middot; 공유</p>
      <h2 class="display display--script reveal">소식을 전하다</h2>
      <div class="share__buttons reveal">
        <button class="btn btn--primary" data-share="kakao">KakaoTalk</button>
        <button class="btn" data-share="link">Copy Link</button>
      </div>
    </section>
  `;
}

function bindAccountCopy() {
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        const orig = btn.textContent;
        btn.textContent = 'Copied';
        setTimeout(() => (btn.textContent = orig), 1400);
      } catch {
        /* noop */
      }
    });
  });
}

function bindShareButtons() {
  document.querySelectorAll('[data-share="link"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        const orig = btn.textContent;
        btn.textContent = 'Copied';
        setTimeout(() => (btn.textContent = orig), 1400);
      } catch {
        /* noop */
      }
    });
  });

  document.querySelectorAll('[data-share="kakao"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      // Real Kakao share requires Kakao SDK + key — placeholder for now
      alert('카카오톡 공유는 배포 후 Kakao SDK 키 연결 시 활성화됩니다.');
    });
  });

  // D-Day countdown
  const target = new Date(config.wedding.datetime).getTime();
  scheduleCountdown(target);
}

function scheduleCountdown(target) {
  const dEl = document.querySelector('[data-dday]');
  if (!dEl) return;
  const dD = dEl.querySelector('[data-d]');
  const dH = dEl.querySelector('[data-h]');
  const dM = dEl.querySelector('[data-m]');
  const dS = dEl.querySelector('[data-s]');
  const tick = () => {
    const diff = Math.max(0, target - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    dD.textContent = String(days);
    dH.textContent = String(hours).padStart(2, '0');
    dM.textContent = String(mins).padStart(2, '0');
    dS.textContent = String(secs).padStart(2, '0');
  };
  tick();
  setInterval(tick, 1000);
}

function bindMapButtons() {
  const venue = encodeURIComponent(config.wedding.venueName);
  const addr = encodeURIComponent(config.wedding.venueAddress);
  const { lat, lng } = config.wedding;

  const urls = {
    // Kakao Map: web search by venue name
    kakao: `https://map.kakao.com/?q=${venue}`,
    // Naver Map: search by query (mobile-friendly)
    naver: `https://map.naver.com/p/search/${venue}`,
    // TMap: web link with coordinates
    tmap: `https://tmap.life/route/public?goalname=${venue}&goalx=${lng}&goaly=${lat}`
  };

  document.querySelectorAll('[data-map]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = urls[btn.dataset.map];
      if (url) window.open(url, '_blank', 'noopener');
    });
  });
}

function bindCalendarLink() {
  const link = document.querySelector('[data-cal]');
  if (!link) return;
  const start = new Date(config.wedding.datetime);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hour event
  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${config.groom.nameKo} ♥ ${config.bride.nameKo} 결혼식`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `${config.wedding.venueName}\n${config.wedding.venueAddress}`,
    location: config.wedding.venueAddress
  });
  link.href = `https://calendar.google.com/calendar/render?${params.toString()}`;
}
