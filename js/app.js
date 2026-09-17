// ============================================================
// 곱셈구구 색칠하기 - 메인 게임 로직
// ============================================================
const STORAGE_KEY = 'gugudan-coloring-progress-v1';

// ---------- 진행 상황 저장/불러오기 ----------
function loadProgress() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) { return {}; }
}
function saveProgress(progress) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch (e) { /* noop */ }
}
let progress = loadProgress();

// ---------- 화면 전환 ----------
function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${name}`).classList.add('active');
}

function goTitle() { playSound('click'); showScreen('title'); }
function goSelect() { playSound('click'); renderSelectScreen(); showScreen('select'); }
function goBook() { playSound('click'); renderBookScreen(); showScreen('book'); }

// ============================================================
// 셀렉트 화면 (구구단 카트리지 선택)
// ============================================================
function starString(stars) {
    return '★★★'.slice(0, stars) + '☆☆☆'.slice(0, 3 - stars);
}

function renderSelectScreen() {
    const grid = document.getElementById('select-grid');
    grid.innerHTML = '';

    ANIMALS.forEach(animal => {
        const rec = progress[animal.id];
        const stars = rec ? rec.stars : 0;
        const card = document.createElement('button');
        card.className = 'cart-card';
        card.style.background = animal.cardBg;
        card.onclick = () => { playSound('select'); startGame(animal); };
        card.innerHTML = `
            <div class="cart-table">${animal.table}단</div>
            <div class="cart-emoji">${animal.emoji}</div>
            <div class="cart-name">${animal.name}</div>
            <div class="cart-stars">${starString(stars)}</div>
        `;
        grid.appendChild(card);
    });

    // 랜덤 도전 카드
    const randCard = document.createElement('button');
    randCard.className = 'cart-card cart-card-random';
    randCard.onclick = () => { playSound('select'); startGame(pickRandomAnimal(), true); };
    randCard.innerHTML = `
        <div class="cart-table">전체 단</div>
        <div class="cart-emoji">🎲</div>
        <div class="cart-name">랜덤 도전!</div>
        <div class="cart-stars">&nbsp;</div>
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
        if (rec) {
            collected++;
            slot.innerHTML = `
                <div class="book-emoji">${animal.emoji}</div>
                <div class="book-name">${animal.name}</div>
                <div class="book-stars">${starString(rec.stars)}</div>
            `;
        } else {
            slot.innerHTML = `
                <div class="book-emoji book-emoji-locked">❔</div>
                <div class="book-name">???</div>
                <div class="book-stars">${starString(0)}</div>
            `;
        }
        grid.appendChild(slot);
    });

    const summary = document.getElementById('book-summary');
    summary.textContent = `모은 동물: ${collected} / ${ANIMALS.length}`;
    document.getElementById('book-complete-badge').classList.toggle('hidden', collected < ANIMALS.length);
}

// ============================================================
// 색칠 게임
// ============================================================
let currentGame = null; // { animal, isRandom, selectedIndex, wrongCount, hintCount, filledCount, palette }

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function buildProblems(animal, isRandom) {
    // 각 영역(region)에 곱셈 문제를 배정하고, 정답 숫자 -> 영역의 고유 색을 매칭
    const regions = animal.regions;
    let multipliers;
    let tables;

    if (isRandom) {
        // 단도 랜덤, 곱하는 수도 랜덤 (겹치는 정답이 없도록 재시도)
        let attempt = 0;
        let answers;
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

    // 오답(방해) 팔레트용 - 정답 목록에 없는 값 2개 생성
    const answerSet = new Set(problems.map(p => p.answer));
    const decoys = [];
    const decoyColors = [
        { hex: '#B8C4CE', border: '#8A97A3' },
        { hex: '#D9C7A6', border: '#B0A075' },
    ];
    let guardAttempts = 0;
    while (decoys.length < 2 && guardAttempts < 200) {
        guardAttempts++;
        const t = isRandom ? 2 + Math.floor(Math.random() * 8) : animal.table;
        const m = 1 + Math.floor(Math.random() * 9);
        const val = t * m;
        if (!answerSet.has(val) && !decoys.some(d => d.val === val)) {
            decoys.push({ val, math: `${t} × ${m}`, ...decoyColors[decoys.length] });
        }
    }

    return { problems, decoys };
}

function startGame(animal, isRandom = false) {
    const { problems, decoys } = buildProblems(animal, isRandom);

    currentGame = {
        animal, isRandom, problems, decoys,
        selectedPaletteIndex: null,
        wrongCount: 0,
        hintCount: 0,
        filledCount: 0,
    };

    // 팔레트 = 정답 7개 + 오답 2개, 순서를 섞음
    const paletteItems = problems.map(p => ({
        val: p.answer,
        math: `${p.table} × ${p.multiplier}`,
        hex: p.region.color,
        border: p.region.border,
        regionId: p.region.id,
    })).concat(decoys.map(d => ({ val: d.val, math: d.math, hex: d.hex, border: d.border, regionId: null })));

    currentGame.palette = shuffle(paletteItems);

    renderPlayHeader();
    renderSvg();
    renderPalette();
    document.getElementById('victory-card').classList.add('hidden');
    setSelectionInfo('info-default', '팔레트에서 정답 물감을 선택하세요!');
    updateProgressBar();
    showScreen('play');
}

function renderPlayHeader() {
    const { animal, isRandom } = currentGame;
    document.getElementById('play-title').textContent = isRandom
        ? `🎲 랜덤 도전 - ${animal.name}`
        : `${animal.table}단 - ${animal.name}`;
    document.getElementById('play-emoji').textContent = animal.emoji;
}

function renderSvg() {
    const { animal, problems } = currentGame;
    const container = document.getElementById('svg-container');

    const answerByRegion = {};
    problems.forEach(p => { answerByRegion[p.region.id] = p; });

    let svg = `<svg viewBox="0 0 400 400" class="game-svg">`;

    animal.regions.forEach(region => {
        const p = answerByRegion[region.id];
        svg += renderRegionShape(region, p);
        // 배경 바로 위, 몸통/얼굴보다 아래에 깔리는 장식(사자 갈기 등)
        if (region.id === 'background') {
            (animal.decorBottom || []).forEach(d => { svg += `<g class="decor" pointer-events="none">${d}</g>`; });
        }
    });

    (animal.decorTop || []).forEach(d => { svg += `<g class="decor" pointer-events="none">${d}</g>`; });

    svg += `</svg>`;
    container.innerHTML = svg;
}

function renderRegionShape(region, problem) {
    const common = `id="${region.id}" class="svg-region" data-ans="${problem.answer}" data-math="${region.label}" data-filled="false" fill="#ffffff" stroke="#2b2b3a" stroke-width="4" stroke-linejoin="round" onclick="colorRegion('${region.id}')"`;
    const rotateAttr = region.attrs.rotate ? ` transform="rotate(${region.attrs.rotate} ${region.attrs.cx} ${region.attrs.cy})"` : '';
    let shapeTag = '';

    if (region.shape === 'rect') {
        const a = region.attrs;
        shapeTag = `<rect x="${a.x}" y="${a.y}" width="${a.width}" height="${a.height}" rx="${a.rx}" ${common} />`;
    } else if (region.shape === 'ellipse') {
        const a = region.attrs;
        shapeTag = `<ellipse cx="${a.cx}" cy="${a.cy}" rx="${a.rx}" ry="${a.ry}" ${common}${rotateAttr} />`;
    } else if (region.shape === 'circle') {
        const a = region.attrs;
        shapeTag = `<circle cx="${a.cx}" cy="${a.cy}" r="${a.r}" ${common} />`;
    } else if (region.shape === 'polygon') {
        shapeTag = `<polygon points="${region.attrs.points}" ${common} />`;
    } else if (region.shape === 'path') {
        shapeTag = `<path d="${region.attrs.d}" ${common} />`;
    }

    const textTag = `<text id="text-${region.id}" x="${region.textX}" y="${region.textY}" text-anchor="middle" dominant-baseline="central" class="region-label">${problem.table} × ${problem.multiplier}</text>`;

    return `<g>${shapeTag}${textTag}</g>`;
}

function renderPalette() {
    const grid = document.getElementById('palette-grid');
    grid.innerHTML = '';
    currentGame.palette.forEach((item, idx) => {
        const btn = document.createElement('button');
        btn.className = 'palette-btn';
        btn.style.backgroundColor = item.hex;
        btn.style.borderColor = item.border;
        btn.id = `palette-${idx}`;
        btn.onclick = () => selectColor(idx);
        btn.innerHTML = `<span class="palette-val">${item.val}</span>`;
        grid.appendChild(btn);
    });
}

function selectColor(index) {
    currentGame.selectedPaletteIndex = index;
    playSound('select');
    document.querySelectorAll('.palette-btn').forEach((b, i) => {
        b.classList.toggle('selected', i === index);
    });
    const item = currentGame.palette[index];
    setSelectionInfo('info-selected', `정답 <strong>${item.val}</strong> 물감 선택! 그림에서 문제를 찾아 칠하세요.`, item.hex);
}

function setSelectionInfo(kind, html, dotColor) {
    const info = document.getElementById('selection-info');
    info.className = `selection-info ${kind}`;
    info.innerHTML = dotColor
        ? `<span class="info-dot" style="background:${dotColor}"></span>${html}`
        : html;
}

function colorRegion(regionId) {
    if (currentGame.selectedPaletteIndex === null) {
        playSound('wrong');
        setSelectionInfo('info-warn', '먼저 아래 팔레트에서 물감을 선택해주세요!');
        return;
    }

    const item = currentGame.palette[currentGame.selectedPaletteIndex];
    const regionEl = document.getElementById(regionId);
    const targetAns = parseInt(regionEl.getAttribute('data-ans'), 10);
    const isFilled = regionEl.getAttribute('data-filled') === 'true';

    if (item.val === targetAns) {
        if (!isFilled) {
            regionEl.setAttribute('data-filled', 'true');
            currentGame.filledCount++;
        }
        regionEl.style.fill = item.hex;
        const textEl = document.getElementById(`text-${regionId}`);
        textEl.classList.add('filled-text');

        playSound('correct');
        regionEl.classList.remove('wiggle');
        void regionEl.offsetWidth;
        regionEl.classList.add('wiggle');

        setSelectionInfo('info-correct', '정답이에요! 잘했어요 🎉');
        updateProgressBar();

        const total = currentGame.animal.regions.length;
        if (currentGame.filledCount === total) {
            setTimeout(triggerVictory, 350);
        }
    } else {
        currentGame.wrongCount++;
        playSound('wrong');
        regionEl.classList.remove('wiggle');
        void regionEl.offsetWidth;
        regionEl.classList.add('wiggle');
        setSelectionInfo('info-wrong', `아쉬워요! 다시 계산해보세요.`);
    }
}

function updateProgressBar() {
    const total = currentGame.animal.regions.length;
    const percent = Math.round((currentGame.filledCount / total) * 100);
    document.getElementById('progress-text').textContent = `${percent}%`;
    document.getElementById('progress-fill').style.width = `${percent}%`;
}

function giveHint() {
    playSound('click');
    currentGame.hintCount++;
    const { animal, problems } = currentGame;
    const unfilled = animal.regions.find(r => {
        const el = document.getElementById(r.id);
        return el && el.getAttribute('data-filled') !== 'true';
    });
    if (!unfilled) return;

    const problem = problems.find(p => p.region.id === unfilled.id);
    setSelectionInfo('info-hint', `💡 힌트: <strong>${problem.table} × ${problem.multiplier}</strong>의 정답은 <strong>${problem.answer}</strong>이에요!`);

    const el = document.getElementById(unfilled.id);
    el.style.stroke = '#FF4554';
    el.style.strokeWidth = '7';
    setTimeout(() => { el.style.stroke = '#2b2b3a'; el.style.strokeWidth = '4'; }, 1200);
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

    if (!isRandom) {
        const prev = progress[animal.id];
        if (!prev || stars > prev.stars) {
            progress[animal.id] = { stars };
            saveProgress(progress);
        }
    }

    playSound('victory');
    document.getElementById('victory-stars').textContent = starString(stars);
    document.getElementById('victory-card').classList.remove('hidden');

    if (typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => {
            confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } });
            confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } });
        }, 300);
    }
}

// ============================================================
// 초기화
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
    showScreen('title');
});
