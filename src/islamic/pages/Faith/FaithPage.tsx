import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import SpeakButton from '../../components/SpeakButton';
import BadgeToast from '../../components/BadgeToast';
import { islamPillars, imanPillars, prophetInfo, selectedAdhkar } from '../../data/islamPillars';
import { FAITH_IDS, getIslamicProgress, markFaithComplete } from '../../engine/islamicProgress';
import { speakArabic } from '../../engine/islamicSound';

type Tab = 'islam' | 'iman' | 'prophet' | 'dhikr';

const TABS: { key: Tab; label: string; icon: string; color: string }[] = [
  { key: 'islam', label: 'أَرْكَانُ الْإِسْلَام', icon: '☪️', color: '#4CAF50' },
  { key: 'iman', label: 'أَرْكَانُ الْإِيمَان', icon: '✨', color: '#7C4DFF' },
  { key: 'prophet', label: 'نَبِيُّنَا', icon: '💛', color: '#F9A825' },
  { key: 'dhikr', label: 'الْأَذْكَار', icon: '🤲', color: '#26A69A' },
];

// النص المنطوق عند فتح كل تبويب
const TAB_INTRO: Record<Tab, string> = {
  islam: 'أَرْكَانُ الْإِسْلَامِ خَمْسَة.',
  iman: 'أَرْكَانُ الْإِيمَانِ سِتَّة. اِلْمَسِ الْبِطَاقَةَ لِتَعْرِفَ الْمَزِيد.',
  prophet: `نَبِيُّنَا ${prophetInfo.name}. ${prophetInfo.description}`,
  dhikr: 'أَذْكَارٌ جَمِيلَةٌ نَقُولُهَا كُلَّ يَوْم.',
};

const FaithPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('islam');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(getIslamicProgress());
  const [newBadges, setNewBadges] = useState<string[]>([]);

  // ✅ نطق تلقائي عند فتح الصفحة وعند تغيّر التبويب
  useEffect(() => {
    const timer = window.setTimeout(() => {
      speakArabic(TAB_INTRO[tab])
    }, 400)
    return () => window.clearTimeout(timer)
  }, [tab])

  const finish = (id: string) => {
    const fresh = markFaithComplete(id);
    setProgress(getIslamicProgress());
    if (fresh.length) setNewBadges(fresh);
  };

  const doneBtn = (id: string) =>
    progress.completedFaith.includes(id) ? (
      <p style={{ textAlign: 'center', fontWeight: 800, color: '#2E7D32', fontSize: '1.15rem', marginTop: 22, background: '#E8F5E9', borderRadius: 16, padding: '14px 16px', boxShadow: '0 4px 14px rgba(46,125,50,.15)' }}>
        ✓ أَحْسَنْتَ! تَعَلَّمْتَ هَذَا الدَّرْس
      </p>
    ) : (
      <div style={{ textAlign: 'center', marginTop: 22 }}>
        <button type="button" className="btn-primary" onClick={() => finish(id)} style={{ fontSize: '1.15rem', padding: '14px 28px', borderRadius: 18, fontWeight: 800, boxShadow: '0 8px 22px rgba(76,175,80,.35)' }}>
          تَعَلَّمْتُ ⭐
        </button>
      </div>
    );

  return (
    <PageShell onBack={() => navigate('/islamic')} icon="☪️" title="دِينِي الْجَمِيل" subtitle="أَتَعَرَّفُ عَلَى دِينِ الْإِسْلَامِ الْجَمِيل">
      {/* شريط التبويبات */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 22, background: 'linear-gradient(135deg, #f6faf6, #eef5ee)', padding: 8, borderRadius: 20, overflowX: 'auto', boxShadow: 'inset 0 2px 6px rgba(0,0,0,.05)', scrollbarWidth: 'none' }}>
        {TABS.map((t) => {
          const isActive = tab === t.key;
          return (
            <button type="button" key={t.key} onClick={() => setTab(t.key)} style={{ flex: '1 0 auto', padding: '12px 18px', borderRadius: 14, border: isActive ? `2px solid ${t.color}` : '2px solid transparent', whiteSpace: 'nowrap', fontFamily: 'inherit', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', background: isActive ? '#fff' : 'transparent', color: isActive ? t.color : '#8a8a8a', boxShadow: isActive ? `0 6px 16px ${t.color}33` : 'none', transition: 'all .2s ease' }}>
              <span style={{ fontSize: '1.15rem', marginLeft: 4 }}>{t.icon}</span> {t.label}
            </button>
          );
        })}
      </div>

      {/* ── أركان الإسلام ── */}
      {tab === 'islam' && (
        <div className="fade-in">
          <p style={{ textAlign: 'center', color: '#5a6b72', fontSize: '1.1rem', fontWeight: 600, marginBottom: 18 }}>
            بُنِيَ الْإِسْلَامُ عَلَى خَمْسَةِ أَرْكَان
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {islamPillars.map((p, i) => (
              <div key={p.id} className="fade-in" style={{ background: 'linear-gradient(135deg, #ffffff, #fbfefb)', borderRadius: 22, padding: '18px 18px', display: 'flex', alignItems: 'center', gap: 14, borderRight: `6px solid ${p.color}`, boxShadow: '0 8px 22px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04)', animationDelay: `${i * 0.06}s`, transition: 'transform .2s ease, box-shadow .2s ease' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: `linear-gradient(135deg, ${p.color}30, ${p.color}15)`, color: p.color, fontWeight: 900, fontSize: '1.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `2px solid ${p.color}40`, boxShadow: `0 4px 12px ${p.color}25` }}>
                  {p.number}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: '0 0 6px', color: p.color, fontSize: '1.25rem', fontWeight: 800 }}>
                    <span style={{ fontSize: '1.4rem', marginLeft: 4 }}>{p.icon}</span> {p.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '1rem', color: '#4a5560', lineHeight: 1.8 }}>{p.description}</p>
                </div>
                {/* ✅ عند الضغط على السماعة ينطق الركن كاملاً */}
                <SpeakButton text={`الرُّكْنُ ${p.number}: ${p.title}. ${p.description}`} size="sm" />
              </div>
            ))}
          </div>
          {doneBtn(FAITH_IDS.islam)}
          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <button type="button" className="btn-secondary" onClick={() => navigate('/islamic/quiz/faith')} style={{ fontSize: '1.05rem', padding: '12px 26px', borderRadius: 16, fontWeight: 800 }}>
              اخْتَبِرْ نَفْسَكَ 🎯
            </button>
          </div>
        </div>
      )}

      {/* ── أركان الإيمان ── */}
      {tab === 'iman' && (
        <div className="fade-in">
          <p style={{ textAlign: 'center', color: '#5a6b72', fontSize: '1.1rem', fontWeight: 600, marginBottom: 18 }}>
            لِلْإِيمَانِ سِتَّةُ أَرْكَان. الْمَسِ الْبِطَاقَةَ لِتَعْرِفَ الْمَزِيد
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
            {imanPillars.map((p) => {
              const isOpen = !!open[p.id];
              return (
                <button type="button" key={p.id}
                  onClick={() => {
                    setOpen((o) => ({ ...o, [p.id]: !o[p.id] }));
                    // ✅ ينطق العنوان والوصف عند الضغط
                    speakArabic(`${p.title}. ${p.description}`);
                  }}
                  style={{ background: isOpen ? `linear-gradient(135deg, ${p.color}25, ${p.color}12)` : 'linear-gradient(135deg, #ffffff, #fbfbfb)', border: `3px solid ${isOpen ? p.color : '#eaeaea'}`, borderRadius: 22, padding: '20px 14px', minHeight: 140, cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit', boxShadow: isOpen ? `0 10px 24px ${p.color}33` : '0 6px 16px rgba(0,0,0,.06)', transition: 'all .25s ease' }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>{p.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: isOpen ? p.color : '#3a4652', lineHeight: 1.5 }}>
                    {p.number}. {p.title}
                  </div>
                  {isOpen && (
                    <p style={{ margin: '10px 0 0', fontSize: '.95rem', color: '#4a5560', lineHeight: 1.8 }}>
                      {p.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
          {doneBtn(FAITH_IDS.iman)}
        </div>
      )}

      {/* ── نبينا ── */}
      {tab === 'prophet' && (
        <div className="fade-in">
          <div style={{ background: 'linear-gradient(135deg,#FFF9C4,#FFFDE7)', border: '3px solid #FFD54F', borderRadius: 26, padding: '28px 20px', textAlign: 'center', marginBottom: 20, boxShadow: '0 12px 30px rgba(255,193,7,.22)' }}>
            <div style={{ fontSize: '4rem', lineHeight: 1 }}>💛</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '12px 0 6px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, color: '#E65100', fontSize: '1.6rem', fontWeight: 900 }}>{prophetInfo.name}</h2>
              <SpeakButton text={`${prophetInfo.name}. ${prophetInfo.description}`} />
            </div>
            <p style={{ margin: '0 0 10px', color: '#F57F17', fontWeight: 800, fontSize: '1.15rem' }}>{prophetInfo.subtitle}</p>
            <p style={{ margin: 0, color: '#4a5560', fontSize: '1.05rem', lineHeight: 1.9 }}>{prophetInfo.description}</p>
          </div>
          <h3 style={{ margin: '0 0 14px', fontSize: '1.2rem', color: '#4a5560', fontWeight: 800 }}>
            مِنْ صِفَاتِهِ الْجَمِيلَة:
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {prophetInfo.facts.map((f) => (
              <div key={f.id} style={{ background: 'linear-gradient(135deg, #ffffff, #fbfbfb)', borderRadius: 20, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 6px 18px rgba(0,0,0,.07)', border: '2px solid #FFF3C4' }}>
                <span style={{ fontSize: '2rem', flexShrink: 0 }}>{f.icon}</span>
                <p style={{ margin: 0, flex: 1, fontWeight: 700, color: '#3a4652', fontSize: '1.05rem', lineHeight: 1.8 }}>{f.text}</p>
                <SpeakButton text={f.text} size="sm" />
              </div>
            ))}
          </div>
          {doneBtn(FAITH_IDS.prophet)}
        </div>
      )}

      {/* ── الأذكار ── */}
      {tab === 'dhikr' && (
        <div className="fade-in">
          <p style={{ textAlign: 'center', color: '#5a6b72', fontSize: '1.1rem', fontWeight: 600, marginBottom: 18 }}>
            أَذْكَارٌ جَمِيلَةٌ نَقُولُهَا كُلَّ يَوْم
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {selectedAdhkar.map((d) => (
              <div key={d.id} style={{ background: 'linear-gradient(135deg, #ffffff, #fbfefd)', borderRadius: 22, padding: '20px 18px', borderRight: `6px solid ${d.color}`, boxShadow: '0 8px 22px rgba(0,0,0,.08)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '1.7rem', fontWeight: 900, color: d.color, lineHeight: 1.8, marginBottom: 6 }}>
                    {d.text}
                  </div>
                  <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#4a5560', fontSize: '1.05rem', lineHeight: 1.7 }}>{d.meaning}</p>
                  <span style={{ fontSize: '.95rem', background: `${d.color}18`, color: d.color, borderRadius: 20, padding: '5px 14px', fontWeight: 800, display: 'inline-block', border: `1.5px solid ${d.color}40` }}>
                    {d.occasion}
                  </span>
                </div>
                {/* ✅ ينطق الذكر ومعناه ومتى نقوله */}
                <SpeakButton text={`${d.text}. ${d.meaning}. نَقُولُهَا ${d.occasion}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {newBadges.length > 0 && <BadgeToast badgeIds={newBadges} onClose={() => setNewBadges((b) => b.slice(1))} />}
    </PageShell>
  );
};

export default FaithPage;