import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import Modal from '../../components/Modal';
import SpeakButton from '../../components/SpeakButton';
import BadgeToast from '../../components/BadgeToast';
import { StoryIllustration } from '../../components/SceneArt';
import { islamicStories } from '../../data/stories';
import type { Story } from '../../data/types';
import { getIslamicProgress, markStoryComplete } from '../../engine/islamicProgress';
import { getEncouragement, speakArabic, speakSequence } from '../../engine/islamicSound';
import { useAutoSpeak } from '../../engine/useAutoSpeak';

type Stage = 'scenes' | 'activity' | 'done';

const StoryPlayer: React.FC<{ story: Story; done: boolean; onClose: () => void; onComplete: () => void }> = ({
  story,
  done,
  onClose,
  onComplete,
}) => {
  const [stage, setStage] = useState<Stage>('scenes');
  const [idx, setIdx] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [actWrong, setActWrong] = useState<number[]>([]);
  const [actSolved, setActSolved] = useState(false);

  const scene = story.scenes[idx];
  const last = idx === story.scenes.length - 1;
  const activity = story.activity;

  const sceneSpeech = scene.choices ? `${scene.text}. ${scene.choices.map((c) => c.text).join('، أَو ')}` : scene.text;
  const spoken =
    stage === 'scenes'
      ? sceneSpeech
      : stage === 'activity' && activity
        ? `${activity.prompt}. ${activity.options.join('، أَو ')}`
        : `َأَحْسَنْت! ${story.moralLesson}`;
  useAutoSpeak(spoken, `${stage}-${idx}`);

  const afterScenes = () => setStage(activity ? 'activity' : 'done');

  const choose = (id: string, ok: boolean, text: string) => {
    if (feedback || solved) return;
    setFeedback({ ok, text });
    speakArabic(text);
    if (ok) {
      setSolved(true);
    } else {
      setWrong((w) => [...w, id]);
      window.setTimeout(() => setFeedback(null), 2600);
    }
  };

  const next = () => {
    setFeedback(null);
    setSolved(false);
    setWrong([]);
    if (last) afterScenes();
    else setIdx((i) => i + 1);
  };

  const pickActivity = (i: number) => {
    if (!activity || actSolved || actWrong.includes(i)) return;
    if (i === activity.correctIndex) {
      setActSolved(true);
      speakSequence([getEncouragement()]);
    } else {
      setActWrong((w) => [...w, i]);
      speakArabic('حاوِل مَرَّةً أُخرى!');
    }
  };

  const header = (
    <div style={{ background: `linear-gradient(135deg, ${story.color}, ${story.color}bb)`, padding: '14px 18px', borderRadius: '24px 24px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ color: 'rgba(255,255,255,.85)', fontSize: '.78rem' }}>
          {stage === 'scenes' ? `مَشهَد ${idx + 1} / ${story.scenes.length}` : stage === 'activity' ? 'نَشاطٌ صَغير' : 'نِهايَةُ القِصَّة'}
        </div>
        <div style={{ color: '#fff', fontWeight: 800 }}>{story.title}</div>
      </div>
      <button type="button" aria-label="إِغلاق" onClick={onClose} style={{ background: 'rgba(255,255,255,.22)', border: 'none', color: '#fff', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer' }}>
        ✕
      </button>
    </div>
  );

  return (
    <Modal onClose={onClose} flush>
      {header}
      <div style={{ padding: '18px 18px 22px' }}>
        {stage === 'scenes' && (
          <>
            <StoryIllustration character={scene.character} />
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '14px 0' }}>
              <p className="story-text" style={{ margin: 0, flex: 1, textAlign: 'right' }}>{scene.text}</p>
              <SpeakButton text={sceneSpeech} />
            </div>

            {feedback && (
              <div className="fade-in" style={{ background: feedback.ok ? '#E8F5E9' : '#FFF3E0', border: `2px solid ${feedback.ok ? '#4CAF50' : '#FF9800'}`, borderRadius: 14, padding: '12px 14px', marginBottom: 12 }}>
                <p style={{ margin: 0, fontWeight: 700, color: feedback.ok ? '#2E7D32' : '#E65100' }}>{feedback.text}</p>
              </div>
            )}

            {scene.choices &&
              scene.choices.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className={`story-choice ${solved && c.isCorrect ? 'correct' : ''} ${wrong.includes(c.id) ? 'wrong' : ''}`}
                  style={{ display: 'block', width: '100%', maxWidth: 'none' }}
                  disabled={solved || wrong.includes(c.id)}
                  onClick={() => choose(c.id, c.isCorrect, c.feedback)}
                >
                  {c.text}
                </button>
              ))}

            {(!scene.choices || solved) && (
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <button type="button" className="btn-primary" style={{ background: `linear-gradient(135deg, ${story.color}, ${story.color}bb)` }} onClick={next}>
                  {last ? 'إِنهاءُ القِصَّة 🎉' : 'التّالي ←'}
                </button>
              </div>
            )}
          </>
        )}

        {stage === 'activity' && activity && (
          <>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
              <p className="q-text" style={{ margin: 0, flex: 1, fontWeight: 800 }}>{activity.prompt}</p>
              <SpeakButton text={`${activity.prompt}. ${activity.options.join('، أَو ')}`} />
            </div>
            {activity.options.map((o, i) => (
              <button
                type="button"
                key={o}
                className={`quiz-option ${actSolved && i === activity.correctIndex ? 'correct' : ''} ${actWrong.includes(i) ? 'retry' : ''} ${actSolved ? 'disabled' : ''}`}
                onClick={() => pickActivity(i)}
              >
                {o}
              </button>
            ))}
            {actSolved && (
              <div style={{ textAlign: 'center', marginTop: 10 }} className="fade-in">
                <button type="button" className="btn-primary" onClick={() => setStage('done')}>
                  التّالي ←
                </button>
              </div>
            )}
          </>
        )}

        {stage === 'done' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.4rem' }}>🌟</div>
            <h2 style={{ margin: '4px 0 10px', color: story.color }}>َأَحْسَنْت!</h2>
            <div style={{ background: `${story.color}15`, borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#444', lineHeight: 1.8 }}>{story.moralLesson}</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                عَودَة
              </button>
              {!done && (
                <button type="button" className="btn-primary" style={{ flex: 2, background: `linear-gradient(135deg, ${story.color}, ${story.color}bb)` }} onClick={onComplete}>
                  أَتمَمتُ القِصَّةَ ⭐
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

const StoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Story | null>(null);
  const [progress, setProgress] = useState(getIslamicProgress());
  const [newBadges, setNewBadges] = useState<string[]>([]);

  const complete = (id: string) => {
    const fresh = markStoryComplete(id);
    setProgress(getIslamicProgress());
    setSelected(null);
    if (fresh.length) setNewBadges(fresh);
  };

  return (
    <PageShell onBack={() => navigate('/islamic')} icon="📖" title="قِصَصٌ وَقِيَم" subtitle="قِصَصٌ جَميلَةٌ تُعَلِّمُنا الأَخلاقَ الحَسَنَة">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {islamicStories.map((s, i) => {
          const done = progress.completedStories.includes(s.id);
          return (
            <div
              key={s.id}
              role="button"
              tabIndex={0}
              className="content-card fade-in"
              style={{ borderRightColor: s.color, alignItems: 'center', animationDelay: `${i * 0.07}s` }}
              onClick={() => setSelected(s)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelected(s)}
            >
              <div className="card-icon" style={{ background: `${s.color}18` }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ margin: 0, color: s.color }}>{s.title}</h3>
                  {done && <span style={{ fontSize: '.72rem', background: '#E8F5E9', color: '#388E3C', borderRadius: 20, padding: '2px 8px', fontWeight: 700 }}>✓</span>}
                </div>
                <p style={{ margin: '4px 0 0' }}>{s.subtitle} · {s.scenes.length} مَشاهِد</p>
              </div>
              <SpeakButton text={`${s.title}. ${s.subtitle}`} size="sm" />
            </div>
          );
        })}
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: 16, marginTop: 22, textAlign: 'center', boxShadow: '0 3px 12px rgba(0,0,0,.07)' }}>
        <div style={{ fontWeight: 700, color: '#555' }}>
          أَكمَلتَ {progress.completedStories.length} / {islamicStories.length} قِصَص
        </div>
        <div className="progress-bar-wrap" style={{ marginTop: 10 }}>
          <div className="progress-bar-fill" style={{ width: `${(progress.completedStories.length / islamicStories.length) * 100}%` }} />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button type="button" className="btn-primary" onClick={() => navigate('/islamic/quiz/stories')}>
          اختَبِر نَفسَكَ ⭐
        </button>
      </div>

      {selected && (
        <StoryPlayer
          key={selected.id}
          story={selected}
          done={progress.completedStories.includes(selected.id)}
          onClose={() => setSelected(null)}
          onComplete={() => complete(selected.id)}
        />
      )}
      {newBadges.length > 0 && <BadgeToast badgeIds={newBadges} onClose={() => setNewBadges((b) => b.slice(1))} />}
    </PageShell>
  );
};

export default StoriesPage;
