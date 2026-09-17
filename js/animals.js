// ============================================================
// 곱셈구구 색칠하기 - 동물 데이터
// 각 동물은 7개의 색칠 영역(regions)을 가지고, 완성하면 실제
// 그 동물처럼 보이도록 부위별 색이 미리 정해져 있습니다.
// 문제(곱셈식)는 game.js 에서 매번 랜덤하게 영역에 배치됩니다.
// ============================================================

// 볼(치크) 영역 path를 만드는 헬퍼 - 두 개의 원을 하나의 path로 결합
function cheekPath(cx1, cy1, cx2, cy2, r) {
    return `M ${cx1 - r} ${cy1} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 Z ` +
           `M ${cx2 - r} ${cy2} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 Z`;
}

const ANIMALS = [
    // ---------------- 2단 : 말랑 토끼 ----------------
    {
        id: 'rabbit', table: 2, name: '말랑 토끼', emoji: '🐰',
        cardBg: 'linear-gradient(160deg,#FFE1EC,#FFC6DC)',
        regions: [
            { id: 'background', label: '배경', shape: 'rect', attrs: { x: 10, y: 10, width: 380, height: 380, rx: 34 }, color: '#CFF5E7', border: '#7FD9BE' },
            { id: 'body', label: '몸통', shape: 'ellipse', attrs: { cx: 200, cy: 300, rx: 120, ry: 92 }, color: '#FFF8EF', border: '#E5D9C3' },
            { id: 'belly', label: '배', shape: 'ellipse', attrs: { cx: 200, cy: 300, rx: 62, ry: 56 }, color: '#FFEFF3', border: '#F3C9D6' },
            { id: 'ear-left', label: '왼쪽 귀', shape: 'ellipse', attrs: { cx: 122, cy: 68, rx: 24, ry: 58, rotate: -18 }, color: '#FFB5C5', border: '#E88DA3' },
            { id: 'ear-right', label: '오른쪽 귀', shape: 'ellipse', attrs: { cx: 278, cy: 68, rx: 24, ry: 58, rotate: 18 }, color: '#FFB5C5', border: '#E88DA3' },
            { id: 'face', label: '얼굴', shape: 'circle', attrs: { cx: 200, cy: 168, r: 92 }, color: '#FFFBF3', border: '#E8DFC8' },
            { id: 'cheeks', label: '볼', shape: 'path', attrs: { d: cheekPath(158, 190, 242, 190, 20) }, color: '#FF8FAE', border: '#E15C82' },
        ],
        decorTop: [
            `<circle cx="200" cy="185" r="7" fill="#FF6FA0" stroke="#C94A76" stroke-width="2"/>`,
            `<path d="M170 210 Q200 222 230 210" stroke="#B98A6A" stroke-width="3" fill="none" stroke-linecap="round"/>`,
        ],
    },
    // ---------------- 3단 : 통통 곰 ----------------
    {
        id: 'bear', table: 3, name: '통통 곰', emoji: '🐻',
        cardBg: 'linear-gradient(160deg,#FFE4C0,#F6C989)',
        regions: [
            { id: 'background', label: '배경', shape: 'rect', attrs: { x: 10, y: 10, width: 380, height: 380, rx: 34 }, color: '#FFE9C7', border: '#F0C989' },
            { id: 'body', label: '몸통', shape: 'ellipse', attrs: { cx: 200, cy: 300, rx: 125, ry: 95 }, color: '#A9683F', border: '#7C4726' },
            { id: 'belly', label: '배', shape: 'ellipse', attrs: { cx: 200, cy: 298, rx: 65, ry: 58 }, color: '#E9C6A0', border: '#C79A66' },
            { id: 'ear-left', label: '왼쪽 귀', shape: 'circle', attrs: { cx: 128, cy: 88, r: 38 }, color: '#8B5230', border: '#63391F' },
            { id: 'ear-right', label: '오른쪽 귀', shape: 'circle', attrs: { cx: 272, cy: 88, r: 38 }, color: '#8B5230', border: '#63391F' },
            { id: 'face', label: '얼굴', shape: 'circle', attrs: { cx: 200, cy: 168, r: 95 }, color: '#C98950', border: '#A6672E' },
            { id: 'cheeks', label: '볼', shape: 'path', attrs: { d: cheekPath(158, 195, 242, 195, 20) }, color: '#E8A06B', border: '#C97A3E' },
        ],
        decorTop: [
            `<ellipse cx="200" cy="190" rx="26" ry="20" fill="#D9A876" opacity="0.9"/>`,
            `<circle cx="200" cy="188" r="7" fill="#3B2416"/>`,
        ],
    },
    // ---------------- 4단 : 뾰족 고양이 ----------------
    {
        id: 'cat', table: 4, name: '뾰족 고양이', emoji: '🐱',
        cardBg: 'linear-gradient(160deg,#E8DFFF,#CBB8FA)',
        regions: [
            { id: 'background', label: '배경', shape: 'rect', attrs: { x: 10, y: 10, width: 380, height: 380, rx: 34 }, color: '#E8DFFF', border: '#C4B2F5' },
            { id: 'body', label: '몸통', shape: 'ellipse', attrs: { cx: 200, cy: 300, rx: 118, ry: 90 }, color: '#FFA94D', border: '#E8842A' },
            { id: 'belly', label: '배', shape: 'ellipse', attrs: { cx: 200, cy: 298, rx: 60, ry: 55 }, color: '#FFF3D9', border: '#F0D9A6' },
            { id: 'ear-left', label: '왼쪽 귀', shape: 'polygon', attrs: { points: '98,112 130,38 162,112' }, color: '#F2811A', border: '#C4650E' },
            { id: 'ear-right', label: '오른쪽 귀', shape: 'polygon', attrs: { points: '238,112 270,38 302,112' }, color: '#F2811A', border: '#C4650E' },
            { id: 'face', label: '얼굴', shape: 'circle', attrs: { cx: 200, cy: 170, r: 90 }, color: '#FFC98A', border: '#E8A254' },
            { id: 'cheeks', label: '볼', shape: 'path', attrs: { d: cheekPath(155, 192, 245, 192, 20) }, color: '#FF9EC4', border: '#E06C9C' },
        ],
        decorTop: [
            `<path d="M150 200 Q110 192 95 198 M150 208 Q108 210 92 216" stroke="#8A7A63" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
            `<path d="M250 200 Q290 192 305 198 M250 208 Q292 210 308 216" stroke="#8A7A63" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
            `<path d="M192 202 L208 202 L200 212 Z" fill="#E0668A"/>`,
        ],
    },
    // ---------------- 5단 : 뒤뚱 펭귄 ----------------
    {
        id: 'penguin', table: 5, name: '뒤뚱 펭귄', emoji: '🐧',
        cardBg: 'linear-gradient(160deg,#D6F0FF,#A9DDF6)',
        regions: [
            { id: 'background', label: '배경', shape: 'rect', attrs: { x: 10, y: 10, width: 380, height: 380, rx: 34 }, color: '#D6F0FF', border: '#9FD8F5' },
            { id: 'body', label: '몸통', shape: 'ellipse', attrs: { cx: 200, cy: 300, rx: 110, ry: 95 }, color: '#2B2B3A', border: '#16161F' },
            { id: 'belly', label: '배', shape: 'ellipse', attrs: { cx: 200, cy: 302, rx: 62, ry: 68 }, color: '#FAFCFF', border: '#DCE6EC' },
            { id: 'ear-left', label: '왼쪽 지느러미', shape: 'ellipse', attrs: { cx: 88, cy: 240, rx: 30, ry: 56, rotate: -24 }, color: '#333344', border: '#1C1C28' },
            { id: 'ear-right', label: '오른쪽 지느러미', shape: 'ellipse', attrs: { cx: 312, cy: 240, rx: 30, ry: 56, rotate: 24 }, color: '#333344', border: '#1C1C28' },
            { id: 'face', label: '얼굴', shape: 'circle', attrs: { cx: 200, cy: 168, r: 85 }, color: '#FFFFFF', border: '#DDE6EC' },
            { id: 'cheeks', label: '볼', shape: 'path', attrs: { d: cheekPath(160, 188, 240, 188, 18) }, color: '#FFD9A0', border: '#E8B36E' },
        ],
        decorTop: [
            `<polygon points="185,205 215,205 200,228" fill="#FFA83D" stroke="#D9821E" stroke-width="2"/>`,
            `<ellipse cx="170" cy="392" rx="20" ry="8" fill="#FFA83D"/>`,
            `<ellipse cx="230" cy="392" rx="20" ry="8" fill="#FFA83D"/>`,
        ],
    },
    // ---------------- 6단 : 갈기 사자 ----------------
    {
        id: 'lion', table: 6, name: '갈기 사자', emoji: '🦁',
        cardBg: 'linear-gradient(160deg,#FFF0C2,#FBD988)',
        regions: [
            { id: 'background', label: '배경', shape: 'rect', attrs: { x: 10, y: 10, width: 380, height: 380, rx: 34 }, color: '#FFF0C2', border: '#F0D480' },
            { id: 'body', label: '몸통', shape: 'ellipse', attrs: { cx: 200, cy: 305, rx: 122, ry: 90 }, color: '#F2B44D', border: '#D6912A' },
            { id: 'belly', label: '배', shape: 'ellipse', attrs: { cx: 200, cy: 302, rx: 62, ry: 55 }, color: '#FFF3D0', border: '#EBCF95' },
            { id: 'ear-left', label: '왼쪽 귀', shape: 'circle', attrs: { cx: 132, cy: 78, r: 30 }, color: '#E89A2E', border: '#C27A1A' },
            { id: 'ear-right', label: '오른쪽 귀', shape: 'circle', attrs: { cx: 268, cy: 78, r: 30 }, color: '#E89A2E', border: '#C27A1A' },
            { id: 'face', label: '얼굴', shape: 'circle', attrs: { cx: 200, cy: 175, r: 78 }, color: '#FFDA8C', border: '#E8B85A' },
            { id: 'cheeks', label: '볼', shape: 'path', attrs: { d: cheekPath(150, 195, 250, 195, 20) }, color: '#FF9F5A', border: '#E87A2E' },
        ],
        decorBottom: [
            `<circle cx="200" cy="178" r="142" fill="#C97A1A" stroke="#A6621A" stroke-width="4"/>`,
        ],
        decorTop: [
            `<ellipse cx="200" cy="200" rx="24" ry="18" fill="#E8B85A" opacity="0.9"/>`,
            `<circle cx="200" cy="198" r="6" fill="#5A3915"/>`,
        ],
    },
    // ---------------- 7단 : 줄무늬 호랑이 ----------------
    {
        id: 'tiger', table: 7, name: '줄무늬 호랑이', emoji: '🐯',
        cardBg: 'linear-gradient(160deg,#DFF2D0,#B9E39A)',
        regions: [
            { id: 'background', label: '배경', shape: 'rect', attrs: { x: 10, y: 10, width: 380, height: 380, rx: 34 }, color: '#DFF2D0', border: '#B7DB9A' },
            { id: 'body', label: '몸통', shape: 'ellipse', attrs: { cx: 200, cy: 300, rx: 120, ry: 92 }, color: '#FF8A3D', border: '#E06A1C' },
            { id: 'belly', label: '배', shape: 'ellipse', attrs: { cx: 200, cy: 298, rx: 62, ry: 56 }, color: '#FFF6EA', border: '#EAD7B8' },
            { id: 'ear-left', label: '왼쪽 귀', shape: 'polygon', attrs: { points: '100,110 128,42 158,112' }, color: '#FF7A28', border: '#CC5C14' },
            { id: 'ear-right', label: '오른쪽 귀', shape: 'polygon', attrs: { points: '242,112 272,42 300,110' }, color: '#FF7A28', border: '#CC5C14' },
            { id: 'face', label: '얼굴', shape: 'circle', attrs: { cx: 200, cy: 170, r: 90 }, color: '#FFB067', border: '#E8893A' },
            { id: 'cheeks', label: '볼', shape: 'path', attrs: { d: cheekPath(155, 192, 245, 192, 20) }, color: '#FF7F7F', border: '#E85555' },
        ],
        decorTop: [
            `<path d="M120 260 Q160 250 195 260" stroke="#2B2B3A" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.55"/>`,
            `<path d="M205 262 Q245 250 282 262" stroke="#2B2B3A" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.55"/>`,
            `<path d="M140 320 Q170 312 198 320" stroke="#2B2B3A" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.5"/>`,
            `<path d="M202 320 Q232 312 262 320" stroke="#2B2B3A" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.5"/>`,
            `<path d="M160 118 Q168 100 178 116" stroke="#2B2B3A" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.5"/>`,
            `<path d="M222 116 Q232 100 240 118" stroke="#2B2B3A" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.5"/>`,
            `<path d="M198 202 L212 202 L205 212 Z" fill="#3B2A20"/>`,
        ],
    },
    // ---------------- 8단 : 폴짝 개구리 ----------------
    {
        id: 'frog', table: 8, name: '폴짝 개구리', emoji: '🐸',
        cardBg: 'linear-gradient(160deg,#C7ECEE,#9EDBDF)',
        regions: [
            { id: 'background', label: '배경', shape: 'rect', attrs: { x: 10, y: 10, width: 380, height: 380, rx: 34 }, color: '#C7ECEE', border: '#8FCBCF' },
            { id: 'body', label: '몸통', shape: 'ellipse', attrs: { cx: 200, cy: 305, rx: 118, ry: 92 }, color: '#6FCF6F', border: '#45A845' },
            { id: 'belly', label: '배', shape: 'ellipse', attrs: { cx: 200, cy: 305, rx: 62, ry: 56 }, color: '#E8F5C0', border: '#C9DE8F' },
            { id: 'ear-left', label: '왼쪽 눈', shape: 'circle', attrs: { cx: 148, cy: 92, r: 36 }, color: '#7FE07F', border: '#4FA84F' },
            { id: 'ear-right', label: '오른쪽 눈', shape: 'circle', attrs: { cx: 252, cy: 92, r: 36 }, color: '#7FE07F', border: '#4FA84F' },
            { id: 'face', label: '얼굴', shape: 'circle', attrs: { cx: 200, cy: 190, r: 78 }, color: '#A6E88A', border: '#7CC85E' },
            { id: 'cheeks', label: '볼', shape: 'path', attrs: { d: cheekPath(150, 215, 250, 215, 20) }, color: '#FFB3C6', border: '#E88AA3' },
        ],
        decorTop: [
            `<circle cx="148" cy="92" r="12" fill="#16211A"/>`,
            `<circle cx="252" cy="92" r="12" fill="#16211A"/>`,
            `<circle cx="144" cy="88" r="3.5" fill="#FFFFFF"/>`,
            `<circle cx="248" cy="88" r="3.5" fill="#FFFFFF"/>`,
            `<path d="M165 230 Q200 250 235 230" stroke="#2E5C2E" stroke-width="4" fill="none" stroke-linecap="round"/>`,
        ],
    },
    // ---------------- 9단 : 꼬리 여우 ----------------
    {
        id: 'fox', table: 9, name: '꼬리 여우', emoji: '🦊',
        cardBg: 'linear-gradient(160deg,#EDE0FF,#D6BFF7)',
        regions: [
            { id: 'background', label: '배경', shape: 'rect', attrs: { x: 10, y: 10, width: 380, height: 380, rx: 34 }, color: '#EDE0FF', border: '#C9AEF0' },
            { id: 'body', label: '몸통', shape: 'ellipse', attrs: { cx: 200, cy: 300, rx: 118, ry: 90 }, color: '#F2762E', border: '#D1590F' },
            { id: 'belly', label: '배', shape: 'ellipse', attrs: { cx: 200, cy: 298, rx: 58, ry: 54 }, color: '#FFF8EC', border: '#EFD9B0' },
            { id: 'ear-left', label: '왼쪽 귀', shape: 'polygon', attrs: { points: '100,112 122,34 160,108' }, color: '#E0631A', border: '#B84C0E' },
            { id: 'ear-right', label: '오른쪽 귀', shape: 'polygon', attrs: { points: '240,108 278,34 300,112' }, color: '#E0631A', border: '#B84C0E' },
            { id: 'face', label: '얼굴', shape: 'circle', attrs: { cx: 200, cy: 172, r: 88 }, color: '#FFB27A', border: '#E8894A' },
            { id: 'cheeks', label: '볼', shape: 'path', attrs: { d: cheekPath(155, 195, 245, 195, 20) }, color: '#FF8F70', border: '#E0644A' },
        ],
        decorTop: [
            `<ellipse cx="200" cy="205" rx="34" ry="26" fill="#FFFFFF" opacity="0.92"/>`,
            `<path d="M198 208 L212 208 L205 218 Z" fill="#2B2B3A"/>`,
        ],
    },
];

// 랜덤 도전에서 뽑을 동물 하나를 고를 때 사용
function pickRandomAnimal(excludeId) {
    const pool = ANIMALS.filter(a => a.id !== excludeId);
    return pool[Math.floor(Math.random() * pool.length)];
}
