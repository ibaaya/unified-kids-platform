export type Stars = 0 | 1 | 2 | 3;

/** 90%+ = 3 نجوم، 70%+ = نجمتان، وإلا نجمة (من يُكمل المستوى ينال نجمة على الأقل) */
export function scoreToStars(score: number): Stars {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  return 1;
}
