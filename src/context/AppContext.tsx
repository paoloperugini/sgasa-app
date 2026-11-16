"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { Student, Lesson, Exam, FootballMatch, Notice, Profile, UserExam, OnlinePresenceUser, BoardMessage } from "../lib/types";
import { supabase, syncFullOfficialCurriculum, resetToOfficialCurriculum } from "../lib/supabase";
import { storage } from "../lib/storage";
import { AuthScreen } from "../components/auth/AuthScreen";
import { OnboardingScreen } from "../components/auth/OnboardingScreen";

interface AppContextType {
  // Theme
  theme: "dark" | "light";
  toggleTheme: () => void;

  // Supabase Auth & Current Profile
  user: User | null;
  profile: Profile | null;
  profiles: Profile[];
  onlineUsers: OnlinePresenceUser[];
  isLoadingAuth: boolean;
  signOut: () => Promise<void>;
  refetchProfile: () => Promise<void>;
  updateCurrentProfile: (updates: Partial<Profile>) => Promise<boolean>;

  // Students (Membri)
  students: Student[];
  activeStudent: Student | null;

  // Lessons
  lessons: Lesson[];
  addLesson: (lesson: Omit<Lesson, "id">) => void;
  updateLesson: (lesson: Lesson) => void;
  deleteLesson: (id: string) => void;
  setAllLessons: (lessons: Lesson[]) => void;
  syncUnicattTimetable: () => Promise<{ success: boolean; count?: number; error?: string }>;
  isSyncing: boolean;
  lastSyncTime: string | null;

  // Supabase Personal Exams (Libretto)
  userExams: UserExam[];
  exams: Exam[];
  addExam: (exam: Omit<Exam, "id">) => Promise<void>;
  updateExam: (exam: Exam) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  refetchExams: () => Promise<void>;
  syncOfficialCurriculum: () => Promise<{ success: boolean; addedCount: number; error?: string }>;
  resetOfficialCurriculum: () => Promise<{ success: boolean; deletedCount: number; addedCount: number; error?: string }>;

  // Calciotto Matches
  matches: FootballMatch[];
  currentMatch: FootballMatch | null;
  updateAttendance: (matchId: string, studentId: string, status: "present" | "maybe" | "absent") => void;
  togglePayment: (matchId: string, studentId: string) => void;
  autoBalanceTeams: (matchId: string) => void;
  updateTeams: (matchId: string, teamLightPlayerIds: string[], teamDarkPlayerIds: string[]) => void;
  addMatch: (match: Omit<FootballMatch, "id">) => void;
  updateMatch: (match: FootballMatch) => void;

  // Supabase Board Messages (Bacheca condivisa in tempo reale)
  boardMessages: BoardMessage[];
  isLoadingBoard: boolean;
  addBoardMessage: (content: string) => Promise<{ success: boolean; error?: string }>;
  deleteBoardMessage: (id: string) => Promise<{ success: boolean; error?: string }>;
  fetchBoardMessages: () => Promise<void>;

  // Notices / Board (Legacy compatibility)
  notices: Notice[];
  addNotice: (notice: Omit<Notice, "id" | "createdAt" | "likes">) => void;
  likeNotice: (id: string) => void;

  // Reset
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function mapUserExamToExam(ue: UserExam): Exam {
  const isIdoneita = ue.cfu === 0 || (ue.notes && ue.notes.toLowerCase().includes("idoneit"));
  return {
    id: ue.id,
    subject: ue.subject,
    year_of_course: ue.year_of_course || 1,
    is_idoneita: Boolean(isIdoneita),
    date: ue.date || "",
    time: ue.time || "09:00",
    room: ue.room || "Aula Franceschini",
    type: ue.exam_type || "Scritto + Orale",
    cfu: ue.cfu !== undefined && ue.cfu !== null ? ue.cfu : 6,
    session: ue.session || "Invernale",
    status: ue.status,
    grade: ue.grade ? (ue.honors ? 31 : ue.grade) : undefined,
    notes: ue.notes || "",
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<"dark" | "light">("dark");

  // Supabase Auth & Profile State
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlinePresenceUser[]>([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Supabase User Exams (Libretto Personale)
  const [userExams, setUserExams] = useState<UserExam[]>([]);

  // Supabase Board Messages (Bacheca Condivisa)
  const [boardMessages, setBoardMessages] = useState<BoardMessage[]>([]);
  const [isLoadingBoard, setIsLoadingBoard] = useState(false);

  // Local state for lessons, matches
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [matches, setMatches] = useState<FootballMatch[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // --- THEME ---
  useEffect(() => {
    const loadedTheme = storage.getTheme();
    setThemeState(loadedTheme);
    if (loadedTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    storage.setTheme(next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  };

  // --- FETCH USER EXAMS ---
  const fetchUserExams = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_exams")
        .select("*")
        .eq("user_id", userId)
        .order("year_of_course", { ascending: true })
        .order("subject", { ascending: true });

      if (error) {
        console.error("Errore fetch user_exams da Supabase:", error);
        return;
      }

      if (data) {
        setUserExams(data as UserExam[]);
      }
    } catch (err) {
      console.error("Eccezione fetchUserExams:", err);
    }
  }, []);

  // --- FETCH ALL PROFILES (SHARED REALTIME LIST) ---
  const fetchProfiles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Errore fetch profiles da Supabase:", error);
        return;
      }

      if (data) {
        setProfiles(data as Profile[]);
      }
    } catch (err) {
      console.error("Eccezione fetchProfiles:", err);
    }
  }, []);

  // --- FETCH REALTIME BOARD MESSAGES ---
  const fetchBoardMessages = useCallback(async () => {
    try {
      setIsLoadingBoard(true);
      const { data, error } = await supabase
        .from("board_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Errore recupero messaggi bacheca da Supabase:", error);
        return;
      }

      if (data) {
        setBoardMessages(data as BoardMessage[]);
      }
    } catch (err) {
      console.error("Eccezione fetchBoardMessages:", err);
    } finally {
      setIsLoadingBoard(false);
    }
  }, []);

  // --- FETCH CURRENT USER PROFILE ---
  const fetchUserProfile = useCallback(async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Errore fetch profilo utente:", error);
      }

      if (data && data.first_name) {
        setProfile(data as Profile);
        setNeedsOnboarding(false);
        // Carica il libretto esami di questo utente e i messaggi in bacheca
        await Promise.all([fetchUserExams(currentUser.id), fetchBoardMessages()]);
      } else {
        // Nessun profilo trovato: richiede Onboarding!
        setProfile(null);
        setNeedsOnboarding(true);
        await fetchBoardMessages();
      }
    } catch (err) {
      console.error("Eccezione fetchUserProfile:", err);
      setNeedsOnboarding(true);
    }
  }, [fetchUserExams, fetchBoardMessages]);

  // --- SUPABASE AUTH LISTENER ---
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          setUser(session.user);
          await fetchUserProfile(session.user);
        } else if (mounted) {
          setUser(null);
          setProfile(null);
          setNeedsOnboarding(false);
        }
      } catch (err) {
        console.error("Errore recupero sessione Supabase:", err);
      } finally {
        if (mounted) {
          setIsLoadingAuth(false);
          setMounted(true);
        }
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setUserExams([]);
        setNeedsOnboarding(false);
      }
      setIsLoadingAuth(false);
    });

    // Carica gli altri dati ausiliari
    setLessons(storage.getLessons());
    setMatches(storage.getMatches());
    setLastSyncTime(storage.getLastSync());
    fetchProfiles();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, fetchProfiles]);

  // --- SUPABASE REALTIME PRESENCE ---
  useEffect(() => {
    if (!user || !profile) return;

    const presenceChannel = supabase.channel("sgasa-online-presence", {
      config: {
        presence: { key: user.id },
      },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState<{
          userId: string;
          name: string;
          year: number;
          channel: string;
          onlineAt: string;
        }>();

        const onlineList: OnlinePresenceUser[] = [];
        Object.keys(state).forEach((key) => {
          const presences = state[key];
          if (presences && presences.length > 0) {
            const p = presences[0];
            onlineList.push({
              userId: p.userId || key,
              name: p.name || "Studente",
              year: p.year || 3,
              channel: p.channel || "M-Z",
              onlineAt: p.onlineAt || new Date().toISOString(),
            });
          }
        });
        setOnlineUsers(onlineList);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            userId: user.id,
            name: `${profile.first_name} ${profile.last_name}`,
            year: profile.year_of_course,
            channel: profile.channel,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [user, profile]);

  // --- REALTIME SUBSCRIPTIONS (Profiles, User Exams & Board Messages) ---
  useEffect(() => {
    if (!user) return;

    const profilesSubscription = supabase
      .channel("realtime-profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchProfiles();
        }
      )
      .subscribe();

    const examsSubscription = supabase
      .channel("realtime-user-exams")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_exams",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUserExams(user.id);
        }
      )
      .subscribe();

    const boardSubscription = supabase
      .channel("realtime-board-messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "board_messages",
        },
        () => {
          fetchBoardMessages();
        }
      )
      .subscribe();

    return () => {
      profilesSubscription.unsubscribe();
      examsSubscription.unsubscribe();
      boardSubscription.unsubscribe();
    };
  }, [user, fetchProfiles, fetchUserExams, fetchBoardMessages]);

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setUserExams([]);
    setBoardMessages([]);
    setNeedsOnboarding(false);
  };

  const refetchProfile = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  const updateCurrentProfile = async (updates: Partial<Profile>): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("Errore aggiornamento profilo:", error);
        return false;
      }
      await fetchUserProfile(user);
      await fetchProfiles();
      return true;
    } catch (err) {
      console.error("Eccezione aggiornamento profilo:", err);
      return false;
    }
  };

  // Convert profile to activeStudent
  const activeStudent: Student | null = useMemo(() => {
    if (!profile) return null;
    return {
      id: profile.id,
      name: `${profile.first_name} ${profile.last_name}`,
      nickname: profile.first_name,
      matricola: profile.matricola || "N/A",
      course: `Medicina e Chirurgia (${profile.year_of_course}° Anno)`,
      email: user?.email || "",
      role: "Membro",
      footballRole: profile.football_role,
      footballRating: profile.football_rating,
      avatar:
        profile.avatar_url ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
          profile.first_name
        )}`,
      accentColor: "#f97316",
    };
  }, [profile, user]);

  // Convert profiles to students array
  const students: Student[] = useMemo(() => {
    if (profiles.length > 0) {
      return profiles.map((p) => ({
        id: p.id,
        name: `${p.first_name} ${p.last_name}`,
        nickname: p.first_name,
        matricola: p.matricola || "",
        course: `Medicina e Chirurgia (${p.year_of_course}° Anno)`,
        email: "", // Privacy: mai esporre email altrui
        role: "Membro",
        footballRole: p.football_role,
        footballRating: p.football_rating,
        avatar:
          p.avatar_url ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
            p.first_name
          )}`,
      }));
    }
    return [];
  }, [profiles]);

  // Mappa userExams to exams format
  const exams: Exam[] = useMemo(() => {
    return userExams.map(mapUserExamToExam);
  }, [userExams]);

  // Add exam to Supabase
  const addExam = async (newExam: Omit<Exam, "id">) => {
    if (!user) return;
    const honors = newExam.grade === 31;
    const grade = newExam.grade ? (newExam.grade === 31 ? 30 : newExam.grade) : null;

    try {
      const { data, error } = await supabase
        .from("user_exams")
        .insert({
          user_id: user.id,
          subject: newExam.subject,
          year_of_course: newExam.year_of_course || profile?.year_of_course || 1,
          cfu: newExam.cfu !== undefined && newExam.cfu !== null ? newExam.cfu : 6,
          status: newExam.status,
          grade: grade,
          honors: honors,
          date: newExam.date || null,
          time: newExam.time || "09:00",
          room: newExam.room || "Aula Franceschini",
          session: newExam.session || "Invernale",
          exam_type: newExam.type || "Scritto + Orale",
          notes: newExam.notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Errore inserimento esame in Supabase:", error);
        return;
      }

      if (data) {
        setUserExams((prev) => [data as UserExam, ...prev]);
      }
    } catch (err) {
      console.error("Eccezione addExam:", err);
    }
  };

  // Update exam in Supabase
  const updateExam = async (exam: Exam) => {
    if (!user) return;
    const honors = exam.grade === 31;
    const grade = exam.grade ? (exam.grade === 31 ? 30 : exam.grade) : null;

    try {
      const { error } = await supabase
        .from("user_exams")
        .update({
          subject: exam.subject,
          year_of_course: exam.year_of_course,
          cfu: exam.cfu,
          status: exam.status,
          grade: grade,
          honors: honors,
          date: exam.date || null,
          time: exam.time,
          room: exam.room,
          session: exam.session,
          exam_type: exam.type,
          notes: exam.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", exam.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Errore aggiornamento esame su Supabase:", error);
        return;
      }

      setUserExams((prev) =>
        prev.map((ue) =>
          ue.id === exam.id
            ? {
                ...ue,
                subject: exam.subject,
                year_of_course: exam.year_of_course || ue.year_of_course,
                cfu: exam.cfu !== undefined ? exam.cfu : ue.cfu,
                status: exam.status,
                grade: grade,
                honors: honors,
                date: exam.date || null,
                time: exam.time,
                room: exam.room,
                session: exam.session,
                exam_type: exam.type,
                notes: exam.notes || null,
              }
            : ue
        )
      );
    } catch (err) {
      console.error("Eccezione updateExam:", err);
    }
  };

  // Delete exam in Supabase
  const deleteExam = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("user_exams")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Errore cancellazione esame da Supabase:", error);
        return;
      }

      setUserExams((prev) => prev.filter((ue) => ue.id !== id));
    } catch (err) {
      console.error("Eccezione deleteExam:", err);
    }
  };

  const refetchExams = async () => {
    if (user) {
      await fetchUserExams(user.id);
    }
  };

  const syncOfficialCurriculum = async (): Promise<{ success: boolean; addedCount: number; error?: string }> => {
    if (!user) return { success: false, addedCount: 0, error: "Utente non autenticato" };
    const res = await syncFullOfficialCurriculum(user.id);
    if (res.success) {
      await fetchUserExams(user.id);
    }
    return res;
  };

  const resetOfficialCurriculum = async (): Promise<{ success: boolean; deletedCount: number; addedCount: number; error?: string }> => {
    if (!user) return { success: false, deletedCount: 0, addedCount: 0, error: "Utente non autenticato" };
    const res = await resetToOfficialCurriculum(user.id);
    if (res.success) {
      await fetchUserExams(user.id);
    }
    return res;
  };

  // Lessons
  const addLesson = (newLesson: Omit<Lesson, "id">) => {
    const lesson: Lesson = { ...newLesson, id: `les-${Date.now()}` };
    const updated = [...lessons, lesson];
    setLessons(updated);
    storage.setLessons(updated);
  };

  const updateLesson = (updatedLesson: Lesson) => {
    const updated = lessons.map((l) => (l.id === updatedLesson.id ? updatedLesson : l));
    setLessons(updated);
    storage.setLessons(updated);
  };

  const deleteLesson = (id: string) => {
    const updated = lessons.filter((l) => l.id !== id);
    setLessons(updated);
    storage.setLessons(updated);
  };

  const setAllLessons = (newLessons: Lesson[]) => {
    setLessons(newLessons);
    storage.setLessons(newLessons);
  };

  const syncUnicattTimetable = async (): Promise<{
    success: boolean;
    count?: number;
    error?: string;
  }> => {
    setIsSyncing(true);
    try {
      const channelParam = profile?.channel || "M-Z";
      const yearParam = profile?.year_of_course?.toString() || "3";
      const res = await fetch(
        `/api/sync-orario?canale=${encodeURIComponent(channelParam)}&annoDiCorso=${encodeURIComponent(
          yearParam
        )}`
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Errore durante la sincronizzazione con Unicatt");
      }
      if (Array.isArray(data.lessons) && data.lessons.length > 0) {
        setAllLessons(data.lessons);
        const syncTimestamp = new Date().toISOString();
        setLastSyncTime(syncTimestamp);
        storage.setLastSync(syncTimestamp);
        return { success: true, count: data.lessons.length };
      } else {
        return {
          success: false,
          error: "Nessuna lezione trovata per il Canale selezionato nel calendario Unicatt.",
        };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Errore di connessione durante la sincronizzazione.",
      };
    } finally {
      setIsSyncing(false);
    }
  };

  // Matches
  const currentMatch = useMemo(() => matches[0] || null, [matches]);

  const updateAttendance = (
    matchId: string,
    studentId: string,
    status: "present" | "maybe" | "absent"
  ) => {
    const updated = matches.map((m) => {
      if (m.id !== matchId) return m;
      const existing = m.roster.find((r) => r.studentId === studentId);
      let newRoster = [...m.roster];
      if (existing) {
        newRoster = newRoster.map((r) =>
          r.studentId === studentId
            ? { ...r, status, updatedAt: new Date().toISOString() }
            : r
        );
      } else {
        newRoster.push({
          studentId,
          status,
          paid: false,
          updatedAt: new Date().toISOString(),
        });
      }
      return { ...m, roster: newRoster };
    });
    setMatches(updated);
    storage.setMatches(updated);
  };

  const togglePayment = (matchId: string, studentId: string) => {
    const updated = matches.map((m) => {
      if (m.id !== matchId) return m;
      const newRoster = m.roster.map((r) =>
        r.studentId === studentId ? { ...r, paid: !r.paid } : r
      );
      return { ...m, roster: newRoster };
    });
    setMatches(updated);
    storage.setMatches(updated);
  };

  const autoBalanceTeams = (matchId: string) => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    const presentStudentIds = targetMatch.roster
      .filter((r) => r.status === "present")
      .map((r) => r.studentId);

    const presentStudents = presentStudentIds
      .map((id) => students.find((s) => s.id === id))
      .filter((s): s is Student => Boolean(s));

    const goalkeepers = presentStudents.filter((s) => s.footballRole === "Portiere");
    const defenders = presentStudents.filter((s) => s.footballRole === "Difensore");
    const midfielders = presentStudents.filter((s) => s.footballRole === "Centrocampista");
    const attackers = presentStudents.filter((s) => s.footballRole === "Attaccante");

    const teamLightIds: string[] = [];
    const teamDarkIds: string[] = [];

    const distribute = (group: Student[]) => {
      const sorted = [...group].sort((a, b) => b.footballRating - a.footballRating);
      sorted.forEach((p, idx) => {
        if (idx % 2 === 0) {
          if (teamLightIds.length <= teamDarkIds.length) teamLightIds.push(p.id);
          else teamDarkIds.push(p.id);
        } else {
          if (teamDarkIds.length < teamLightIds.length) teamDarkIds.push(p.id);
          else teamLightIds.push(p.id);
        }
      });
    };

    distribute(goalkeepers);
    distribute(defenders);
    distribute(midfielders);
    distribute(attackers);

    const updated = matches.map((m) => {
      if (m.id !== matchId) return m;
      return {
        ...m,
        status: "squadre_generate" as const,
        teamLight: { ...m.teamLight, playerIds: teamLightIds },
        teamDark: { ...m.teamDark, playerIds: teamDarkIds },
      };
    });

    setMatches(updated);
    storage.setMatches(updated);
  };

  const updateTeams = (
    matchId: string,
    teamLightPlayerIds: string[],
    teamDarkPlayerIds: string[]
  ) => {
    const updated = matches.map((m) => {
      if (m.id !== matchId) return m;
      return {
        ...m,
        teamLight: { ...m.teamLight, playerIds: teamLightPlayerIds },
        teamDark: { ...m.teamDark, playerIds: teamDarkPlayerIds },
      };
    });
    setMatches(updated);
    storage.setMatches(updated);
  };

  const addMatch = (newMatch: Omit<FootballMatch, "id">) => {
    const match: FootballMatch = { ...newMatch, id: `match-${Date.now()}` };
    const updated = [match, ...matches];
    setMatches(updated);
    storage.setMatches(updated);
  };

  const updateMatch = (updatedMatch: FootballMatch) => {
    const updated = matches.map((m) => (m.id === updatedMatch.id ? updatedMatch : m));
    setMatches(updated);
    storage.setMatches(updated);
  };

  // --- SUPABASE BOARD MESSAGES (BACHECA CONDIVISA IN TEMPO REALE) ---
  const addBoardMessage = async (content: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "Devi essere autenticato per scrivere in bacheca." };
    }

    const cleanContent = content.trim();
    if (!cleanContent) {
      return { success: false, error: "Il testo del messaggio non può essere vuoto." };
    }

    // Nome reale dal profilo dell'utente autenticato
    const realAuthorName = profile
      ? `${profile.first_name} ${profile.last_name}`.trim()
      : (user.user_metadata?.full_name || user.email?.split("@")[0] || "Membro SGASA");

    try {
      const { data, error } = await supabase
        .from("board_messages")
        .insert({
          user_id: user.id,
          author_name: realAuthorName,
          content: cleanContent,
        })
        .select()
        .single();

      if (error) {
        console.error("Errore pubblicazione messaggio bacheca:", error);
        return { success: false, error: error.message };
      }

      if (data) {
        setBoardMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [data as BoardMessage, ...prev];
        });
      }

      return { success: true };
    } catch (err: any) {
      console.error("Eccezione addBoardMessage:", err);
      return { success: false, error: err?.message || "Errore sconosciuto" };
    }
  };

  const deleteBoardMessage = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "Devi essere autenticato per eliminare un messaggio." };
    }

    try {
      const { error } = await supabase
        .from("board_messages")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Errore cancellazione messaggio bacheca:", error);
        return { success: false, error: error.message };
      }

      setBoardMessages((prev) => prev.filter((m) => m.id !== id));
      return { success: true };
    } catch (err: any) {
      console.error("Eccezione deleteBoardMessage:", err);
      return { success: false, error: err?.message || "Errore sconosciuto" };
    }
  };

  // Notices (Compatibilità legacy derivata dai messaggi reali di Supabase)
  const notices: Notice[] = useMemo(() => {
    return boardMessages.map((bm) => ({
      id: bm.id,
      authorId: bm.user_id,
      authorName: bm.author_name,
      createdAt: bm.created_at,
      title: bm.content.length > 50 ? bm.content.slice(0, 47) + "..." : bm.content,
      content: bm.content,
      tag: "Generale" as const,
      likes: 0,
    }));
  }, [boardMessages]);

  const addNotice = (newNotice: Omit<Notice, "id" | "createdAt" | "likes">) => {
    const text = newNotice.title && newNotice.title !== newNotice.content
      ? `${newNotice.title}\n\n${newNotice.content}`
      : newNotice.content;
    addBoardMessage(text);
  };

  const likeNotice = (_id: string) => {
    // No-op per compatibilità
  };

  const resetData = () => {
    storage.resetAll();
    setLessons(storage.getLessons());
    setMatches(storage.getMatches());
  };

  // RENDER GATING (Loading / Auth / Onboarding / App)
  if (!mounted || isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-zinc-400">
            Connessione a S.G.A.S.A. & Supabase in corso...
          </p>
        </div>
      </div>
    );
  }

  // Se l'utente non è loggato, mostra la schermata di Login / Registrazione
  if (!user) {
    return <AuthScreen onSuccess={() => {}} />;
  }

  // Se l'utente è loggato ma non ha ancora completato l'onboarding iniziale del profilo
  if (needsOnboarding) {
    return (
      <OnboardingScreen
        userId={user.id}
        userEmail={user.email || ""}
        onCompleted={async () => {
          await fetchUserProfile(user);
          await fetchProfiles();
        }}
      />
    );
  }

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        profile,
        profiles,
        onlineUsers,
        isLoadingAuth,
        signOut,
        refetchProfile,
        updateCurrentProfile,
        students,
        activeStudent,
        lessons,
        addLesson,
        updateLesson,
        deleteLesson,
        setAllLessons,
        syncUnicattTimetable,
        isSyncing,
        lastSyncTime,
        userExams,
        exams,
        addExam,
        updateExam,
        deleteExam,
        refetchExams,
        syncOfficialCurriculum,
        resetOfficialCurriculum,
        matches,
        currentMatch,
        updateAttendance,
        togglePayment,
        autoBalanceTeams,
        updateTeams,
        addMatch,
        updateMatch,
        boardMessages,
        isLoadingBoard,
        addBoardMessage,
        deleteBoardMessage,
        fetchBoardMessages,
        notices,
        addNotice,
        likeNotice,
        resetData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
