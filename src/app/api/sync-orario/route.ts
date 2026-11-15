import { NextRequest, NextResponse } from "next/server";
import { Lesson, DayOfWeek } from "@/lib/types";

interface UnicattLessonItem {
  idLezione?: number;
  idCalendarioAula?: number;
  dataEvento: string; // "DD/MM/YYYY"
  oraInizio: string;  // "08:30"
  oraFine: string;    // "10:45"
  durata?: string;
  codiceInsegnamento?: string;
  descrizioneInsegnamento: string;
  docente: string;
  descrizioneAula: string;
  pianoAula?: string;
  codiceEdificio?: string;
  descrizioneEdificio?: string;
  note?: string;
  flagEsercitazione?: boolean;
  flagStraordinario?: boolean;
  flagCambioAula?: boolean;
  flagSospensione?: boolean;
}

interface UnicattApiResponse {
  corsoDiLaurea?: {
    codice?: string;
    descrizione?: string;
    descrizioneFacolta?: string;
  };
  lezioniCalendario?: Record<string, UnicattLessonItem[]>;
}

function isCanaleMZ(note?: string | null): boolean {
  if (!note) return false;
  const n = note.trim().toUpperCase();
  return (
    n.includes("M-Z") ||
    n.includes("M - Z") ||
    n.includes("CANALE 2") ||
    n.includes("2 CANALE") ||
    n === "CANALE 2" ||
    n === "2 CANALE"
  );
}

function formatTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace(/\bIi\b/g, "II")
    .replace(/\bIii\b/g, "III")
    .replace(/\bIv\b/g, "IV")
    .replace(/\bSql\b/g, "SQL");
}

function formatProfessor(name: string): string {
  if (!name) return "Docente da assegnare";
  return `Prof. ${formatTitleCase(name)}`;
}

export async function GET(req: NextRequest) {
  return handleSync(req);
}

export async function POST(req: NextRequest) {
  return handleSync(req);
}

async function handleSync(req: NextRequest) {
  const url = new URL(req.url);

  // Parameters from the user request link:
  // https://roma.unicatt.it/polo-studenti-e-didattica-programmi-dei-corsi-e-orari-delle-lezioni/RM/calendario-lezioni?anno=2026&tipo=CDL&codFacolta=75012&codCdl=0E8C&annoDiCorso=3
  const anno = url.searchParams.get("anno") || "2026";
  const codFacolta = url.searchParams.get("codFacolta") || "75012";
  const codCdl = url.searchParams.get("codCdl") || "0E8C";
  const annoDiCorso = url.searchParams.get("annoDiCorso") || "3";
  const canaleFilter = (url.searchParams.get("canale") || "M-Z").toUpperCase();

  const unicattApiUrl = "https://secure.unicatt.it/didatticaweb2/ps/lezioni/";

  const payload = {
    codiceSede: "RM",
    annoAccademico: anno,
    codiceFacolta: codFacolta,
    codiceCorsoDiLaurea: codCdl,
    annoDiCorso: annoDiCorso,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(unicattApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://roma.unicatt.it/",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server Unicatt ha risposto con codice HTTP ${response.status}`);
    }

    const data: UnicattApiResponse = await response.json();

    if (!data || !data.lezioniCalendario) {
      return NextResponse.json(
        {
          success: false,
          error: "Nessun calendario lezioni trovato per i parametri specificati.",
        },
        { status: 404 }
      );
    }

    const importedLessons: Lesson[] = [];
    let totalFoundInCalendar = 0;
    let totalMZMatched = 0;

    const calendar = data.lezioniCalendario;
    const sortedDates = Object.keys(calendar).sort((a, b) => {
      const [da, ma, ya] = a.split("/").map(Number);
      const [db, mb, yb] = b.split("/").map(Number);
      return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
    });

    for (const dateStr of sortedDates) {
      const rawLessons = calendar[dateStr] || [];
      const [d, m, y] = dateStr.split("/").map(Number);
      const dateObj = new Date(y, m - 1, d);
      const isoDate = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

      let dayOfWeek = dateObj.getDay();
      if (dayOfWeek === 0) dayOfWeek = 7; // Sunday

      // Only Monday to Friday (1 to 5)
      if (dayOfWeek < 1 || dayOfWeek > 5) continue;

      for (const raw of rawLessons) {
        totalFoundInCalendar++;

        // Filter for Canale M-Z
        const isMZ = isCanaleMZ(raw.note);
        if (!isMZ) continue;

        totalMZMatched++;

        let lessonType: "Teoria" | "Esercitazione" | "Laboratorio" = "Teoria";
        if (raw.flagEsercitazione) {
          lessonType = "Esercitazione";
        } else if (
          raw.descrizioneInsegnamento?.toUpperCase().includes("TIROCINIO") ||
          raw.descrizioneInsegnamento?.toUpperCase().includes("LABORATORIO")
        ) {
          lessonType = "Laboratorio";
        }

        const roomClean = raw.descrizioneAula ? `Aula ${raw.descrizioneAula}` : "Aula da definire";
        const buildingClean = raw.descrizioneEdificio || "Sede di Roma";

        const lesson: Lesson = {
          id: `unicatt-${isoDate}-${raw.idLezione || raw.idCalendarioAula || "lec"}-${(raw.oraInizio || "0830").replace(":", "")}`,
          dayOfWeek: dayOfWeek as DayOfWeek,
          startTime: raw.oraInizio || "08:30",
          endTime: raw.oraFine || "10:00",
          subject: formatTitleCase(raw.descrizioneInsegnamento),
          professor: formatProfessor(raw.docente),
          room: roomClean,
          building: buildingClean,
          type: lessonType,
          notes: `Canale M-Z${raw.note ? ` • ${raw.note.trim()}` : ""}`,
          date: isoDate,
          channel: "M-Z",
        };

        importedLessons.push(lesson);
      }
    }

    return NextResponse.json({
      success: true,
      course: data.corsoDiLaurea?.descrizione || "Medicina e Chirurgia",
      faculty: data.corsoDiLaurea?.descrizioneFacolta || "Medicina e Chirurgia A. Gemelli",
      year: annoDiCorso,
      channel: canaleFilter,
      totalFoundInCalendar,
      totalImported: importedLessons.length,
      syncedAt: new Date().toISOString(),
      lessons: importedLessons,
    });
  } catch (error: any) {
    console.error("Errore durante la sincronizzazione dell'orario da Unicatt:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error?.name === "AbortError"
            ? "Timeout di connessione: il server Unicatt ha impiegato troppo tempo a rispondere."
            : `Impossibile sincronizzare l'orario da Unicatt: ${error?.message || "Errore di rete sconosciuto"}`,
      },
      { status: 502 }
    );
  }
}
