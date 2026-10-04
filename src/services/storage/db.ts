import Dexie, { type Table } from 'dexie'
import type { ChildProfile, SkillMastery, ActivityLogEntry, AppStateEntry } from '../../types/progress'

/**
 * طبقة التخزين المحلي.
 * ملاحظة معمارية: كل الوصول للبيانات يمر من هنا ومن progressService —
 * بحيث يمكن لاحقًا استبدال Dexie/IndexedDB بـ API حقيقي دون تعديل بقية التطبيق.
 */
class AppDatabase extends Dexie {
  children!: Table<ChildProfile, number>
  skillMastery!: Table<SkillMastery, number>
  activityLog!: Table<ActivityLogEntry, number>
  /** جدول عام لحالة التطبيق — يُستخدم حاليًا لتخزين هوية الطالب المسجّل دخوله. */
  appState!: Table<AppStateEntry, string>

  constructor() {
    super('arabic-kids-platform')
    this.version(1).stores({
      children: '++id, name',
      skillMastery: '++id, childId, skillId, [childId+skillId]',
      activityLog: '++id, childId, skillId, timestamp',
    })
    // v2: إضافة تسجيل دخول الطالب (يدعم أكثر من طفل على نفس الجهاز)
    this.version(2).stores({
      children: '++id, name',
      skillMastery: '++id, childId, skillId, [childId+skillId]',
      activityLog: '++id, childId, skillId, timestamp',
      appState: 'key',
    })
  }
}

export const db = new AppDatabase()
