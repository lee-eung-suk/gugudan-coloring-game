// ============================================================
// 효과음 - Web Audio API로 직접 만든 사운드 (외부 파일 없음)
// ============================================================
let soundEnabled = true;
let audioCtx = null;

function getCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    document.querySelectorAll('.sound-icon').forEach(el => {
        el.textContent = soundEnabled ? '🔊' : '🔇';
    });
    return soundEnabled;
}

function tone(ctx, { freq, start, dur, type = 'sine', gain = 0.25, glideTo = null }) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, start + dur);
    g.gain.setValueAtTime(gain, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.start(start);
    osc.stop(start + dur);
}

function playSound(type) {
    if (!soundEnabled) return;
    try {
        const ctx = getCtx();
        const now = ctx.currentTime;

        if (type === 'correct') {
            [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
                tone(ctx, { freq: f, start: now + i * 0.08, dur: 0.22, type: 'triangle', gain: 0.28 }));
        } else if (type === 'wrong') {
            tone(ctx, { freq: 220, start: now, dur: 0.32, type: 'sawtooth', gain: 0.22, glideTo: 140 });
        } else if (type === 'select') {
            tone(ctx, { freq: 440, start: now, dur: 0.09, type: 'sine', gain: 0.2, glideTo: 880 });
        } else if (type === 'click') {
            tone(ctx, { freq: 300, start: now, dur: 0.06, type: 'square', gain: 0.12, glideTo: 500 });
        } else if (type === 'stamp') {
            tone(ctx, { freq: 180, start: now, dur: 0.15, type: 'sine', gain: 0.3, glideTo: 90 });
        } else if (type === 'victory') {
            const notes = [523.25, 659.25, 783.99, 1046.5, 880, 1046.5, 1318.5];
            const times = [0, 0.12, 0.24, 0.36, 0.52, 0.68, 0.84];
            notes.forEach((freq, idx) =>
                tone(ctx, { freq, start: now + times[idx], dur: 0.28, type: 'sine', gain: 0.26 }));
        } else if (type === 'star') {
            tone(ctx, { freq: 1046.5, start: now, dur: 0.18, type: 'triangle', gain: 0.2, glideTo: 1568 });
        }
    } catch (e) { /* 오디오 컨텍스트가 아직 허용되지 않은 경우 */ }
}
