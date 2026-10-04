import { addPointsAndStars, markLessonComplete } from '../services/progressService'

/**
 * قيم المكافآت — مطابقة لما ورد في خطة المشروع (قسم Gamification):
 * إجابة صحيحة = +10، إنهاء درس/لعبة = +20 نقطة و+1 نجمة.
 */
export const POINTS_CORRECT_ANSWER = 10
export const POINTS_LESSON_COMPLETE = 20
export const STARS_LESSON_COMPLETE = 1

export async function awardCorrectAnswer(childId: number): Promise<void> {
  await addPointsAndStars(childId, POINTS_CORRECT_ANSWER, 0)
}

export async function awardLessonComplete(childId: number, lessonId: string): Promise<void> {
  await addPointsAndStars(childId, POINTS_LESSON_COMPLETE, STARS_LESSON_COMPLETE)
  await markLessonComplete(childId, lessonId)
}
