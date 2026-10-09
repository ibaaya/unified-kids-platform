import React from 'react';
import type { SceneKey } from '../data/types';

// =====================================================
// رسومات SVG برمجية: شخصيات أطفال ومشاهد للألغاز والقصص.
// لا تجسيد للأنبياء أو الصحابة، ولا صور خارجية.
// =====================================================

export type Mood = 'happy' | 'sad' | 'angry' | 'surprised' | 'thinking';
type Kind = 'boy' | 'girl' | 'mom';

interface PersonProps {
  x: number;
  y: number;
  kind: Kind;
  mood?: Mood;
  scale?: number;
  arms?: 'down' | 'up' | 'forward';
}

const SKIN = '#F2C6A0';

export const Person: React.FC<PersonProps> = ({ x, y, kind, mood = 'happy', scale = 1, arms = 'down' }) => {
  const cloth = kind === 'boy' ? '#5C6BC0' : kind === 'girl' ? '#EC6FA3' : '#26A69A';
  const bodyH = kind === 'mom' ? 62 : 46;
  const hands =
    arms === 'up'
      ? { l: [-30, 14], r: [30, 14] }
      : arms === 'forward'
        ? { l: [-8, 62], r: [8, 62] }
        : { l: [-26, 70], r: [26, 70] };

  const mouth =
    mood === 'sad' ? (
      <path d="M-6 22 Q0 16 6 22" stroke="#333" strokeWidth="2" strokeLinecap="round" fill="none" />
    ) : mood === 'surprised' ? (
      <circle cx="0" cy="20" r="3.4" fill="#333" />
    ) : mood === 'angry' || mood === 'thinking' ? (
      <path d="M-5 20 L5 20" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    ) : (
      <path d="M-7 17 Q0 25 7 17" stroke="#333" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    );

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {kind !== 'mom' && (
        <>
          <rect x="-13" y="76" width="11" height="16" rx="5" fill="#455A9B" />
          <rect x="2" y="76" width="11" height="16" rx="5" fill="#455A9B" />
        </>
      )}
      <rect x="-17" y="32" width="34" height={bodyH} rx="12" fill={cloth} />
      <line x1="-17" y1="40" x2={hands.l[0]} y2={hands.l[1]} stroke={cloth} strokeWidth="9" strokeLinecap="round" />
      <line x1="17" y1="40" x2={hands.r[0]} y2={hands.r[1]} stroke={cloth} strokeWidth="9" strokeLinecap="round" />
      <circle cx={hands.l[0]} cy={hands.l[1]} r="5" fill={SKIN} />
      <circle cx={hands.r[0]} cy={hands.r[1]} r="5" fill={SKIN} />

      {kind !== 'boy' && (
        <path
          d="M-24 14 Q-24 -16 0 -16 Q24 -16 24 14 Q24 38 0 42 Q-24 38 -24 14Z"
          fill={kind === 'mom' ? '#7E57C2' : '#8D4F6B'}
        />
      )}
      <circle cx="0" cy="10" r="19" fill={SKIN} />
      {kind === 'boy' && <path d="M-19 8 Q-19 -14 0 -14 Q19 -14 19 8 Q8 -2 -19 8Z" fill="#4E342E" />}
      {kind === 'girl' && <path d="M-19 8 Q-19 -12 0 -12 Q19 -12 19 8 Q6 0 -19 8Z" fill="#8D4F6B" />}
      {kind === 'mom' && <path d="M-19 6 Q-19 -10 0 -10 Q19 -10 19 6 Q6 -2 -19 6Z" fill="#7E57C2" />}

      <circle cx="-7" cy="10" r="2.3" fill="#333" />
      <circle cx="7" cy="10" r="2.3" fill="#333" />
      {mood === 'angry' && (
        <>
          <line x1="-11" y1="4" x2="-4" y2="7" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="11" y1="4" x2="4" y2="7" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {mouth}
    </g>
  );
};

const Heart: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0 8 C-12 -2 -6 -12 0 -5 C6 -12 12 -2 0 8Z"
    fill="#FF6B8A"
  />
);

const Bubble: React.FC<{ x: number; y: number; w: number; text: string }> = ({ x, y, w, text }) => (
  <g>
    <rect x={x} y={y} width={w} height="26" rx="13" fill="white" stroke="#cfd8dc" />
    <text
      x={x + w / 2}
      y={y + 18}
      textAnchor="middle"
      fontSize="12"
      fontWeight="700"
      fill="#333"
      style={{ direction: 'rtl' }}
    >
      {text}
    </text>
  </g>
);

const Backdrop: React.FC = () => (
  <>
    <rect width="240" height="150" fill="#E3F2FD" />
    <circle cx="205" cy="26" r="14" fill="#FFE082" />
    <rect y="112" width="240" height="38" fill="#C8E6C9" />
  </>
);

export const PuzzleScene: React.FC<{ scene: SceneKey }> = ({ scene }) => (
  <svg
    viewBox="0 0 240 150"
    role="img"
    aria-label="صُورَة للَّغز"
    style={{ width: '100%', maxWidth: 360, display: 'block', margin: '0 auto', borderRadius: 18 }}
  >
    <Backdrop />
    {scene === 'sharing' && (
      <>
        <Person x={78} y={20} kind="boy" arms="forward" />
        <Person x={162} y={20} kind="girl" arms="forward" />
        <circle cx="110" cy="84" r="9" fill="#D9A05B" />
        <circle cx="130" cy="84" r="9" fill="#D9A05B" />
        <circle cx="108" cy="82" r="1.6" fill="#6D4C41" />
        <circle cx="132" cy="86" r="1.6" fill="#6D4C41" />
        <Heart x={120} y={44} s={1.3} />
      </>
    )}
    {scene === 'helping' && (
      <>
        <Person x={66} y={18} kind="mom" />
        <Person x={166} y={20} kind="girl" arms="forward" />
        <rect x="150" y="80" width="32" height="20" rx="5" fill="#B07A3F" />
        <path d="M154 80 Q166 62 178 80" stroke="#8D5F2B" strokeWidth="3" fill="none" />
        <circle cx="160" cy="78" r="5" fill="#E53935" />
        <circle cx="171" cy="77" r="5" fill="#FB8C00" />
        <Heart x={66} y={2} s={1.2} />
      </>
    )}
    {scene === 'washing' && (
      <>
        <rect width="240" height="150" fill="#E0F7FA" />
        <rect x="98" y="14" width="44" height="9" rx="4" fill="#90A4AE" />
        <rect x="116" y="22" width="8" height="14" fill="#90A4AE" />
        {[44, 62, 80].map((cy) => (
          <path key={cy} transform={`translate(120 ${cy})`} d="M0 -6 C-5 0 -5 5 0 6 C5 5 5 0 0 -6Z" fill="#42A5F5" />
        ))}
        <ellipse cx="104" cy="106" rx="24" ry="12" fill={SKIN} />
        <ellipse cx="136" cy="106" rx="24" ry="12" fill={SKIN} />
        <circle cx="92" cy="96" r="6" fill="white" stroke="#90CAF9" />
        <circle cx="150" cy="94" r="8" fill="white" stroke="#90CAF9" />
        <circle cx="122" cy="116" r="5" fill="white" stroke="#90CAF9" />
      </>
    )}
    {scene === 'greeting' && (
      <>
        <Person x={72} y={20} kind="boy" arms="up" />
        <Person x={170} y={20} kind="boy" />
        <Bubble x={28} y={2} w={110} text="السَّلامُ عَلَيكُم" />
      </>
    )}
    {scene === 'mosque' && (
      <>
        <rect x="112" y="30" width="12" height="82" rx="3" fill="#4DB6AC" />
        <ellipse cx="118" cy="30" rx="7" ry="9" fill="#26A69A" />
        <rect x="216" y="30" width="12" height="82" rx="3" fill="#4DB6AC" />
        <ellipse cx="222" cy="30" rx="7" ry="9" fill="#26A69A" />
        <rect x="124" y="66" width="92" height="46" fill="#80CBC4" />
        <ellipse cx="170" cy="66" rx="30" ry="26" fill="#4DB6AC" />
        <path d="M162 112 V90 Q170 82 178 90 V112Z" fill="#00897B" />
        <path d="M170 28 C166 28 164 31 165 35 C169 34 172 35 175 37 C176 32 174 28 170 28Z" fill="#FFD54F" />
        <Person x={56} y={20} kind="boy" />
        <line x1="56" y1="26" x2="56" y2="32" stroke="#333" strokeWidth="0" />
        <Bubble x={10} y={2} w={92} text="هُدوء" />
      </>
    )}
    {scene === 'thanks' && (
      <>
        <Person x={78} y={20} kind="girl" arms="forward" />
        <Person x={168} y={20} kind="boy" arms="forward" />
        <rect x="70" y="80" width="16" height="14" rx="2" fill="#FF7043" />
        <rect x="76" y="80" width="4" height="14" fill="#FFE082" />
        <rect x="70" y="85" width="16" height="3" fill="#FFE082" />
        <Heart x={110} y={46} s={1} />
        <Heart x={122} y={34} s={0.8} />
        <Bubble x={22} y={2} w={96} text="شُكراً لَك" />
      </>
    )}
  </svg>
);

/** رسم المشهد في القصص بحسب مفتاح character في بيانات القصة */
export const StoryIllustration: React.FC<{ character: string }> = ({ character: c }) => {
  const mood: Mood = /sad|tired/.test(c)
    ? 'sad'
    : /angry/.test(c)
      ? 'angry'
      : /surprised/.test(c)
        ? 'surprised'
        : /thinking|asking|watching/.test(c)
          ? 'thinking'
          : 'happy';
  const kinds: Kind[] = c.startsWith('two_boys')
    ? ['boy', 'boy']
    : c.startsWith('two_girls') || c.startsWith('girls')
      ? ['girl', 'girl']
      : c.startsWith('mom')
        ? ['mom']
        : c.startsWith('girl')
          ? ['girl']
          : ['boy'];
  const arms: PersonProps['arms'] = /winning/.test(c) ? 'up' : /helping|sharing/.test(c) ? 'forward' : 'down';
  const xs = kinds.length === 1 ? [120] : [85, 155];

  return (
    <svg
      viewBox="0 0 240 130"
      role="img"
      aria-label="مَشهَدُ القِصَّة"
      style={{ width: '100%', maxWidth: 300, display: 'block', margin: '0 auto', borderRadius: 18 }}
    >
      <rect width="240" height="130" fill="#FFF8E1" />
      <circle cx="205" cy="24" r="13" fill="#FFE082" />
      <rect y="102" width="240" height="28" fill="#DCEDC8" />
      {kinds.map((k, i) => (
        <Person key={`${k}-${i}`} x={xs[i]} y={10} kind={k} mood={mood} arms={arms} scale={0.95} />
      ))}
      {/playing/.test(c) && <circle cx="188" cy="96" r="9" fill="#EF5350" stroke="#fff" strokeWidth="2" />}
      {/tv/.test(c) && (
        <>
          <rect x="170" y="60" width="46" height="32" rx="4" fill="#455A64" />
          <rect x="175" y="65" width="36" height="22" rx="2" fill="#81D4FA" />
        </>
      )}
    </svg>
  );
};
