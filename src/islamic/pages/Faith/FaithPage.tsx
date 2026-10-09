import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import SpeakButton from '../../components/SpeakButton';
import BadgeToast from '../../components/BadgeToast';
import { islamPillars, imanPillars, prophetInfo, selectedAdhkar } from '../../data/islamPillars';
import { FAITH_IDS, getIslamicProgress, markFaithComplete } from '../../engine/islamicProgress';
import { speakArabic } from '../../engine/islamicSound';

type Tab = 'islam' | 'iman' | 'prophet' | 'dhikr';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'islam', label: 'أَركانُ الإِسلام', icon: '☪️' },
  { key: 'iman', label: 'أَركانُ الإِيمان', icon: '✨' },
  { key: 'prophet', label: 'نَبِيُّنا', icon: '💛' },
  { key: 'dhikr', label: 'الأَذكار', icon: '🤲' },
];

const FaithPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('islam');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(getIslamicProgress());
  const [newBadges, setNewBadges] = useState<string[]>([]);

  const finish = (id: string) => {
    const fresh = markFaithComplete(id);
    setProgress(getIslamicProgress());
    if (fresh.length) setNewBadges(fresh);
  };

  const doneBtn = (id: string) =>
    progress.completedFaith.includes(id) ? (
      <p style={{ textAlign: 'center', fontWeight: 700, color: '#388E3C' }}>✓ َأَحْسَنْت! تَعَلَّمتَ هَذا الدَّرس</p>
    ) : (
      <div style={{ textAlign: 'center', marginTop: 18 }}>
        <button type="button" className="btn-primary" onClick={() => finish(id)}>
          تَعَلَّمتُ ⭐
        </button>
      </div>
    );

  return (
    <PageShell onBack={() => navigate('/islamic')} icon="☪️" title="دِينِي الجَميل" subtitle="أَتَعَرَّفُ عَلى دينِ الإِسلامِ الجَميل">
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, background: '#f0f0f0', padding: 6, borderRadius: 16, overflowX: 'auto' }}>
        {TABS.map((t) => (
          <button
            type="button"
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 'none',
              padding: '9px 14px',
              borderRadius: 12,
              border: 'none',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: '.85rem',
              cursor: 'pointer',
              background: tab === t.key ? '#fff' : 'transparent',
              color: tab === t.key ? '#4CAF50' : '#888',
              boxShadow: tab === t.key ? '0 2px 8px rgba(0,0,0,.1)' : 'none',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'islam' && (
        <div className="fade-in">
          <p style={{ textAlign: 'center', color: '#666' }}>بُنِيَ الإِسلامُ عَلى خَمسَةِ أَركان</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {islamPillars.map((p, i) => (
              <div
                key={p.id}
                className="fade-in"
                style={{ background: '#fff', borderRadius: 18, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderRight: `5px solid ${p.color}`, boxShadow: '0 3px 12px rgba(0,0,0,.07)', animationDelay: `${i * 0.06}s` }}
              >
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: `${p.color}20`, color: p.color, fontWeight: 800, fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {p.number}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px', color: p.color, fontSize: '1rem' }}>
                    {p.icon} {p.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '.88rem', color: '#555', lineHeight: 1.6 }}>{p.description}</p>
                </div>
                <SpeakButton text={`الرُّكنُ ${p.number}: ${p.title}. ${p.description}`} size="sm" />
              </div>
            ))}
          </div>
          {doneBtn(FAITH_IDS.islam)}
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button type="button" className="btn-secondary" onClick={() => navigate('/islamic/quiz/faith')}>
              اختَبِر نَفسَكَ
            </button>
          </div>
        </div>
      )}

      {tab === 'iman' && (
        <div className="fade-in">
          <p style={{ textAlign: 'center', color: '#666' }}>لِلإِيمانِ سِتَّةُ أَركان. المَس البِطاقَةَ لِتَعرِفَ المَزيد</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {imanPillars.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => {
                  setOpen((o) => ({ ...o, [p.id]: !o[p.id] }));
                  speakArabic(`${p.title}. ${p.description}`);
                }}
                style={{
                  background: open[p.id] ? `${p.color}22` : '#fff',
                  border: `2.5px solid ${open[p.id] ? p.color : '#e8e8e8'}`,
                  borderRadius: 18,
                  padding: '16px 12px',
                  minHeight: 110,
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>{p.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '.88rem', color: '#444' }}>
                  {p.number}. {p.title}
                </div>
                {open[p.id] && <p style={{ margin: '6px 0 0', fontSize: '.78rem', color: '#555', lineHeight: 1.6 }}>{p.description}</p>}
              </button>
            ))}
          </div>
          {doneBtn(FAITH_IDS.iman)}
        </div>
      )}

      {tab === 'prophet' && (
        <div className="fade-in">
          <div style={{ background: 'linear-gradient(135deg,#FFF9C4,#FFFDE7)', border: '2px solid #FFD54F', borderRadius: 20, padding: '22px 18px', textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: '3rem' }}>💛</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '6px 0' }}>
              <h2 style={{ margin: 0, color: '#F57F17', fontSize: '1.25rem' }}>{prophetInfo.name}</h2>
              <SpeakButton text={`${prophetInfo.name}. ${prophetInfo.description}`} />
            </div>
            <p style={{ margin: '0 0 6px', color: '#F9A825', fontWeight: 700 }}>{prophetInfo.subtitle}</p>
            <p style={{ margin: 0, color: '#666', fontSize: '.92rem', lineHeight: 1.8 }}>{prophetInfo.description}</p>
          </div>
          <h3 style={{ margin: '0 0 10px', fontSize: '.95rem', color: '#555' }}>مِن صِفاتِهِ الجَميلَة:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {prophetInfo.facts.map((f) => (
              <div key={f.id} style={{ background: '#fff', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
                <span style={{ fontSize: '1.4rem' }}>{f.icon}</span>
                <p style={{ margin: 0, flex: 1, fontWeight: 600, color: '#444', fontSize: '.92rem', lineHeight: 1.6 }}>{f.text}</p>
                <SpeakButton text={f.text} size="sm" />
              </div>
            ))}
          </div>
          {doneBtn(FAITH_IDS.prophet)}
        </div>
      )}

      {tab === 'dhikr' && (
        <div className="fade-in">
          <p style={{ textAlign: 'center', color: '#666' }}>أَذكارٌ جَميلَةٌ نَقولُها كُلَّ يَوم</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selectedAdhkar.map((d) => (
              <div key={d.id} style={{ background: '#fff', borderRadius: 18, padding: '16px 16px', borderRight: `5px solid ${d.color}`, boxShadow: '0 3px 12px rgba(0,0,0,.07)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: d.color, lineHeight: 1.7 }}>{d.text}</div>
                  <p style={{ margin: '2px 0 6px', fontWeight: 600, color: '#555', fontSize: '.9rem' }}>{d.meaning}</p>
                  <span style={{ fontSize: '.75rem', background: `${d.color}15`, color: d.color, borderRadius: 20, padding: '3px 10px', fontWeight: 700 }}>{d.occasion}</span>
                </div>
                <SpeakButton text={`${d.text}. ${d.meaning}. نَقولُها ${d.occasion}`} />
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
