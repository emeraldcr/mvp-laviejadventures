function LeftServiceSign() {
  return (
    <g>
      <path d="M80 86 L80 228" stroke="#56341d" strokeWidth="7" strokeLinecap="round" />
      <path d="M80 92 C118 84 118 113 83 111" fill="none" stroke="#8a552e" strokeWidth="15" strokeLinecap="round" />
      <path d="M80 138 C115 126 120 154 88 158 C64 162 65 184 92 186 C123 188 118 216 78 212" fill="none" stroke="#8a552e" strokeWidth="14" strokeLinecap="round" />
      <path d="M68 98 L53 98 M68 150 L53 150 M68 202 L53 202" stroke="#2f2118" strokeWidth="3" strokeLinecap="round" />
      <text x="118" y="96" fill="#2b2118" fontSize="24" fontWeight="900">Recepción</text>
      <text x="118" y="148" fill="#2b2118" fontSize="24" fontWeight="900">Restaurante</text>
      <text x="118" y="200" fill="#2b2118" fontSize="24" fontWeight="900">Mirador</text>
    </g>
  );
}

function GrassTuft({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} stroke="#315d2f" strokeWidth="2.5" strokeLinecap="round">
      <path d="M0 12 C-2 4 -7 0 -12 -4" />
      <path d="M0 12 C1 3 2 -3 4 -10" />
      <path d="M0 12 C4 5 10 2 15 -1" />
    </g>
  );
}

function Hiker({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} stroke="#3b2a1e" strokeWidth="3" strokeLinecap="round">
      <circle cx="0" cy="-12" r="4" fill="#7a4b25" stroke="none" />
      <path d="M0 -7 L-3 8" />
      <path d="M-2 -2 L-11 5" />
      <path d="M-1 8 L-11 20" />
      <path d="M-1 8 L8 20" />
      <path d="M5 -3 L13 -11" />
    </g>
  );
}

function LookoutDeck() {
  return (
    <g transform="translate(548 118)">
      <rect x="-24" y="-22" width="48" height="12" fill="#8a552e" stroke="#3a2414" strokeWidth="3" />
      <path d="M-18 -10 L-22 44 M18 -10 L22 44 M-22 44 L22 44 M-20 10 L20 10 M-20 28 L20 28" stroke="#4a2b17" strokeWidth="4" />
      <path d="M-30 -22 L30 -22" stroke="#3a2414" strokeWidth="5" strokeLinecap="round" />
      <text x="44" y="22" fill="#2b2118" fontSize="23" fontWeight="900">Mirador</text>
    </g>
  );
}

function MiniShrub({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-12 15 C-22 4 -12 -12 2 -7 C12 -20 30 -5 17 10 C14 20 -2 22 -12 15Z" fill="#5d9b4f" stroke="#2f5f30" strokeWidth="3" />
      <path d="M0 10 L0 24" stroke="#6b4226" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

export default function UpperLeftDetailLayer() {
  return (
    <g>
      <LeftServiceSign />
      <LookoutDeck />

      <text x="382" y="184" fill="#2b2118" fontSize="25" fontWeight="900">Montañita</text>
      <text x="505" y="272" fill="#2b2118" fontSize="20" fontWeight="900">Guayabal</text>

      <GrassTuft x={258} y={116} rotate={20} />
      <GrassTuft x={287} y={116} rotate={-18} />
      <GrassTuft x={340} y={135} rotate={12} />
      <GrassTuft x={388} y={152} rotate={-10} />
      <GrassTuft x={408} y={202} rotate={8} />

      <Hiker x={280} y={180} rotate={18} />
      <Hiker x={330} y={205} rotate={-6} />
      <Hiker x={390} y={244} rotate={14} />

      <MiniShrub x={458} y={255} />
      <MiniShrub x={520} y={250} />
      <MiniShrub x={598} y={256} />
    </g>
  );
}
