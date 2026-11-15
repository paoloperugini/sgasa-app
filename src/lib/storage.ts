import { Student, Lesson, Exam, FootballMatch, Notice } from "./types";
import { initialStudents, initialLessons, initialExams, initialMatch, pastMatches, initialNotices } from "./mockData";

const STORAGE_KEYS = {
  STUDENTS: "sgasa_students_v1",
  LESSONS: "sgasa_lessons_v1",
  EXAMS: "sgasa_exams_v1",
  MATCHES: "sgasa_matches_v1",
  NOTICES: "sgasa_notices_v1",
  ACTIVE_STUDENT: "sgasa_active_student_v1",
  THEME: "sgasa_theme_v1",
  LAST_SYNC: "sgasa_last_sync_v1",
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch (err) {
    console.error(`Errore lettura localStorage per chiave ${key}:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Errore scrittura localStorage per chiave ${key}:`, err);
  }
}

export const storage = {
  getStudents: (): Student[] => safeGet(STORAGE_KEYS.STUDENTS, initialStudents),
  setStudents: (data: Student[]) => safeSet(STORAGE_KEYS.STUDENTS, data),

  getLessons: (): Lesson[] => safeGet(STORAGE_KEYS.LESSONS, initialLessons),
  setLessons: (data: Lesson[]) => safeSet(STORAGE_KEYS.LESSONS, data),

  getExams: (): Exam[] => safeGet(STORAGE_KEYS.EXAMS, initialExams),
  setExams: (data: Exam[]) => safeSet(STORAGE_KEYS.EXAMS, data),

  getMatches: (): FootballMatch[] => safeGet(STORAGE_KEYS.MATCHES, [initialMatch, ...pastMatches]),
  setMatches: (data: FootballMatch[]) => safeSet(STORAGE_KEYS.MATCHES, data),

  getNotices: (): Notice[] => safeGet(STORAGE_KEYS.NOTICES, initialNotices),
  setNotices: (data: Notice[]) => safeSet(STORAGE_KEYS.NOTICES, data),

  getActiveStudentId: (): string => safeGet(STORAGE_KEYS.ACTIVE_STUDENT, initialStudents[0].id),
  setActiveStudentId: (id: string) => safeSet(STORAGE_KEYS.ACTIVE_STUDENT, id),

  getTheme: (): "dark" | "light" => safeGet(STORAGE_KEYS.THEME, "dark"),
  setTheme: (theme: "dark" | "light") => safeSet(STORAGE_KEYS.THEME, theme),

  getLastSync: (): string | null => safeGet(STORAGE_KEYS.LAST_SYNC, null),
  setLastSync: (time: string | null) => safeSet(STORAGE_KEYS.LAST_SYNC, time),

  resetAll: () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    window.localStorage.removeItem(STORAGE_KEYS.LESSONS);
    window.localStorage.removeItem(STORAGE_KEYS.EXAMS);
    window.localStorage.removeItem(STORAGE_KEYS.MATCHES);
    window.localStorage.removeItem(STORAGE_KEYS.NOTICES);
    window.localStorage.removeItem(STORAGE_KEYS.ACTIVE_STUDENT);
    window.localStorage.removeItem(STORAGE_KEYS.THEME);
    window.localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
  },
};
