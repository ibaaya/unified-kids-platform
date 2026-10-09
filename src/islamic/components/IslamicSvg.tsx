import React from 'react';

// =====================================================
// رسومات SVG برمجية - أخلاقي الجميلة
// شخصيات للأطفال بدون تجسيد الأنبياء أو الصحابة
// =====================================================

interface SvgProps { size?: number; className?: string; }

// ─── ديكورات عامة ─────────────────────────────────

export const StarDecor: React.FC<SvgProps> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <polygon points="20,3 24,14 36,14 27,21 30,33 20,26 10,33 13,21 4,14 16,14" fill="#FFD700" opacity="0.9"/>
  </svg>
);

export const MoonDecor: React.FC<SvgProps> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <path d="M28 8 C18 8 10 16 10 26 C10 34 16 40 24 40 C32 40 38 34 38 26 C38 20 35 14 30 10 C30 10 36 12 36 20 C36 28 30 34 22 34 C16 34 12 30 12 24 C12 16 18 10 26 8 Z" fill="#C8A2C8"/>
  </svg>
);

export const HeartDecor: React.FC<SvgProps> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <path d="M18 31 L4 17 C0 13 2 7 7 6 C11 5 15 8 18 12 C21 8 25 5 29 6 C34 7 36 13 32 17 Z" fill="#FF6B8A"/>
  </svg>
);

export const GeometricPattern: React.FC<SvgProps & { color?: string }> = ({ size = 80, color = '#4CAF50' }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" opacity="0.15">
    <polygon points="40,5 75,20 75,60 40,75 5,60 5,20" stroke={color} strokeWidth="2" fill="none"/>
    <polygon points="40,15 65,27 65,53 40,65 15,53 15,27" stroke={color} strokeWidth="1.5" fill="none"/>
    <circle cx="40" cy="40" r="8" stroke={color} strokeWidth="1.5" fill="none"/>
  </svg>
);

// ─── شخصيات الأطفال ────────────────────────────────

// طفل سعيد
export const HappyBoy: React.FC<SvgProps & { color?: string }> = ({ size = 120, color = '#FFB74D' }) => (
  <svg width={size} height={size} viewBox="0 0 120 140" fill="none">
    {/* جسم */}
    <rect x="35" y="75" width="50" height="45" rx="10" fill="#7986CB"/>
    {/* رأس */}
    <circle cx="60" cy="55" r="28" fill={color}/>
    {/* وجه - عيون */}
    <ellipse cx="51" cy="50" rx="5" ry="6" fill="#333"/>
    <ellipse cx="69" cy="50" rx="5" ry="6" fill="#333"/>
    <circle cx="52" cy="48" r="2" fill="white"/>
    <circle cx="70" cy="48" r="2" fill="white"/>
    {/* ابتسامة */}
    <path d="M50 62 Q60 72 70 62" stroke="#333" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    {/* شعر */}
    <path d="M33 50 Q35 25 60 25 Q85 25 87 50" fill="#5D4037"/>
    {/* يدان */}
    <rect x="18" y="78" width="17" height="30" rx="8" fill={color}/>
    <rect x="85" y="78" width="17" height="30" rx="8" fill={color}/>
    {/* أرجل */}
    <rect x="38" y="115" width="16" height="22" rx="7" fill="#5C6BC0"/>
    <rect x="66" y="115" width="16" height="22" rx="7" fill="#5C6BC0"/>
  </svg>
);

// طفلة سعيدة
export const HappyGirl: React.FC<SvgProps & { color?: string }> = ({ size = 120, color = '#FFB74D' }) => (
  <svg width={size} height={size} viewBox="0 0 120 145" fill="none">
    {/* جسم - فستان */}
    <path d="M30 78 L90 78 L100 130 L20 130 Z" fill="#F48FB1"/>
    {/* رأس */}
    <circle cx="60" cy="52" r="27" fill={color}/>
    {/* شعر */}
    <path d="M33 48 Q33 22 60 22 Q87 22 87 48" fill="#5D4037"/>
    <rect x="30" y="40" width="8" height="30" rx="4" fill="#5D4037"/>
    <rect x="82" y="40" width="8" height="30" rx="4" fill="#5D4037"/>
    {/* عيون */}
    <ellipse cx="51" cy="48" rx="5" ry="6" fill="#333"/>
    <ellipse cx="69" cy="48" rx="5" ry="6" fill="#333"/>
    <circle cx="52" cy="46" r="2" fill="white"/>
    <circle cx="70" cy="46" r="2" fill="white"/>
    {/* ابتسامة */}
    <path d="M50 60 Q60 70 70 60" stroke="#333" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    {/* خمار/حجاب اختياري كتفاصيل */}
    {/* يدان */}
    <rect x="15" y="80" width="15" height="28" rx="7" fill={color}/>
    <rect x="90" y="80" width="15" height="28" rx="7" fill={color}/>
    {/* أرجل */}
    <rect x="35" y="120" width="16" height="20" rx="6" fill="#F48FB1"/>
    <rect x="69" y="120" width="16" height="20" rx="6" fill="#F48FB1"/>
  </svg>
);

// مسجد صغير
export const MosqueSvg: React.FC<SvgProps> = ({ size = 100 }) => (
  <svg width={size} height={size * 0.9} viewBox="0 0 100 90" fill="none">
    {/* بناء رئيسي */}
    <rect x="15" y="45" width="70" height="40" rx="4" fill="#80CBC4"/>
    {/* قبة رئيسية */}
    <ellipse cx="50" cy="45" rx="25" ry="22" fill="#4DB6AC"/>
    <rect x="25" y="44" width="50" height="5" fill="#80CBC4"/>
    {/* مئذنتان */}
    <rect x="5" y="20" width="12" height="65" rx="3" fill="#4DB6AC"/>
    <ellipse cx="11" cy="20" rx="6" ry="8" fill="#26A69A"/>
    <rect x="83" y="20" width="12" height="65" rx="3" fill="#4DB6AC"/>
    <ellipse cx="89" cy="20" rx="6" ry="8" fill="#26A69A"/>
    {/* باب */}
    <path d="M43 85 L43 62 Q50 56 57 62 L57 85 Z" fill="#00897B"/>
    {/* نوافذ */}
    <ellipse cx="30" cy="62" rx="6" ry="8" fill="#B2EBF2" stroke="#26A69A" strokeWidth="1"/>
    <ellipse cx="70" cy="62" rx="6" ry="8" fill="#B2EBF2" stroke="#26A69A" strokeWidth="1"/>
    {/* هلال */}
    <path d="M50 5 C46 5 43 8 44 12 C48 11 52 11 55 14 C56 10 53 5 50 5Z" fill="#FFD700"/>
  </svg>
);

// قطرة ماء الوضوء
export const WaterDropSvg: React.FC<SvgProps & { color?: string }> = ({ size = 80, color = '#2196F3' }) => (
  <svg width={size} height={size} viewBox="0 0 80 90" fill="none">
    <path d="M40 5 C40 5 10 40 10 58 C10 75 24 88 40 88 C56 88 70 75 70 58 C70 40 40 5 40 5Z" fill={color} opacity="0.85"/>
    <path d="M25 55 Q30 45 40 42" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
    <circle cx="50" cy="38" r="5" fill="white" opacity="0.3"/>
  </svg>
);

// قلب أخضر للقيم
export const ValueHeartSvg: React.FC<SvgProps & { color?: string }> = ({ size = 80, color = '#4CAF50' }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    <path d="M40 68 L10 38 C4 32 6 20 16 16 C24 13 32 18 40 28 C48 18 56 13 64 16 C74 20 76 32 70 38 Z" fill={color}/>
    <path d="M40 55 L18 37" stroke="white" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
  </svg>
);

// نجمة الإنجاز
export const AchievementStar: React.FC<SvgProps & { color?: string }> = ({ size = 70, color = '#FFD700' }) => (
  <svg width={size} height={size} viewBox="0 0 70 70" fill="none">
    <polygon points="35,5 42,25 63,25 47,38 53,58 35,46 17,58 23,38 7,25 28,25" fill={color}/>
    <polygon points="35,12 40,26 55,26 44,35 48,50 35,42 22,50 26,35 15,26 30,26" fill="white" opacity="0.2"/>
  </svg>
);

// شارة ذهبية
export const BadgeIcon: React.FC<SvgProps & { color?: string; icon?: string }> = ({ size = 72, color = '#FFD700', icon = '⭐' }) => (
  <div style={{ width: size, height: size, position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" style={{ position: 'absolute' }}>
      <circle cx="36" cy="36" r="34" fill={color} opacity="0.2"/>
      <circle cx="36" cy="36" r="28" fill={color} opacity="0.3"/>
      <circle cx="36" cy="36" r="22" fill={color}/>
      <circle cx="36" cy="36" r="20" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="4 3"/>
    </svg>
    <span style={{ fontSize: size * 0.35, position: 'relative', zIndex: 1, lineHeight: 1 }}>{icon}</span>
  </div>
);

// زخرفة إسلامية هندسية كخلفية
export const IslamicPatternBg: React.FC<{ width?: number; height?: number; color?: string; opacity?: number }> = ({
  width = 300, height = 200, color = '#4CAF50', opacity = 0.06,
}) => (
  <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    {Array.from({ length: Math.ceil(width / 60) }).map((_, xi) =>
      Array.from({ length: Math.ceil(height / 60) }).map((_, yi) => (
        <polygon
          key={`${xi}-${yi}`}
          points={`${xi * 60 + 30},${yi * 60 + 5} ${xi * 60 + 55},${yi * 60 + 20} ${xi * 60 + 55},${yi * 60 + 50} ${xi * 60 + 30},${yi * 60 + 65} ${xi * 60 + 5},${yi * 60 + 50} ${xi * 60 + 5},${yi * 60 + 20}`}
          stroke={color}
          strokeWidth="1"
          fill="none"
          opacity={opacity}
        />
      ))
    )}
  </svg>
);
