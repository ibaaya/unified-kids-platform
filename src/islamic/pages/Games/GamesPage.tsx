import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import SpeakButton from '../../components/SpeakButton';
import BadgeToast from '../../components/BadgeToast';
import { PuzzleScene } from '../../components/SceneArt';
import { getIslamicProgress, markGameComplete } from '../../engine/islamicProgress';
import { getEncouragement, getTryAgain, speakArabic, speakSequence } from '../../engine/islamicSound';
import { useAutoSpeak } from '../../engine/useAutoSpeak';
import { collectItems, gameCatalog, matchPairs, memoryPairs, orderGames, picturePuzzles, scenarioSets } from '../../data/games';
import type { GameMeta, OrderGameDef, ScenarioDef } from '../../data/types';

// =====================================================
// ألعاب أخلاقي الجميلة (تعمل باللمس والفأرة، بدون سحب وإفلات)
// =====================================================

const shuffle = <T,>(list: T[]): T[] => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

interface FinishProps {
  onFinish: () => void;
}

const optionsSpeech = (options: string[]) => options.join('، أَو ');

// ─── 1) لعبة الترتيب: المس الخطوات بالتسلسل ───
const OrderGame: React.FC<FinishProps & { def: OrderGameDef }> = ({ def, onFinish }) => {
  const n = def.items.length;
  const [pool, setPool] = useState<string[]>(() => shuffle(def.items.map((i) => i.id)));
  const [slots, setSlots] = useState<(string | null)[]>(() => Array<string | null>(n).fill(null));
  const [locked, setLocked] = useState<boolean[]>(() => Array<boolean>(n).fill(false));
  const [msg, setMsg] = useState('');
  const textOf = (id: string) => def.items.find((i) => i.id === id)?.text ?? '';
  useAutoSpeak(def.prompt);

  const evaluate = (next: (string | null)[], nextPool: string[]) => {
    if (next.some((s) => s === null)) {
      setSlots(next);
      setPool(nextPool);
      return;
    }
    const ok = next.map((s, i) => s === def.items[i].id);
    if (ok.every(Boolean)) {
      setSlots(next);
      setPool(nextPool);
      setLocked(ok);
      setMsg('َأَحْسَنْت! التَّرتيبُ صَحيح');
      speakSequence([getEncouragement()]);
      window.setTimeout(onFinish, 1400);
      return;
    }
    const returned = next.filter((s, i) => s !== null && !ok[i]) as string[];
    setSlots(next.map((s, i) => (ok[i] ? s : null)));
    setLocked(ok);
    setPool([...nextPool, ...returned]);
    const text = `${getTryAgain()} بَعضُ الخُطُواتِ في مَكانِها الصَّحيح.`;
    setMsg(text);
    speakArabic(text);
  };

  const place = (id: string) => {
    const idx = slots.findIndex((s) => s === null);
    if (idx < 0) return;
    speakArabic(textOf(id));
    const next = [...slots];
    next[idx] = id;
    evaluate(next, pool.filter((p) => p !== id));
  };

  const remove = (idx: number) => {
    const id = slots[idx];
    if (!id || locked[idx]) return;
    const next = [...slots];
    next[idx] = null;
    setSlots(next);
    setPool([...pool, id]);
    setMsg('');
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <p style={{ margin: 0, flex: 1, fontWeight: 700, color: '#444' }}>{def.prompt}</p>
        <SpeakButton text={def.prompt} size="sm" />
      </div>
      {slots.map((id, i) => (
        <button
          type="button"
          key={i}
          className={`order-slot ${id ? 'filled' : ''} ${locked[i] ? 'locked' : ''}`}
          onClick={() => remove(i)}
        >
          <span className="slot-num" style={locked[i] ? { background: '#4CAF50', color: '#fff' } : undefined}>
            {i + 1}
          </span>
          <span style={{ flex: 1 }}>{id ? textOf(id) : ''}</span>
          {locked[i] && <span>✓</span>}
        </button>
      ))}
      {msg && (
        <p className="fade-in" style={{ textAlign: 'center', fontWeight: 700, color: '#E65100', margin: '10px 0 0' }}>
          {msg}
        </p>
      )}
      <div className="chip-pool">
        {pool.map((id) => (
          <button type="button" key={id} className="order-chip" onClick={() => place(id)}>
            {textOf(id)}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── 2) المَوَاقِف (مَاذَا أفعل؟ / أكمل القصة / تحدي الأخلاق) ───
const ScenarioGame: React.FC<FinishProps & { items: ScenarioDef[] }> = ({ items, onFinish }) => {
  const list = useMemo(() => shuffle(items).slice(0, 8), [items]);
  const [idx, setIdx] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);
  const sc = list[idx];
  useAutoSpeak(`${sc.situation}. ${optionsSpeech(sc.options)}`, idx);

  const pick = (i: number) => {
    if (solved || wrong.includes(i)) return;
    if (i === sc.correctIndex) {
      setSolved(true);
      if (wrong.length === 0) setScore((s) => s + 1);
      speakSequence([getEncouragement(), sc.explanation]);
    } else {
      setWrong((w) => [...w, i]);
      speakArabic(getTryAgain());
    }
  };

  const next = () => {
    if (idx + 1 >= list.length) {
      onFinish();
      return;
    }
    setIdx(idx + 1);
    setWrong([]);
    setSolved(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', color: '#888', marginBottom: 10 }}>
        <span>مَوقِف {idx + 1} / {list.length}</span>
        <span>⭐ {score}</span>
      </div>
      <div className="quiz-question" style={{ background: 'linear-gradient(135deg,#FFF9C4,#FFFDE7)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <p className="q-text" style={{ margin: 0, flex: 1 }}>{sc.situation}</p>
          <SpeakButton text={`${sc.situation}. ${optionsSpeech(sc.options)}`} size="md" />
        </div>
      </div>
      {sc.options.map((opt, i) => (
        <button
          type="button"
          key={opt}
          className={`quiz-option ${solved && i === sc.correctIndex ? 'correct' : ''} ${wrong.includes(i) ? 'retry' : ''} ${solved ? 'disabled' : ''}`}
          onClick={() => pick(i)}
        >
          {opt}
        </button>
      ))}
      {solved && (
        <div className="fade-in">
          <div style={{ background: '#E8F5E9', borderRadius: 14, padding: '12px 14px', margin: '10px 0', display: 'flex', gap: 10, alignItems: 'center' }}>
            <SpeakButton text={sc.explanation} size="sm" />
            <p style={{ margin: 0, flex: 1, fontSize: '.9rem', color: '#33691E', fontWeight: 600 }}>{sc.explanation}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button type="button" className="btn-primary" onClick={next}>
              {idx + 1 >= list.length ? 'إِنهاء 🎉' : 'التّالي ←'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── 3) ألغاز الصور (SVG) ───
const PictureGame: React.FC<FinishProps> = ({ onFinish }) => {
  const list = useMemo(() => shuffle(picturePuzzles), []);
  const [idx, setIdx] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const pz = list[idx];
  useAutoSpeak(`${pz.question}. ${optionsSpeech(pz.options)}`, idx);

  const pick = (i: number) => {
    if (solved || wrong.includes(i)) return;
    if (i === pz.correctIndex) {
      setSolved(true);
      speakSequence([getEncouragement(), pz.explanation]);
    } else {
      setWrong((w) => [...w, i]);
      speakArabic(getTryAgain());
    }
  };

  const next = () => {
    if (idx + 1 >= list.length) {
      onFinish();
      return;
    }
    setIdx(idx + 1);
    setWrong([]);
    setSolved(false);
  };

  return (
    <div>
      <div style={{ fontSize: '.85rem', color: '#888', marginBottom: 10 }}>لُغز {idx + 1} / {list.length}</div>
      <PuzzleScene scene={pz.scene} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '14px 0' }}>
        <p className="q-text" style={{ margin: 0, flex: 1, fontWeight: 800 }}>{pz.question}</p>
        <SpeakButton text={`${pz.question}. ${optionsSpeech(pz.options)}`} size="md" />
      </div>
      {pz.options.map((opt, i) => (
        <button
          type="button"
          key={opt}
          className={`quiz-option ${solved && i === pz.correctIndex ? 'correct' : ''} ${wrong.includes(i) ? 'retry' : ''} ${solved ? 'disabled' : ''}`}
          onClick={() => pick(i)}
        >
          {opt}
        </button>
      ))}
      {solved && (
        <div className="fade-in" style={{ textAlign: 'center', marginTop: 8 }}>
          <p style={{ fontWeight: 700, color: '#33691E' }}>{pz.explanation}</p>
          <button type="button" className="btn-primary" onClick={next}>
            {idx + 1 >= list.length ? 'إِنهاء 🎉' : 'التّالي ←'}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── 4) المطابقة: القيمة ← التصرف ───
const MatchGame: React.FC<FinishProps> = ({ onFinish }) => {
  const rights = useMemo(() => shuffle(matchPairs), []);
  const [sel, setSel] = useState<{ side: 'l' | 'r'; id: string } | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [bad, setBad] = useState<string | null>(null);
  const prompt = 'صِل كُلَّ قيمَةٍ بِالتَّصَرُّفِ المُناسِبِ لَها';
  useAutoSpeak(prompt);

  const tap = (side: 'l' | 'r', id: string, text: string) => {
    if (done.includes(id)) return;
    speakArabic(text);
    if (!sel || sel.side === side) {
      setSel({ side, id });
      return;
    }
    if (sel.id === id) {
      const next = [...done, id];
      setDone(next);
      setSel(null);
      window.setTimeout(() => speakArabic(getEncouragement()), 900);
      if (next.length === matchPairs.length) window.setTimeout(onFinish, 1600);
    } else {
      setBad(id);
      window.setTimeout(() => {
        setBad(null);
        setSel(null);
        speakArabic(getTryAgain());
      }, 800);
    }
  };

  const style = (side: 'l' | 'r', id: string): React.CSSProperties => ({
    width: '100%',
    marginBottom: 8,
    padding: '12px 10px',
    borderRadius: 12,
    fontFamily: 'inherit',
    fontWeight: 700,
    fontSize: '.85rem',
    lineHeight: 1.5,
    cursor: done.includes(id) ? 'default' : 'pointer',
    color: '#333',
    border: `2px solid ${done.includes(id) ? '#4CAF50' : sel?.id === id && sel.side === side ? '#2196F3' : bad === id ? '#FF9800' : '#e0e0e0'}`,
    background: done.includes(id) ? '#E8F5E9' : sel?.id === id && sel.side === side ? '#E3F2FD' : '#fff',
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
        <p style={{ margin: 0, flex: 1, fontWeight: 700, color: '#444' }}>{prompt}</p>
        <SpeakButton text={prompt} size="sm" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          {matchPairs.map((p) => (
            <button type="button" key={p.id} style={style('l', p.id)} onClick={() => tap('l', p.id, p.left)}>
              {p.left} {done.includes(p.id) ? '✓' : ''}
            </button>
          ))}
        </div>
        <div>
          {rights.map((p) => (
            <button type="button" key={p.id} style={style('r', p.id)} onClick={() => tap('r', p.id, p.right)}>
              {p.right}
            </button>
          ))}
        </div>
      </div>
      <p style={{ textAlign: 'center', color: '#888', fontSize: '.85rem' }}>{done.length} / {matchPairs.length}</p>
    </div>
  );
};

// ─── 5) بطاقات الذاكرة ───
interface MemCard {
  uid: string;
  id: string;
  label: string;
  icon: string;
}

const MemoryGame: React.FC<FinishProps> = ({ onFinish }) => {
  const cards = useMemo<MemCard[]>(
    () => shuffle(memoryPairs.flatMap((p) => [{ uid: `${p.id}a`, ...p }, { uid: `${p.id}b`, ...p }])),
    [],
  );
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const busy = useRef(false);
  const prompt = 'اقلِبِ البِطاقاتِ وَابحَث عَن كُلِّ قيمَةٍ مَرَّتَين';
  useAutoSpeak(prompt);

  const flip = (c: MemCard) => {
    if (busy.current || open.includes(c.uid) || matched.includes(c.uid)) return;
    speakArabic(c.label);
    const next = [...open, c.uid];
    setOpen(next);
    if (next.length < 2) return;
    busy.current = true;
    setMoves((m) => m + 1);
    const [a, b] = next.map((u) => cards.find((x) => x.uid === u) as MemCard);
    window.setTimeout(() => {
      if (a.id === b.id) {
        const all = [...matched, a.uid, b.uid];
        setMatched(all);
        speakArabic(getEncouragement());
        if (all.length === cards.length) window.setTimeout(onFinish, 1500);
      }
      setOpen([]);
      busy.current = false;
    }, 900);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
        <p style={{ margin: 0, flex: 1, fontWeight: 700, color: '#444' }}>{prompt}</p>
        <SpeakButton text={prompt} size="sm" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', color: '#888', marginBottom: 10 }}>
        <span>{matched.length / 2} / {memoryPairs.length}</span>
        <span>مُحاوَلات: {moves}</span>
      </div>
      <div className="memory-grid">
        {cards.map((c) => {
          const shown = open.includes(c.uid) || matched.includes(c.uid);
          return (
            <button
              type="button"
              key={c.uid}
              aria-label={shown ? c.label : 'بِطاقَةٌ مَقلوبَة'}
              className={`mem-card ${shown ? 'open' : ''} ${matched.includes(c.uid) ? 'matched' : ''}`}
              onClick={() => flip(c)}
            >
              {shown ? (
                <>
                  <span>{c.icon}</span>
                  <span className="lbl">{c.label}</span>
                </>
              ) : (
                <span>؟</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── 6) اجمع الخير ───
const CollectGame: React.FC<FinishProps> = ({ onFinish }) => {
  const cards = useMemo(() => shuffle(collectItems), []);
  const goodTotal = collectItems.filter((c) => c.good).length;
  const [got, setGot] = useState<string[]>([]);
  const [nope, setNope] = useState<string | null>(null);
  const prompt = 'المَسِ التَّصَرُّفاتِ الجَميلَةَ فَقَط، وَاجمَعِ الخَير';
  useAutoSpeak(prompt);

  const tap = (id: string, text: string, good: boolean) => {
    if (got.includes(id)) return;
    if (good) {
      const next = [...got, id];
      setGot(next);
      speakSequence([text, getEncouragement()]);
      if (next.length === goodTotal) window.setTimeout(onFinish, 1800);
    } else {
      setNope(id);
      speakArabic('هَذا لَيسَ مِنَ الخَير، اختَر غَيرَه.');
      window.setTimeout(() => setNope(null), 600);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
        <p style={{ margin: 0, flex: 1, fontWeight: 700, color: '#444' }}>{prompt}</p>
        <SpeakButton text={prompt} size="sm" />
      </div>
      <p style={{ textAlign: 'center', fontWeight: 800, color: '#E91E63' }}>🎈 {got.length} / {goodTotal}</p>
      <div className="collect-grid">
        {cards.map((c) => (
          <button
            type="button"
            key={c.id}
            className={`collect-card ${got.includes(c.id) ? 'got' : ''} ${nope === c.id ? 'nope' : ''}`}
            onClick={() => tap(c.id, c.text, c.good)}
          >
            <span className="ic">{got.includes(c.id) ? '✅' : c.icon}</span>
            <span>{c.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── اختيار اللعبة وعرضها ───
const renderGame = (meta: GameMeta, onFinish: () => void): React.ReactNode => {
  switch (meta.kind) {
    case 'order': {
      const def = meta.dataId ? orderGames[meta.dataId] : undefined;
      return def ? <OrderGame def={def} onFinish={onFinish} /> : null;
    }
    case 'scenario':
      return <ScenarioGame items={scenarioSets[meta.dataId ?? 'what_do_i_do']} onFinish={onFinish} />;
    case 'picture':
      return <PictureGame onFinish={onFinish} />;
    case 'match':
      return <MatchGame onFinish={onFinish} />;
    case 'memory':
      return <MemoryGame onFinish={onFinish} />;
    case 'collect':
      return <CollectGame onFinish={onFinish} />;
    default:
      return null;
  }
};

const GamesPage: React.FC = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState<GameMeta | null>(null);
  const [finished, setFinished] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [doneGames, setDoneGames] = useState(getIslamicProgress().completedGames);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  const finish = () => {
    if (!active) return;
    const fresh = markGameComplete(active.id);
    setDoneGames(getIslamicProgress().completedGames);
    setFinished(true);
    if (fresh.length) setNewBadges(fresh);
    speakArabic('َأَحْسَنْت! أَنهَيتَ اللُّعبَة');
  };

  const back = () => {
    if (active) {
      setActive(null);
      setFinished(false);
    } else {
      navigate('/islamic');
    }
  };

  return (
    <PageShell
      onBack={back}
      icon={active ? active.icon : '🎮'}
      title={active ? active.title : 'تَحَدِّي الأَخلاق'}
      subtitle={active ? active.desc : 'تَعَلَّم وَالعَب في الوَقتِ نَفسِه!'}
      maxWidth={560}
    >
      {!active && (
        <div className="islamic-grid">
          {gameCatalog.map((g, i) => (
            <button
              type="button"
              key={g.id}
              className="world-card game-card-btn fade-in"
              style={{ background: `${g.color}14`, animationDelay: `${i * 0.05}s`, borderColor: doneGames.includes(g.id) ? g.color : 'transparent' }}
              onClick={() => {
                setActive(g);
                setFinished(false);
                setRunKey((k) => k + 1);
              }}
            >
              {doneGames.includes(g.id) && <span className="progress-dot" />}
              <span className="world-icon">{g.icon}</span>
              <h3 style={{ color: g.color }}>{g.title}</h3>
              <p>{g.desc}</p>
            </button>
          ))}
        </div>
      )}

      {active && !finished && <div key={runKey}>{renderGame(active, finish)}</div>}

      {active && finished && (
        <div className="result-screen fade-in">
          <div className="result-emoji">🎉</div>
          <h2 style={{ color: active.color }}>َأَحْسَنْت!</h2>
          <p>أَنهَيتَ لُعبَةَ «{active.title}»</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1 }}
              onClick={() => {
                setFinished(false);
                setRunKey((k) => k + 1);
              }}
            >
              العَب مَرَّةً أُخرى
            </button>
            <button type="button" className="btn-primary" style={{ flex: 1 }} onClick={() => setActive(null)}>
              لُعبَةٌ أُخرى
            </button>
          </div>
        </div>
      )}

      {newBadges.length > 0 && <BadgeToast badgeIds={newBadges} onClose={() => setNewBadges((b) => b.slice(1))} />}
    </PageShell>
  );
};

export default GamesPage;
