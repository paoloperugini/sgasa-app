export type DayOfWeek = 1 | 2 | 3 | 4 | 5; // 1 = Lun, 5 = Ven

export interface Profile {
  id: string; // Auth User UUID
  first_name: string;
  last_name: string;
  birth_date: string; // YYYY-MM-DD
  year_of_course: number; // 1 to 6
  channel: "A-L" | "M-Z";
  matricola?: string;
  football_role: "Portiere" | "Difensore" | "Centrocampista" | "Attaccante";
  football_rating: number; // 1-10
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserExam {
  id: string;
  user_id: string;
  subject: string;
  year_of_course: number;
  cfu: number;
  status: "Da preparare" | "In studio" | "Iscritto" | "Superato" | "Respinto";
  grade?: number | null; // 18-30
  honors?: boolean; // true per 30 e Lode
  date?: string | null; // YYYY-MM-DD
  time?: string | null;
  room?: string | null;
  session?: "Invernale" | "Estiva" | "Autunnale" | "Straordinaria" | null;
  exam_type?: "Scritto" | "Orale" | "Scritto + Orale" | "Progetto" | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OnlinePresenceUser {
  userId: string;
  name: string;
  year: number;
  channel: string;
  onlineAt: string;
}

export interface Student {
  id: string;
  name: string;
  nickname: string;
  matricola: string;
  course: string;
  email: string;
  role: "Presidente" | "Vicepresidente" | "Consigliere" | "Membro" | "Responsabile Calcetto";
  footballRole: "Portiere" | "Difensore" | "Centrocampista" | "Attaccante";
  footballRating: number; // 1-10 per auto-balancing
  avatar: string;
  accentColor?: string;
}

export interface Lesson {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string;   // "11:00"
  subject: string;
  professor: string;
  room: string;
  building: string;
  type: "Teoria" | "Esercitazione" | "Laboratorio";
  color?: string;
  notes?: string;
  date?: string; // "YYYY-MM-DD" o "DD/MM/YYYY"
  channel?: string; // "M-Z"
}

export interface Exam {
  id: string;
  subject: string;
  year_of_course?: number;
  is_idoneita?: boolean;
  date: string; // "YYYY-MM-DD"
  time: string; // "09:30"
  room: string;
  type: "Scritto" | "Orale" | "Scritto + Orale" | "Progetto";
  cfu: number;
  session: "Invernale" | "Estiva" | "Autunnale" | "Straordinaria";
  status: "Da preparare" | "In studio" | "Iscritto" | "Superato" | "Respinto";
  grade?: number; // 18-30 (31 per 30Lode)
  notes?: string;
}

export interface MatchAttendance {
  studentId: string;
  status: "present" | "maybe" | "absent";
  paid: boolean;
  updatedAt: string;
}

export interface FootballMatch {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "21:00"
  location: string;
  address: string;
  pitchCost: number; // e.g. 96.00
  targetPlayers: number; // 16 for 8vs8
  status: "convocazioni_aperte" | "squadre_generate" | "terminata";
  roster: MatchAttendance[];
  teamLight: {
    name: string;
    playerIds: string[];
  };
  teamDark: {
    name: string;
    playerIds: string[];
  };
  score?: {
    teamLight: number;
    teamDark: number;
  };
  mvp?: string;
  notes?: string;
}

export interface Notice {
  id: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  title: string;
  content: string;
  tag: "Urgente" | "Esami" | "Lezioni" | "Calciotto" | "Festa/Social" | "Generale" | "Studio";
  likes: number;
}

export interface BoardMessage {
  id: string;
  user_id: string;
  author_name: string;
  content: string;
  created_at: string;
}
