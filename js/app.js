// ============================================================
// 곱셈구구 색칠하기 - 메인 게임 로직
// ============================================================
const STORAGE_KEY = 'gugudan-coloring-progress-v1';
const SVG_NS = 'http://www.w3.org/2000/svg';

// ---------- 진행 상황 저장/불러오기 ----------
function loadProgress() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) { return {}; }
}
function saveProgress(p) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch (e) { /* noop */ }
}
let progress = loadProgress();

function starString(stars) {
    return '★★★'.slice(0, stars) + '☆☆☆'.slice(0, 3 - stars);
}
function totalStars() {
    return ANIMALS.reduce((sum, a) => sum + (progress[a.id] ? progress[a.id].stars : 0), 0);
}

// ---------- 화면 전환 ----------
function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${name}`).classList.add('active');
    window.scrollTo(0, 0);
}
function goTitle() { playSound('click'); showScreen('title'); }
function goSelect() { playSound('click'); renderSelectScreen(); showScreen('select'); }
function goBook() { playSound('click'); renderBookScreen(); showScreen('book'); }

// ============================================================
// 동물 그림 만들기 (플레이 화면 / 카드 / 도감에서 공용으로 사용)
// ============================================================
function shapeMarkup(region, attrs) {
    const a = region.attrs;
    const extra = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
    const rot = a.rotate ? ` transform="rotate(${a.rotate} ${a.cx} ${a.cy})"` : '';
    switch (region.shape) {
        case 'rect':
            return `<rect x="${a.x}" y="${a.y}" width="${a.width}" height="${a.height}" rx="${a.rx}" ${extra} />`;
        case 'ellipse':
            return `<ellipse cx="${a.cx}" cy="${a.cy}" rx="${a.rx}" ry="${a.ry}" ${extra}${rot} />`;
        case 'circle':
            return `<circle cx="${a.cx}" cy="${a.cy}" r="${a.r}" ${extra} />`;
        case 'polygon':
            return `<polygon points="${a.points}" ${extra} />`;
        case 'path':
            return `<path d="${a.d}" ${extra} />`;
    }
    return '';
}

// mode: 'color'(완성본) | 'outline'(색칠 전) | 'silhouette'(도감 미수집)
function buildAnimalSvg(animal, mode, className) {
    let inner = '';
    animal.regions.forEach(region => {
        if (mode === 'silhouette' && region.id === 'background') return;
        let fill = '#FFFFFF', stroke = '#2B2B3A';
        if (mode === 'color') fill = region.color;
        if (mode === 'silhouette') { fill = '#DFD7C6'; stroke = '#CBC2AD'; }
        inner += shapeMarkup(region, { fill, stroke, 'stroke-width': 4, 'stroke-linejoin': 'round' });
        if (region.id === 'background' && mode !== 'silhouette') {
            (animal.decorBottom || []).forEach(d => { inner += `<g>${d}</g>`; });
        }
    });
    if (mode !== 'silhouette') {
        (animal.decorTop || []).forEach(d => { inner += `<g>${d}</g>`; });
    }
    return `<svg viewBox="0 0 400 400" class="${className || ''}" aria-hidden="true">${inner}</svg>`;
}

// ============================================================
// 구구단 셀렉트 화면
// ============================================================
function renderSelectScreen() {
    const grid = document.getElementById('select-grid');
    grid.innerHTML = '';
    document.getElementById('select-stars').textContent = `⭐ ${totalStars()} / ${ANIMALS.length * 3}`;

    ANIMALS.forEach(animal => {
        const rec = progress[animal.id];
        const stars = rec ? rec.stars : 0;
        const card = document.createElement('button');
        card.className = 'cart-card' + (rec ? ' cleared' : '');
        card.style.background = animal.cardBg;
        card.onclick = () => { playSound('select'); startGame(animal); };
        card.innerHTML = `
            <div class="cart-table">${animal.table}단</div>
            <div class="cart-art">${buildAnimalSvg(animal, rec ? 'color' : 'outline', 'thumb-svg')}</div>
            <div class="cart-name">${animal.name}</div>
            <div class="cart-stars">${starString(stars)}</div>
        `;
        grid.appendChild(card);
    });

    const randCard = document.createElement('button');
    randCard.className = 'cart-card cart-card-random';
    randCard.onclick = () => { playSound('select'); startGame(pickRandomAnimal(), true); };
    randCard.innerHTML = `
        <div class="cart-table">2단 ~ 9단</div>
        <div class="cart-art cart-art-dice">🎲</div>
        <div class="cart-name">랜덤 도전!</div>
        <div class="cart-stars">섞어서 풀기</div>
    `;
    grid.appendChild(randCard);
}

// ============================================================
// 도감 화면
// ============================================================
function renderBookScreen() {
    const grid = document.getElementById('book-grid');
    grid.innerHTML = '';
    let collected = 0;

    ANIMALS.forEach(animal => {
        const rec = progress[animal.id];
        const slot = document.createElement('div');
        slot.className = 'book-slot' + (rec ? ' collected' : '');
        if (rec) collected++;
        slot.innerHTML = `
            <div class="book-art">${buildAnimalSvg(animal, rec ? 'color' : 'silhouette', 'thumb-svg')}</div>
            <div class="book-name">${rec ? animal.name : '???'}</div>
            <div class="book-stars">${starString(rec ? rec.stars : 0)}</div>
        `;
        grid.appendChild(slot);
    });

    document.getElementById('book-summary').textContent = `모은 동물: ${collected} / ${ANIMALS.length}  ·  ⭐ ${totalStars()} / ${ANIMALS.length * 3}`;
    document.getElementById('book-complete-badge').classList.toggle('hidden', collected < ANIMALS.length);
}

// ============================================================
// 문제 만들기
// ============================================================
let currentGame = null;

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function buildProblems(animal, isRandom) {
    const regions = animal.regions;
    let multipliers, tables;

    if (isRandom) {
        let attempt = 0, answers;
        do {
            tables = regions.map(() => 2 + Math.floor(Math.random() * 8));      // 2~9단
            multipliers = regions.map(() => 2 + Math.floor(Math.random() * 7)); // 2~8
            answers = tables.map((t, i) => t * multipliers[i]);
            attempt++;
        } while (new Set(answers).size !== answers.length && attempt < 30);
    } else {
        tables = regions.map(() => animal.table);
        multipliers = shuffle([2, 3, 4, 5, 6, 7, 8]);
    }

    const problems = regions.map((region, i) => ({
        region,
        table: tables[i],
        multiplier: multipliers[i],
        answer: tables[i] * multipliers[i],
    }));

    // 헷갈리게 하는 오답 물감 2개
    const answerSet = new Set(problems.map(p => p.answer));
    const decoys = [];
    const decoyColors = [
        { hex: '#B8C4CE', border: '#8A97A3' },
        { hex: '#D9C7A6', border: '#B0A075' },
    ];
    let guard = 0;
    while (decoys.length < 2 && guard < 200) {
        guard++;
        const t = isRandom ? 2 + Math.floor(Math.random() * 8) : animal.table;
        const m = 1 + Math.floor(Math.random() * 9);
        const val = t * m;
        if (!answerSet.has(val) && !decoys.some(d => d.val === val)) {
            decoys.push({ val, math: `${t} × ${m}`, ...decoyColors[decoys.length] });
        }
    }
    return { problems, decoys };
}

// ============================================================
// 문제 라벨 자동 배치
//   각 라벨을 "자기 영역 안에서 다른 도형에 가려지지 않는 가장 넓은 자리"에 놓고,
//   자리가 좁으면 영역 밖으로 빼서 지시선으로 연결한다.
// ============================================================
function collectDrawables(svg) {
    return Array.from(svg.querySelectorAll('rect, circle, ellipse, polygon, path')).filter(el => {
        if (el.closest('.label-layer')) return false;   // 문제 라벨은 가림 판정에서 제외
        const f = el.getAttribute('fill');
        if (!f || f === 'none') return false;
        return parseFloat(el.getAttribute('opacity') || '1') >= 0.8;
    });
}

function makeHitTester(svg) {
    const pt = svg.createSVGPoint();
    return function (el, x, y) {
        pt.x = x; pt.y = y;
        let local = pt;
        const tf = el.transform.baseVal.consolidate();
        if (tf) local = pt.matrixTransform(tf.matrix.inverse());
        try { return el.isPointInFill(local); } catch (e) { return false; }
    };
}

function rootBBox(el) {
    const bb = el.getBBox();
    const tf = el.transform.baseVal.consolidate();
    if (!tf) return { x: bb.x, y: bb.y, w: bb.width, h: bb.height };
    const m = tf.matrix;
    const pts = [[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]]
        .map(([x, y]) => ({ x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f }));
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}

// 영역 안에서 "보이는" 칸들을 넓은 순으로 반환
function visibleSpots(regionEl, later, hit) {
    const bb = rootBBox(regionEl);
    const step = Math.max(2.5, Math.min(bb.w, bb.h) / 20);
    const cols = Math.max(1, Math.ceil(bb.w / step));
    const rows = Math.max(1, Math.ceil(bb.h / step));

    const ok = [];
    for (let r = 0; r < rows; r++) {
        ok[r] = [];
        for (let c = 0; c < cols; c++) {
            const x = bb.x + (c + 0.5) * step;
            const y = bb.y + (r + 0.5) * step;
            let v = hit(regionEl, x, y);
            if (v) { for (const d of later) { if (hit(d, x, y)) { v = false; break; } } }
            ok[r][c] = v;
        }
    }

    // 체임퍼 거리 변환 - 가려진 곳/경계에서 얼마나 떨어져 있는지
    const INF = 1e6;
    const dist = ok.map(row => row.map(v => (v ? INF : 0)));
    const at = (r, c) => (r < 0 || c < 0 || r >= rows || c >= cols) ? 0 : dist[r][c];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        if (!ok[r][c]) continue;
        dist[r][c] = Math.min(dist[r][c], at(r - 1, c) + 1, at(r, c - 1) + 1, at(r - 1, c - 1) + 1.414, at(r - 1, c + 1) + 1.414);
    }
    for (let r = rows - 1; r >= 0; r--) for (let c = cols - 1; c >= 0; c--) {
        if (!ok[r][c]) continue;
        dist[r][c] = Math.min(dist[r][c], at(r + 1, c) + 1, at(r, c + 1) + 1, at(r + 1, c + 1) + 1.414, at(r + 1, c - 1) + 1.414);
    }

    const spots = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        if (ok[r][c]) spots.push({ x: bb.x + (c + 0.5) * step, y: bb.y + (r + 0.5) * step, clear: dist[r][c] * step });
    }
    spots.sort((a, b) => b.clear - a.clear);
    return spots;
}

function chipFits(hit, regionEl, later, cx, cy, w, h) {
    const dx = w / 2 - 3, dy = h / 2 - 2;
    const offsets = [[0, 0], [-dx, 0], [dx, 0], [0, -dy], [0, dy],
                     [-dx * 0.8, -dy * 0.7], [dx * 0.8, -dy * 0.7], [-dx * 0.8, dy * 0.7], [dx * 0.8, dy * 0.7]];
    for (const [ox, oy] of offsets) {
        const x = cx + ox, y = cy + oy;
        if (!hit(regionEl, x, y)) return false;
        for (const d of later) { if (hit(d, x, y)) return false; }
    }
    return true;
}

function overlapsAny(placed, x, y, w, h) {
    const pad = 5;
    return placed.some(p =>
        Math.abs(p.x - x) < (p.w + w) / 2 + pad && Math.abs(p.y - y) < (p.h + h) / 2 + pad);
}

function findOutsideSpot(anchor, w, h, placed) {
    let baseAng = Math.atan2(anchor.y - 200, anchor.x - 200);
    if (!isFinite(baseAng)) baseAng = -Math.PI / 2;
    const angles = [];
    for (let k = 0; k < 16; k++) {
        const off = (k % 2 === 0 ? 1 : -1) * Math.ceil(k / 2) * (Math.PI / 8);
        angles.push(baseAng + off);
    }
    for (const r of [46, 60, 76, 94, 114, 136]) {
        for (const ang of angles) {
            const x = anchor.x + Math.cos(ang) * r;
            const y = anchor.y + Math.sin(ang) * r;
            if (x - w / 2 < 6 || x + w / 2 > 394 || y - h / 2 < 6 || y + h / 2 > 394) continue;
            if (overlapsAny(placed, x, y, w, h)) continue;
            return { x, y };
        }
    }
    return {
        x: Math.min(Math.max(anchor.x, 6 + w / 2), 394 - w / 2),
        y: Math.min(Math.max(anchor.y - 42, 6 + h / 2), 394 - h / 2),
    };
}

function measureText(svg, str, fontSize) {
    const t = document.createElementNS(SVG_NS, 'text');
    t.setAttribute('class', 'chip-text');
    t.setAttribute('font-size', fontSize);
    t.setAttribute('visibility', 'hidden');
    t.textContent = str;
    svg.appendChild(t);
    const w = t.getComputedTextLength();
    t.remove();
    return w;
}

function layoutLabels(svg, animal, problems) {
    const hit = makeHitTester(svg);
    const drawables = collectDrawables(svg);
    const byRegion = {};
    problems.forEach(p => { byRegion[p.region.id] = p; });

    // 넓은 영역부터 자리를 잡고, 좁은 영역이 남은 자리를 찾도록 한다
    const ordered = animal.regions.slice().sort((a, b) => {
        const ba = rootBBox(document.getElementById(a.id));
        const bb = rootBBox(document.getElementById(b.id));
        return (bb.w * bb.h) - (ba.w * ba.h);
    });

    const placed = [];
    const anchors = {};
    let markup = '';

    ordered.forEach(region => {
        const el = document.getElementById(region.id);
        const problem = byRegion[region.id];
        const text = `${problem.table} × ${problem.multiplier}`;
        const later = drawables.slice(drawables.indexOf(el) + 1);
        const spots = visibleSpots(el, later, hit);
        const bb = rootBBox(el);
        const anchor = spots[0] || { x: bb.x + bb.w / 2, y: bb.y + bb.h / 2, clear: 0 };
        anchors[region.id] = { x: anchor.x, y: anchor.y };

        let chip = null;
        for (const fs of [16, 14, 12]) {
            const w = measureText(svg, text, fs) + 16;
            const h = fs + 11;
            for (const s of spots.slice(0, 60)) {
                if (s.clear < h * 0.4) break;   // 이 크기로는 더 볼 자리가 없음
                if (!chipFits(hit, el, later, s.x, s.y, w, h)) continue;
                if (overlapsAny(placed, s.x, s.y, w, h)) continue;
                chip = { x: s.x, y: s.y, w, h, fs, leader: false };
                break;
            }
            if (chip) break;
        }
        if (!chip) {
            const fs = 14;
            const w = measureText(svg, text, fs) + 16;
            const h = fs + 11;
            const spot = findOutsideSpot(anchor, w, h, placed);
            chip = { x: spot.x, y: spot.y, w, h, fs, leader: true };
        }
        placed.push({ x: chip.x, y: chip.y, w: chip.w, h: chip.h });

        const leader = chip.leader
            ? `<line class="leader" x1="${chip.x.toFixed(1)}" y1="${chip.y.toFixed(1)}" x2="${anchor.x.toFixed(1)}" y2="${anchor.y.toFixed(1)}"/>
               <circle class="leader-dot" cx="${anchor.x.toFixed(1)}" cy="${anchor.y.toFixed(1)}" r="5"/>`
            : '';

        markup += `
            <g class="label" id="label-${region.id}" onclick="colorRegion('${region.id}')">
                ${leader}
                <rect class="chip-bg" x="${(chip.x - chip.w / 2).toFixed(1)}" y="${(chip.y - chip.h / 2).toFixed(1)}"
                      width="${chip.w.toFixed(1)}" height="${chip.h.toFixed(1)}" rx="${(chip.h / 2).toFixed(1)}"/>
                <text class="chip-text" x="${chip.x.toFixed(1)}" y="${(chip.y + 0.5).toFixed(1)}" font-size="${chip.fs}"
                      text-anchor="middle" dominant-baseline="central">${text}</text>
                <g class="label-done" transform="translate(${anchor.x.toFixed(1)} ${anchor.y.toFixed(1)})">
                    <g class="done-inner">
                        <circle r="14" fill="#FFFFFF" stroke="${region.border}" stroke-width="3.5"/>
                        <path d="M -6 0.5 L -1.5 5 L 6 -4.5" fill="none" stroke="${region.border}"
                              stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                </g>
            </g>`;
    });

    const layer = document.createElementNS(SVG_NS, 'g');
    layer.setAttribute('class', 'label-layer');
    layer.innerHTML = markup;
    svg.appendChild(layer);
    return anchors;
}

// ============================================================
// 색칠 게임
// ============================================================
function startGame(animal, isRandom = false) {
    const { problems, decoys } = buildProblems(animal, isRandom);

    currentGame = {
        animal, isRandom, problems, decoys,
        selectedPaletteIndex: null,
        wrongCount: 0,
        hintCount: 0,
        filledCount: 0,
        anchors: {},
    };

    currentGame.palette = shuffle(
        problems.map(p => ({
            val: p.answer, math: `${p.table} × ${p.multiplier}`,
            hex: p.region.color, border: p.region.border, regionId: p.region.id,
        })).concat(decoys.map(d => ({ val: d.val, math: d.math, hex: d.hex, border: d.border, regionId: null })))
    );

    document.getElementById('play-title').textContent = isRandom
        ? `랜덤 도전 - ${animal.name}` : `${animal.table}단 - ${animal.name}`;
    document.getElementById('play-emoji').textContent = isRandom ? '🎲' : animal.emoji;

    document.getElementById('victory-overlay').classList.add('hidden');
    renderPalette();
    setCoach('coach-default', '팔레트에서 정답 물감을 고른 다음, 그림의 문제를 눌러요!');
    updateProgressBar();

    // 라벨 자리 계산은 도형 크기를 재야 하므로 반드시 화면을 띄운 뒤에 한다
    showScreen('play');
    renderPlaySvg();
}

function renderPlaySvg() {
    const { animal, problems } = currentGame;
    const byRegion = {};
    problems.forEach(p => { byRegion[p.region.id] = p; });

    let inner = '';
    animal.regions.forEach(region => {
        const p = byRegion[region.id];
        inner += shapeMarkup(region, {
            id: region.id, class: 'svg-region',
            fill: '#FFFFFF', stroke: '#2B2B3A', 'stroke-width': 4, 'stroke-linejoin': 'round',
            'data-ans': p.answer, 'data-filled': 'false',
            onclick: `colorRegion('${region.id}')`,
        });
        if (region.id === 'background') {
            (animal.decorBottom || []).forEach(d => { inner += `<g class="decor" pointer-events="none">${d}</g>`; });
        }
    });
    (animal.decorTop || []).forEach(d => { inner += `<g class="decor" pointer-events="none">${d}</g>`; });

    const container = document.getElementById('svg-container');
    container.innerHTML = `<svg viewBox="0 0 400 400" class="game-svg">${inner}</svg>`;
    const svg = container.querySelector('svg');
    currentGame.anchors = layoutLabels(svg, animal, problems);
}

function renderPalette() {
    const grid = document.getElementById('palette-grid');
    grid.innerHTML = '';
    currentGame.palette.forEach((item, idx) => {
        const btn = document.createElement('button');
        btn.className = 'palette-btn';
        btn.id = `palette-${idx}`;
        btn.style.backgroundColor = item.hex;
        btn.style.borderColor = item.border;
        btn.onclick = () => selectColor(idx);
        btn.innerHTML = `<span class="palette-val">${item.val}</span><span class="palette-check">✓</span>`;
        grid.appendChild(btn);
    });
}

function refreshPaletteState() {
    currentGame.palette.forEach((item, idx) => {
        const btn = document.getElementById(`palette-${idx}`);
        if (!btn || !item.regionId) return;
        const el = document.getElementById(item.regionId);
        btn.classList.toggle('used', !!el && el.getAttribute('data-filled') === 'true');
    });
}

function selectColor(index) {
    currentGame.selectedPaletteIndex = index;
    playSound('select');
    document.querySelectorAll('.palette-btn').forEach((b, i) => b.classList.toggle('selected', i === index));
    const item = currentGame.palette[index];
    setCoach('coach-selected',
        `<strong>${item.val}</strong> 물감을 들었어요! 답이 ${item.val}인 문제를 눌러요.`, item.hex);
}

function setCoach(kind, html, dotColor) {
    const info = document.getElementById('selection-info');
    info.className = `coach ${kind}`;
    info.innerHTML = (dotColor ? `<span class="coach-dot" style="background:${dotColor}"></span>` : '') +
        `<span class="coach-text">${html}</span>`;
}

function splashAt(x, y, color) {
    const svg = document.querySelector('.game-svg');
    if (!svg) return;
    const c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 8);
    c.setAttribute('fill', 'none'); c.setAttribute('stroke', color);
    c.setAttribute('stroke-width', 8); c.setAttribute('class', 'splash');
    svg.insertBefore(c, svg.querySelector('.label-layer'));
    setTimeout(() => c.remove(), 700);
}

function colorRegion(regionId) {
    if (!currentGame) return;
    if (currentGame.selectedPaletteIndex === null) {
        playSound('wrong');
        setCoach('coach-warn', '먼저 아래에서 물감을 하나 골라주세요!');
        return;
    }

    const item = currentGame.palette[currentGame.selectedPaletteIndex];
    const regionEl = document.getElementById(regionId);
    const labelEl = document.getElementById(`label-${regionId}`);
    const targetAns = parseInt(regionEl.getAttribute('data-ans'), 10);
    const wasFilled = regionEl.getAttribute('data-filled') === 'true';
    const anchor = currentGame.anchors[regionId] || { x: 200, y: 200 };

    if (wasFilled) {
        setCoach('coach-default', '여긴 벌써 다 칠했어요! 다른 문제를 찾아봐요.');
        return;
    }

    if (item.val === targetAns) {
        regionEl.setAttribute('data-filled', 'true');
        regionEl.style.fill = item.hex;
        currentGame.filledCount++;
        if (labelEl) labelEl.classList.add('done');

        playSound('brush');
        setTimeout(() => playSound('correct'), 90);
        splashAt(anchor.x, anchor.y, item.border);

        regionEl.classList.remove('pop');
        void regionEl.offsetWidth;
        regionEl.classList.add('pop');

        const left = currentGame.animal.regions.length - currentGame.filledCount;
        setCoach('coach-correct', left > 0 ? `좋아요! 앞으로 ${left}개 남았어요 🎉` : '완성했어요! 🎉');
        refreshPaletteState();
        updateProgressBar();

        if (currentGame.filledCount === currentGame.animal.regions.length) {
            setTimeout(triggerVictory, 500);
        }
    } else {
        currentGame.wrongCount++;
        playSound('wrong');
        regionEl.classList.remove('wiggle');
        void regionEl.offsetWidth;
        regionEl.classList.add('wiggle');
        if (labelEl) {
            labelEl.classList.remove('shake');
            void labelEl.offsetWidth;
            labelEl.classList.add('shake');
        }
        setCoach('coach-wrong', `앗, 이 문제의 답은 ${item.val}이 아니에요. 다시 세어볼까요?`);
    }
}

function updateProgressBar() {
    const total = currentGame.animal.regions.length;
    const percent = Math.round((currentGame.filledCount / total) * 100);
    document.getElementById('progress-text').textContent = `${currentGame.filledCount} / ${total}`;
    document.getElementById('progress-fill').style.width = `${percent}%`;
}

function giveHint() {
    if (!currentGame) return;
    playSound('click');
    currentGame.hintCount++;

    const target = currentGame.problems.find(p =>
        document.getElementById(p.region.id).getAttribute('data-filled') !== 'true');
    if (!target) return;

    setCoach('coach-hint',
        `💡 <strong>${target.table} × ${target.multiplier}</strong> 는 ${target.table}을 ${target.multiplier}번 더한 것! 답은 <strong>${target.answer}</strong> 이에요.`);

    const el = document.getElementById(target.region.id);
    const label = document.getElementById(`label-${target.region.id}`);
    el.classList.add('hint-glow');
    if (label) label.classList.add('hint');
    setTimeout(() => {
        el.classList.remove('hint-glow');
        if (label) label.classList.remove('hint');
    }, 1800);

    // 정답 물감도 같이 반짝이게
    const idx = currentGame.palette.findIndex(p => p.regionId === target.region.id);
    const btn = document.getElementById(`palette-${idx}`);
    if (btn) {
        btn.classList.add('hint');
        setTimeout(() => btn.classList.remove('hint'), 1800);
    }
}

function resetGame() {
    playSound('click');
    startGame(currentGame.animal, currentGame.isRandom);
}

function triggerVictory() {
    const { animal, isRandom, wrongCount, hintCount } = currentGame;
    let stars = 3;
    if (wrongCount + hintCount > 2) stars = 1;
    else if (wrongCount + hintCount > 0) stars = 2;

    const prev = progress[animal.id];
    const isNewRecord = !isRandom && (!prev || stars > prev.stars);
    if (isNewRecord) {
        progress[animal.id] = { stars };
        saveProgress(progress);
    }

    // 완성된 그림이 잘 보이도록 문제 표시를 걷어낸다
    const svg = document.querySelector('.game-svg');
    if (svg) svg.classList.add('art-complete');

    playSound('victory');
    document.getElementById('victory-art').innerHTML = buildAnimalSvg(animal, 'color', 'thumb-svg');
    document.getElementById('victory-stars').textContent = starString(stars);
    document.getElementById('victory-name').textContent = `${animal.name} 완성!`;
    document.getElementById('victory-record').classList.toggle('hidden', !isNewRecord);
    document.getElementById('victory-overlay').classList.remove('hidden');

    if (typeof confetti === 'function') {
        confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 } });
        setTimeout(() => {
            confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } });
            confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } });
        }, 320);
    }
}

// 완성 그림을 크게 보고 싶을 때 축하 카드를 닫는다
function closeVictory() {
    playSound('click');
    document.getElementById('victory-overlay').classList.add('hidden');
}

// ============================================================
// 초기화
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
    showScreen('title');
});
