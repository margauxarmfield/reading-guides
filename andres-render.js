// Render TOC + month pages from READING_DATA — Andres's edition
(function(){
  const data = window.READING_DATA;

  const goodreads = (b) => 'https://www.goodreads.com/search?q=' + encodeURIComponent(b.title);

  // --- Table of Contents ---
  const tocGrid = document.getElementById('tocGrid');
  const seasonColor = {
    // Spring
    peach: '#F2B48A',
    coral: '#E8916A',
    // Summer
    orange: '#D9773A',
    amber: '#E8A440',
    gold: '#D4A04A',
    // Autumn
    moss: '#8A9A7B',
    olive: '#6B7A5A',
    sienna: '#9E5430',
    // Winter
    umber: '#7A5A3C',
    teal: '#3F6B6E',
    slate: '#2E4A5C',
    'espresso-bg': '#3D2F24'
  };

  data.forEach((m, i) => {
    const pg = 3 + i;
    const row = document.createElement('div');
    row.className = 'toc-month';
    const sharedBadge = m.shared ? ' <span class="toc-heart" title="Shared read with Margaux">♥</span>' : '';
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
        <div class="hdr-r">Andres' Reading Room</div>
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
              ${b.shared ? '<div class="shared-ribbon" title="Reading with Margaux"><span class="heart">♥</span> with Margaux</div>' : ''}
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
        <span>A Year of Reading · for Andres</span>
      </div>
    `;
    container.appendChild(page);
  });

  // --- Bingo ---
  const bingoGrid = document.getElementById('bingoGrid');
  const progressEl = document.getElementById('bingoProgress');
  const resetBtn = document.getElementById('bingoReset');

  const allBooks = data.flatMap(m => m.books.map(b => ({...b, month: m.month, monthShared: data.find(mm=>mm.books.includes(b))?.shared})));

  // Currently-reading freespace book (Theo of Golden)
  const theo = {
    slug: "theo-golden", ext: "jpg", title: "Theo of Golden", author: "Allen Levi",
    month: "Now · currently reading", freespace: true
  };

  const cells = [];
  // 25 cells — Theo of Golden sits in the center "free" square
  for (let i = 0; i < 25; i++) {
    if (i === 12) cells.push(theo);
    else cells.push(allBooks[i < 12 ? i : i - 1]);
  }

  const storageKey = 'andres-reading-bingo-2026-v1';
  let state = {};
  try { state = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch(e){}

  function cycle(current) {
    if (!current) return 'reading';
    if (current === 'reading') return 'done';
    return null;
  }

  function render() {
    bingoGrid.innerHTML = '';
    let doneCount = 0, readingCount = 0;
    cells.forEach((b) => {
      const cell = document.createElement('div');
      if (!b) {
        cell.className = 'bingo-cell freespace';
        cell.innerHTML = `<div class="fs-inner"><strong>A</strong>for<br>Andres</div>`;
        bingoGrid.appendChild(cell);
        return;
      }
      const s = state[b.slug];
      cell.className = 'bingo-cell';
      if (s === 'reading') { cell.classList.add('reading'); readingCount++; }
      if (s === 'done') { cell.classList.add('done'); doneCount++; }
      if (b.shared) cell.classList.add('shared-cell');
      if (b.freespace) cell.classList.add('wildcard');
      cell.innerHTML = `
        <img src="${(window.__resources && window.__resources[b.slug]) || ('covers/' + b.slug + '.' + (b.ext || 'jpg'))}" alt="${b.title}">
        <div class="cell-label">${b.month} · <a href="${goodreads(b)}" target="_blank" rel="noopener" class="title-link" onclick="event.stopPropagation()">${b.title}</a></div>
        ${b.shared ? '<span class="shared-heart" title="With Margaux">♥</span>' : ''}
        ${b.freespace ? '<span class="wildcard-flag">Now Reading</span>' : ''}
        ${s === 'reading' ? '<span class="reading-flag">Reading</span>' : ''}
      `;
      cell.title = b.shared ? `${b.title} — reading with Margaux` : 'Click to cycle: unread → reading → completed';
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
