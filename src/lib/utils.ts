import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { FootballMatch, Student } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatItalianDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function getDaysUntil(dateStr: string): { days: number; label: string; isPast: boolean } {
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - now.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return { days, label: `${Math.abs(days)} giorni fa`, isPast: true };
  } else if (days === 0) {
    return { days: 0, label: "Oggi!", isPast: false };
  } else if (days === 1) {
    return { days: 1, label: "Domani!", isPast: false };
  } else {
    return { days, label: `Tra ${days} giorni`, isPast: false };
  }
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function generateWhatsAppMessage(match: FootballMatch, students: Student[]): string {
  const studentMap = new Map(students.map((s) => [s.id, s]));
  const presents = match.roster.filter((r) => r.status === "present");
  const costPerHead = presents.length > 0 ? match.pitchCost / presents.length : 0;

  const lightPlayers = match.teamLight.playerIds
    .map((id) => studentMap.get(id)?.name || "Giocatore")
    .join("\n  • ");

  const darkPlayers = match.teamDark.playerIds
    .map((id) => studentMap.get(id)?.name || "Giocatore")
    .join("\n  • ");

  return `⚽ *${match.title.toUpperCase()}* ⚽
📅 *Data:* ${formatItalianDate(match.date)} ore ${match.time}
📍 *Luogo:* ${match.location}
💰 *Quota a testa:* ${formatEuro(costPerHead)} (Costo campo totale: ${formatEuro(match.pitchCost)})

👥 *CONVOCATI CONFERMATI (${presents.length}/${match.targetPlayers})*:
${presents.map((p, idx) => `${idx + 1}. ${studentMap.get(p.studentId)?.name || "Studente"}${p.paid ? " ✅ (pagato)" : ""}`).join("\n")}

⚪ *SQUADRA MAGLIA CHIARA:*
  • ${lightPlayers || "Da definire"}

⚫ *SQUADRA MAGLIA SCURA:*
  • ${darkPlayers || "Da definire"}

📌 *Note:* ${match.notes || "Portare parastinchi e puntualità!"}
_Generato con S.G.A.S.A. Web App_`;
}
