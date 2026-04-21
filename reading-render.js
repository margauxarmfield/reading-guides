// Render TOC + month pages from READING_DATA
(function(){
  const data = window.READING_DATA;

  const goodreads = (b) => 'https://www.goodreads.com/search?q=' + encodeURIComponent(b.title);

  // --- Table of Contents ---
  const tocGrid = document.getElementById('tocGrid');
  const seasonColor = {
    spring: 'var(--mint-deep)',
    'spring-deep': '#a9d8b5',
    summer: 'var(--yellow)',
    'summer-warm': '#ffc94a',
    'late-summer': 'var(--orange)',
    fall: 'var(--pink)',
    'fall-warm': '#f7b09c',
    'fall-light': '#f0a3bd',
    'fall-deep': '#d06687',
    winter: 'var(--teal)',
    'winter-light': '#5eb0a5',
    'winter-deep': '#2f7970',
    'winter-cyan': 'var(--cyan)'
  };

  data.forEach((m, i) => {
    const pg = 3 + i;
    const row = document.createElement('div');
    row.className = 'toc-month';
    const hasShared = m.books.some(b => b.shared);
    const sharedBadge = hasShared ? ' <span class="toc-heart" title="Shared read with Andres">♥</span>' : '';
    row.innerHTML = `
      <div class="num">${m.num}</div>
      <div class="label">
        <span class="mname"><span class="toc-dot" style="background:${seasonColor[m.season]}"></span>${m.month}${sharedBadge}</span>
        <span class="books"><a href="${goodreads(m.books[0])}" target="_blank" rel="noopener" class="toc-link">${m.books[0].title}</a> · <a href="${goodreads(m.books[1])}" target="_blank" rel="noopener" class="toc-link">${m.books[1].title}</a></span>
      </div>
      <div class="pg">${String(pg).padStart(2,'0')}</div>
    `;
    tocGrid.appendChild(row);
  });

  // --- Month Pages ---
  const container = document.getElementById('monthPages');

  const formatIcon = (format) => {
    if (format === 'audio') return '♪ Audio';
    return '❖ Physical';
  };
  const renderStars = (r) => {
    const full = Math.floor(r);
    const half = r - full >= 0.3 && r - full < 0.8;
    return '★'.repeat(full) + (half ? '½' : '');
  };

  data.forEach((m, idx) => {
    const page = document.createElement('div');
    page.className = `page month-page ${m.season}`;

    const pageNum = idx + 3;

    page.innerHTML = `
      <div class="month-header">
        <div class="hdr-l">№ ${String(idx + 1).padStart(2,'0')} of Twelve</div>
        <div class="month-name display">${m.month}<span class="num-overlay display-italic">${m.num}</span></div>
        <div class="hdr-r">The Reading Room</div>
      </div>
      <div class="hair"></div>
      <div class="books-spread">
        ${m.books.map((b, bi) => `
          <div class="book-card ${bi === 0 ? 'variant-a' : 'variant-b'} ${b.shared ? 'shared' : ''}"
               data-genre="${b.genre}" data-format="${b.format}">
            <div class="book-meta">
              <span>${b.genre === 'fiction' ? 'Fiction' : 'Nonfiction'}</span>
              <span>${formatIcon(b.format)}</span>
            </div>
            <div class="book-cover-wrap">
              <div class="shape-bg"></div>
              <img src="${(window.__resources && window.__resources[b.slug]) || ('covers/' + b.slug + '.' + (b.ext || 'jpg'))}" alt="${b.title}">
              ${b.shared ? '<div class="shared-ribbon" title="Reading with Andres"><span>♥</span> with Andres</div>' : ''}
            </div>
            <h2 class="book-title"><a href="${goodreads(b)}" target="_blank" rel="noopener" class="title-link">${b.title}</a>${b.shared ? ' <span class="inline-heart">♥</span>' : ''}</h2>
            <div class="book-stats">
              <span>${b.author}</span>
              <span class="tag">${b.pages} pp</span>
              <span class="rating">${renderStars(b.rating)} ${b.rating.toFixed(2)}</span>
            </div>
            <p class="book-blurb">${b.blurb}</p>
            <blockquote class="pull-quote">
              ${b.quote}
              <cite>${b.cite} · ${b.title}</cite>
            </blockquote>
          </div>
          ${bi === 0 ? '<div class="spread-divider"></div>' : ''}
        `).join('')}
      </div>
      <div class="month-footer">
        <span>${m.folio}</span>
        <span class="folio display-italic">pg. ${String(pageNum).padStart(2,'0')}</span>
        <span>A Year of Reading · 2026</span>
      </div>
    `;
    container.appendChild(page);
  });

  // --- Bingo ---
  const bingoGrid = document.getElementById('bingoGrid');
  const progressEl = document.getElementById('bingoProgress');
  const resetBtn = document.getElementById('bingoReset');

  const allBooks = data.flatMap(m => m.books.map(b => ({...b, month: m.month})));
  const eels = {
    slug: "book-of-eels", ext: "jpg", title: "The Book of Eels", author: "Patrik Svensson",
    month: "Now"
  };

  const cells = [];
  for (let i = 0; i < 25; i++) {
    if (i === 12) cells.push(eels);
    else cells.push(allBooks[i < 12 ? i : i - 1]);
  }

  const storageKey = 'reading-bingo-2026-v2';
  let state = {};
  try { state = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch(e){}
  if (!(eels.slug in state)) state[eels.slug] = 'reading';

  function cycle(current) {
    if (!current) return 'reading';
    if (current === 'reading') return 'done';
    return null;
  }

  function render() {
    bingoGrid.innerHTML = '';
    let doneCount = 0, readingCount = 0;
    cells.forEach((b) => {
      const s = state[b.slug];
      const cell = document.createElement('div');
      cell.className = 'bingo-cell';
      if (s === 'reading') { cell.classList.add('reading'); readingCount++; }
      if (s === 'done') { cell.classList.add('done'); doneCount++; }
      if (b.shared) cell.classList.add('shared-cell');
      cell.innerHTML = `
        <img src="${(window.__resources && window.__resources[b.slug]) || ('covers/' + b.slug + '.' + (b.ext || 'jpg'))}" alt="${b.title}">
        <div class="cell-label">${b.month} · <a href="${goodreads(b)}" target="_blank" rel="noopener" class="title-link" onclick="event.stopPropagation()">${b.title}</a></div>
        ${b.shared ? '<span class="shared-heart" title="With Andres">♥</span>' : ''}
        ${s === 'reading' ? '<span class="reading-flag">Reading</span>' : ''}
      `;
      cell.title = b.shared ? `${b.title} — reading with Andres` : 'Click to cycle: unread → reading → completed';
      cell.addEventListener('click', () => {
        const next = cycle(state[b.slug]);
        if (next) state[b.slug] = next;
        else delete state[b.slug];
        localStorage.setItem(storageKey, JSON.stringify(state));
        render();
      });
      bingoGrid.appendChild(cell);
    });
    progressEl.innerHTML = `${doneCount} completed · <em>${readingCount} reading</em>`;
  }
  render();

  resetBtn.addEventListener('click', () => {
    if (!confirm('Reset all progress?')) return;
    state = {};
    localStorage.removeItem(storageKey);
    render();
  });

  // --- Filter bar ---
  const bar = document.getElementById('filterBar');
  const buttons = bar.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cards = document.querySelectorAll('.book-card');
      cards.forEach(c => {
        let match = true;
        if (f === 'all') match = true;
        else if (f === 'fiction' || f === 'nonfiction') match = c.dataset.genre === f;
        else if (f === 'physical' || f === 'audio') match = c.dataset.format === f;
        else if (f === 'shared') match = c.classList.contains('shared');
        c.classList.toggle('dimmed', !match);
      });
    });
  });
})();
