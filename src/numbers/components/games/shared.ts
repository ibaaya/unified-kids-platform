
// أدوات مشتركة للألعاب: مكافأة نجمة + عبارات تشجيع (بدون عقاب)
import { useProgress } from "../../lib/progress";
export const r = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
export const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
export const uniq = (k: number, lo = 1, hi = 20) => shuffle(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)).slice(0, k);
export const useStar = () => { const [p, up] = useProgress(); return { p, star: () => up((s) => ({ ...s, stars: s.stars + 1 })) }; };
export const TRY = "اقْتَرَبْتَ! حَاوِلْ مَرَّةً أُخْرَى 😊";
