import { createClient } from "@supabase/supabase-js";
import { UserExam } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://boeqzwsaofdworzmyqao.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_HtUeG1fdnoMPqu4v6_5PjQ_Ufb50B2Q";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// ========================================================
// PIANO DI STUDI UFFICIALE MEDICINA E CHIRURGIA (1° - 6° ANNO)
// Università Cattolica del Sacro Cuore - Sede di Roma (Gemelli)
// ========================================================
export interface OfficialCourseTemplate {
  subject: string;
  year_of_course: number;
  cfu: number;
  is_idoneita?: boolean;
  exam_type: "Scritto" | "Orale" | "Scritto + Orale" | "Progetto";
}

export const UNICATT_MEDICINA_CURRICULUM: OfficialCourseTemplate[] = [
  // --- PRIMO ANNO ---
  { subject: "Anatomia Umana 1", year_of_course: 1, cfu: 4, exam_type: "Scritto + Orale" },
  { subject: "Biochimica e Biologia Molecolare", year_of_course: 1, cfu: 9, exam_type: "Scritto + Orale" },
  { subject: "Biologia", year_of_course: 1, cfu: 6, exam_type: "Scritto + Orale" },
  { subject: "Chimica e Propedeutica Biochimica", year_of_course: 1, cfu: 7, exam_type: "Scritto + Orale" },
  { subject: "Fisica Medica Applicata", year_of_course: 1, cfu: 7, exam_type: "Scritto" },
  { subject: "Istologia", year_of_course: 1, cfu: 8, exam_type: "Scritto + Orale" },
  { subject: "Lingua Inglese", year_of_course: 1, cfu: 6, exam_type: "Scritto" },
  { subject: "Scienze Umane", year_of_course: 1, cfu: 4, exam_type: "Orale" },
  { subject: "Teologia 1 - Questioni Fondamentali: la Fede Cristologica e la Sacra Scrittura", year_of_course: 1, cfu: 0, is_idoneita: true, exam_type: "Orale" },

  // --- SECONDO ANNO ---
  { subject: "Anatomia Umana 2", year_of_course: 2, cfu: 12, exam_type: "Scritto + Orale" },
  { subject: "Fisiologia", year_of_course: 2, cfu: 19, exam_type: "Scritto + Orale" },
  { subject: "Genetica Umana", year_of_course: 2, cfu: 3, exam_type: "Scritto + Orale" },
  { subject: "Microbiologia Generale", year_of_course: 2, cfu: 9, exam_type: "Scritto + Orale" },
  { subject: "Patologia e Fisiopatologia Generale 1", year_of_course: 2, cfu: 4, exam_type: "Scritto + Orale" },
  { subject: "Teologia 2 - Questioni di Antropologia Teologica ed Ecclesiologia", year_of_course: 2, cfu: 0, is_idoneita: true, exam_type: "Orale" },

  // --- TERZO ANNO ---
  { subject: "Anatomia Patologica 1", year_of_course: 3, cfu: 4, exam_type: "Scritto + Orale" },
  { subject: "Competenze di Comunicazione in Medicina", year_of_course: 3, cfu: 1, exam_type: "Orale" },
  { subject: "Farmacologia Generale", year_of_course: 3, cfu: 4, exam_type: "Scritto + Orale" },
  { subject: "Malattie Endocrino Metaboliche", year_of_course: 3, cfu: 7, exam_type: "Scritto + Orale" },
  { subject: "Malattie Infettive", year_of_course: 3, cfu: 4, exam_type: "Scritto + Orale" },
  { subject: "Metodologia e Semeiotica Clinica", year_of_course: 3, cfu: 12, exam_type: "Orale" },
  { subject: "Patologia Clinica", year_of_course: 3, cfu: 7, exam_type: "Scritto + Orale" },
  { subject: "Patologia e Fisiopatologia Generale 2", year_of_course: 3, cfu: 14, exam_type: "Scritto + Orale" },
  { subject: "Teologia 3 - Questioni Teologiche di Etica e Morale Cristiana", year_of_course: 3, cfu: 0, is_idoneita: true, exam_type: "Orale" },
  { subject: "Writing for Medical and Scientific Journals", year_of_course: 3, cfu: 2, exam_type: "Scritto" },

  // --- QUARTO ANNO ---
  { subject: "Anatomia Patologica 2", year_of_course: 4, cfu: 5, exam_type: "Scritto + Orale" },
  { subject: "Attività Professionalizzante", year_of_course: 4, cfu: 7, exam_type: "Progetto" },
  { subject: "Diagnostica per Immagini e Radioterapia", year_of_course: 4, cfu: 5, exam_type: "Scritto + Orale" },
  { subject: "Neurologia, Psichiatria e Psicologia Clinica", year_of_course: 4, cfu: 13, exam_type: "Scritto + Orale" },
  { subject: "Patologia e Sistematica Cardiovascolare", year_of_course: 4, cfu: 6, exam_type: "Scritto + Orale" },
  { subject: "Patologia e Sistematica del Torace", year_of_course: 4, cfu: 7, exam_type: "Scritto + Orale" },
  { subject: "Patologia e Sistematica dell'Addome", year_of_course: 4, cfu: 11, exam_type: "Scritto + Orale" },
  { subject: "Seminario di Teologia", year_of_course: 4, cfu: 0, is_idoneita: true, exam_type: "Orale" },

  // --- QUINTO ANNO ---
  { subject: "Emergenze Medico-Chirurgiche", year_of_course: 5, cfu: 7, exam_type: "Scritto + Orale" },
  { subject: "Igiene, Sanità Pubblica, Management Sanitario", year_of_course: 5, cfu: 9, exam_type: "Scritto + Orale" },
  { subject: "Malattie del Sangue", year_of_course: 5, cfu: 7, exam_type: "Scritto + Orale" },
  { subject: "Malattie dell'Apparato Locomotore", year_of_course: 5, cfu: 6, exam_type: "Scritto + Orale" },
  { subject: "Medicina Legale e del Lavoro", year_of_course: 5, cfu: 5, exam_type: "Orale" },
  { subject: "Oncologia Clinica", year_of_course: 5, cfu: 11, exam_type: "Scritto + Orale" },
  { subject: "Patologia Testa Collo e Organi di Senso", year_of_course: 5, cfu: 7, exam_type: "Scritto + Orale" },
  { subject: "Reumatologia, Immunologia Clinica, Nefrologia e Dermatologia", year_of_course: 5, cfu: 13, exam_type: "Scritto + Orale" },

  // --- SESTO ANNO ---
  { subject: "Clinica Chirurgica", year_of_course: 6, cfu: 6, exam_type: "Orale" },
  { subject: "Clinica Medica", year_of_course: 6, cfu: 11, exam_type: "Orale" },
  { subject: "Ginecologia e Ostetricia", year_of_course: 6, cfu: 11, exam_type: "Scritto + Orale" },
  { subject: "Pediatria Generale e Specialistica", year_of_course: 6, cfu: 11, exam_type: "Scritto + Orale" },
  { subject: "Tirocinio Pratico-Valutativo", year_of_course: 6, cfu: 15, exam_type: "Progetto" },
  { subject: "Prova Finale", year_of_course: 6, cfu: 18, exam_type: "Orale" },
];

/** Totale CFU ufficiali del piano di studi */
export const TOTAL_CURRICULUM_CFU = UNICATT_MEDICINA_CURRICULUM.reduce((sum, c) => sum + c.cfu, 0);

/**
 * Sincronizza l'intero piano di studi (1° - 6° Anno) per un utente:
 * Inserisce tutti gli insegnamenti mancanti SENZA duplicare né cancellare
 * quelli già presenti o già verbalizzati.
 */
export async function syncFullOfficialCurriculum(userId: string): Promise<{ success: boolean; addedCount: number; error?: string }> {
  try {
    // 1. Recupera gli esami già presenti per l'utente
    const { data: existingExams, error: fetchError } = await supabase
      .from("user_exams")
      .select("subject")
      .eq("user_id", userId);

    if (fetchError) {
      console.error("Errore fetch esami esistenti:", fetchError);
      return { success: false, addedCount: 0, error: fetchError.message };
    }

    const existingNames = new Set((existingExams || []).map((e) => e.subject.toLowerCase().trim()));

    // 2. Trova gli insegnamenti mancanti
    const missingCourses = UNICATT_MEDICINA_CURRICULUM.filter(
      (c) => !existingNames.has(c.subject.toLowerCase().trim())
    );

    if (missingCourses.length === 0) {
      return { success: true, addedCount: 0 };
    }

    // 3. Prepara il payload degli esami mancanti
    const payload = missingCourses.map((c) => ({
      user_id: userId,
      subject: c.subject,
      year_of_course: c.year_of_course,
      cfu: c.cfu,
      status: "Da preparare",
      grade: null,
      honors: false,
      date: null,
      time: "09:00",
      room: "Aula Franceschini (Gemelli)",
      session: "Invernale",
      exam_type: c.exam_type,
      notes: c.is_idoneita ? "Idoneità (0 CFU)" : "Insegnamento ufficiale Medicina Unicatt Roma",
    }));

    const { error: insertError } = await supabase.from("user_exams").insert(payload);

    if (insertError) {
      console.error("Errore inserimento esami mancanti:", insertError);
      return { success: false, addedCount: 0, error: insertError.message };
    }

    return { success: true, addedCount: missingCourses.length };
  } catch (err: any) {
    console.error("Eccezione durante la sincronizzazione del piano di studi:", err);
    return { success: false, addedCount: 0, error: err?.message || "Errore sconosciuto" };
  }
}

/** Pre-popola all'onboarding l'intero piano di studi (1°-6° anno) */
export async function seedUserExamsForYear(userId: string, _yearOfCourse?: number): Promise<boolean> {
  const result = await syncFullOfficialCurriculum(userId);
  return result.success;
}

/**
 * Ripristina il libretto dell'utente al Piano di Studi Ufficiale Unicatt (1° - 6° Anno):
 * 1. Recupera tutti gli esami attualmente presenti in user_exams per l'utente.
 * 2. Riconosce ed elimina dal database tutti gli esami che NON appartengono al piano ufficiale (esami vecchi, di prova o generici).
 * 3. Mantiene intatti tutti gli esami ufficiali già presenti nel libretto, preservando voti, lodi, date e note.
 * 4. Inserisce gli eventuali esami del piano ufficiale mancanti (1°-6° Anno).
 * 5. Risultato: il libretto conterrà solo ed esclusivamente i 40 insegnamenti ufficiali Medicina Unicatt Roma.
 */
export async function resetToOfficialCurriculum(userId: string): Promise<{
  success: boolean;
  deletedCount: number;
  addedCount: number;
  error?: string;
}> {
  try {
    // 1. Recupera gli esami attuali dell'utente
    const { data: userExams, error: fetchError } = await supabase
      .from("user_exams")
      .select("*")
      .eq("user_id", userId);

    if (fetchError) {
      console.error("Errore recupero esami per reset:", fetchError);
      return { success: false, deletedCount: 0, addedCount: 0, error: fetchError.message };
    }

    const currentExams = userExams || [];

    // Mappa con i nomi normalizzati del piano ufficiale
    const officialNamesMap = new Map<string, OfficialCourseTemplate>();
    UNICATT_MEDICINA_CURRICULUM.forEach((c) => {
      officialNamesMap.set(c.subject.trim().toLowerCase(), c);
    });

    // 2. Identifica esami da eliminare (tutti quelli non presenti nel piano ufficiale)
    const idsToDelete: string[] = [];
    const existingOfficialSubjects = new Set<string>();

    for (const exam of currentExams) {
      const normalized = (exam.subject || "").trim().toLowerCase();
      if (!officialNamesMap.has(normalized)) {
        idsToDelete.push(exam.id);
      } else {
        existingOfficialSubjects.add(normalized);
      }
    }

    // Esegui la cancellazione degli esami obsoleti
    let deletedCount = 0;
    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("user_exams")
        .delete()
        .in("id", idsToDelete)
        .eq("user_id", userId);

      if (deleteError) {
        console.error("Errore cancellazione esami obsoleti:", deleteError);
        return { success: false, deletedCount: 0, addedCount: 0, error: deleteError.message };
      }
      deletedCount = idsToDelete.length;
    }

    // 3. Inserisci gli esami ufficiali mancanti
    const missingCourses = UNICATT_MEDICINA_CURRICULUM.filter(
      (c) => !existingOfficialSubjects.has(c.subject.trim().toLowerCase())
    );

    let addedCount = 0;
    if (missingCourses.length > 0) {
      const payload = missingCourses.map((c) => ({
        user_id: userId,
        subject: c.subject,
        year_of_course: c.year_of_course,
        cfu: c.cfu,
        status: "Da preparare",
        grade: null,
        honors: false,
        date: null,
        time: "09:00",
        room: "Aula Franceschini (Gemelli)",
        session: "Invernale",
        exam_type: c.exam_type,
        notes: c.is_idoneita ? "Idoneità (0 CFU)" : "Insegnamento ufficiale Medicina Unicatt Roma",
      }));

      const { error: insertError } = await supabase.from("user_exams").insert(payload);

      if (insertError) {
        console.error("Errore inserimento esami mancanti durante reset:", insertError);
        return { success: false, deletedCount, addedCount: 0, error: insertError.message };
      }
      addedCount = missingCourses.length;
    }

    return { success: true, deletedCount, addedCount };
  } catch (err: any) {
    console.error("Eccezione durante reset al piano ufficiale:", err);
    return { success: false, deletedCount: 0, addedCount: 0, error: err?.message || "Errore sconosciuto" };
  }
}
