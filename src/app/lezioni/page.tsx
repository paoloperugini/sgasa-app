"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  BookOpen,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Columns,
  ListFilter,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { DayOfWeek, Lesson } from "../../lib/types";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input, Select, Textarea } from "../../components/ui/Input";
import { cn } from "../../lib/utils";

// Helper per ottenere il Lunedì della settimana corrispondente a una certa data
function getMondayOfDate(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Domenica, 1 = Lunedì...
  // Se è Domenica (0), guardiamo al Lunedì successivo (+1 giorno) per anticipare la settimana accademica
  // Se è Sabato (6), guardiamo al Lunedì successivo (+2 giorni)
  // Altrimenti (Lun-Ven), andiamo indietro fino al Lunedì della settimana corrente
  const diff = day === 0 ? 1 : day === 6 ? 2 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function toIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const DAY_NAMES = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"];
const DAY_SHORTS = ["Lun", "Mar", "Mer", "Gio", "Ven"];

export default function LezioniPage() {
  const {
    lessons,
    addLesson,
    updateLesson,
    deleteLesson,
    syncUnicattTimetable,
    isSyncing,
    lastSyncTime,
  } = useApp();

  const todayObj = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => toIsoDate(todayObj), [todayObj]);

  // Stato della settimana corrente (memorizza il Lunedì di riferimento)
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMondayOfDate(todayObj));

  // Genera i 5 giorni della settimana visibile (Lunedì - Venerdì)
  const weekDays = useMemo(() => {
    return [0, 1, 2, 3, 4].map((offset) => {
      const d = new Date(currentMonday);
      d.setDate(currentMonday.getDate() + offset);
      const isoDate = toIsoDate(d);
      const dayOfWeek = (offset + 1) as DayOfWeek;
      const formattedDate = new Intl.DateTimeFormat("it-IT", {
        day: "numeric",
        month: "short",
      }).format(d);

      return {
        dayOfWeek,
        dateObj: d,
        isoDate,
        dayName: DAY_NAMES[offset],
        shortName: DAY_SHORTS[offset],
        formattedDate, // es. "16 nov"
        label: `${DAY_SHORTS[offset]} ${formattedDate}`, // es. "Lun 16 nov"
        isToday: isoDate === todayIso,
      };
    });
  }, [currentMonday, todayIso]);

  // Giorno selezionato (default: se oggi è nei giorni della settimana usalo, altrimenti Lunedì)
  const [selectedIsoDate, setSelectedIsoDate] = useState<string>(() => {
    const foundToday = weekDays.find((w) => w.isoDate === todayIso);
    return foundToday ? foundToday.isoDate : weekDays[0].isoDate;
  });

  // Modalità di visualizzazione: Tab singolo giorno o Vista Griglia Colonne
  const [viewMode, setViewMode] = useState<"TABS" | "GRID">("TABS");

  // Filtri
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");

  // Feedback Sincronizzazione
  const [syncMessage, setSyncMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Form Fields
  const [formDate, setFormDate] = useState<string>(selectedIsoDate);
  const [formSubject, setFormSubject] = useState("");
  const [formProfessor, setFormProfessor] = useState("");
  const [formStartTime, setFormStartTime] = useState("09:00");
  const [formEndTime, setFormEndTime] = useState("11:00");
  const [formRoom, setFormRoom] = useState("");
  const [formBuilding, setFormBuilding] = useState("Edificio Didattica");
  const [formType, setFormType] = useState<"Teoria" | "Esercitazione" | "Laboratorio">("Teoria");
  const [formNotes, setFormNotes] = useState("");

  // Navigazione Settimanale
  const goToPreviousWeek = () => {
    setCurrentMonday((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() - 7);
      return next;
    });
  };

  const goToNextWeek = () => {
    setCurrentMonday((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  };

  const goToToday = () => {
    const monday = getMondayOfDate(new Date());
    setCurrentMonday(monday);
    setSelectedIsoDate(todayIso);
  };

  // Se l'utente cambia settimana, assicurati che selectedIsoDate sia coerente con la nuova settimana se non presente
  const activeDay = useMemo(() => {
    const match = weekDays.find((w) => w.isoDate === selectedIsoDate);
    return match || weekDays[0];
  }, [weekDays, selectedIsoDate]);

  // Funzione filtro per una data specifica
  const getLessonsForDate = (isoDate: string, dayOfWeekNum: DayOfWeek) => {
    return lessons
      .filter((l) => {
        // Se la lezione ha una data precisa, controlla quella
        if (l.date) {
          return l.date === isoDate;
        }
        // Fallback per vecchie lezioni ricorrenti senza campo data
        return l.dayOfWeek === dayOfWeekNum;
      })
      .filter((l) => {
        if (selectedTypeFilter !== "ALL" && l.type !== selectedTypeFilter) return false;
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          l.subject.toLowerCase().includes(term) ||
          l.professor.toLowerCase().includes(term) ||
          l.room.toLowerCase().includes(term) ||
          l.building.toLowerCase().includes(term) ||
          (l.notes && l.notes.toLowerCase().includes(term))
        );
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Lezioni per il giorno correntemente attivo
  const currentDayLessons = useMemo(() => {
    return getLessonsForDate(activeDay.isoDate, activeDay.dayOfWeek);
  }, [lessons, activeDay, selectedTypeFilter, searchTerm]);

  // Conteggio lezioni per ogni giorno della settimana visibile
  const weekCounts = useMemo(() => {
    const map: Record<string, number> = {};
    weekDays.forEach((w) => {
      map[w.isoDate] = getLessonsForDate(w.isoDate, w.dayOfWeek).length;
    });
    return map;
  }, [lessons, weekDays, selectedTypeFilter, searchTerm]);

  // Formattazione intervallo settimana (es. "16 Nov - 20 Nov 2026")
  const weekRangeLabel = useMemo(() => {
    const startStr = new Intl.DateTimeFormat("it-IT", {
      day: "numeric",
      month: "short",
    }).format(weekDays[0].dateObj);
    const endStr = new Intl.DateTimeFormat("it-IT", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(weekDays[4].dateObj);
    return `${startStr} – ${endStr}`;
  }, [weekDays]);

  const handleSync = async () => {
    setSyncMessage(null);
    const result = await syncUnicattTimetable();
    if (result.success) {
      setSyncMessage({
        type: "success",
        text: `Orario sincronizzato con successo! Caricate ${result.count} lezioni del Canale M-Z da Unicatt Roma con date specifiche.`,
      });
      setTimeout(() => setSyncMessage(null), 8000);
    } else {
      setSyncMessage({
        type: "error",
        text: result.error || "Impossibile collegarsi al server Unicatt. Verifica la connessione e riprova.",
      });
    }
  };

  const openAddModal = (defaultDateIso?: string) => {
    setEditingLesson(null);
    setFormDate(defaultDateIso || activeDay.isoDate);
    setFormSubject("");
    setFormProfessor("");
    setFormStartTime("08:30");
    setFormEndTime("10:00");
    setFormRoom("Aula Franceschini");
    setFormBuilding("Edificio Didattica");
    setFormType("Teoria");
    setFormNotes("Canale M-Z");
    setIsModalOpen(true);
  };

  const openEditModal = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormDate(lesson.date || activeDay.isoDate);
    setFormSubject(lesson.subject);
    setFormProfessor(lesson.professor);
    setFormStartTime(lesson.startTime);
    setFormEndTime(lesson.endTime);
    setFormRoom(lesson.room);
    setFormBuilding(lesson.building);
    setFormType(lesson.type);
    setFormNotes(lesson.notes || "");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject || !formStartTime || !formEndTime || !formDate) return;

    // Calcola il dayOfWeek dalla data selezionata (1 = Lun, 5 = Ven)
    const [y, m, d] = formDate.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    let dow = dateObj.getDay();
    if (dow === 0) dow = 7;
    const computedDayOfWeek = Math.min(Math.max(dow, 1), 5) as DayOfWeek;

    if (editingLesson) {
      updateLesson({
        ...editingLesson,
        date: formDate,
        dayOfWeek: computedDayOfWeek,
        subject: formSubject,
        professor: formProfessor,
        startTime: formStartTime,
        endTime: formEndTime,
        room: formRoom,
        building: formBuilding,
        type: formType,
        notes: formNotes,
      });
    } else {
      addLesson({
        date: formDate,
        dayOfWeek: computedDayOfWeek,
        subject: formSubject,
        professor: formProfessor,
        startTime: formStartTime,
        endTime: formEndTime,
        room: formRoom,
        building: formBuilding,
        type: formType,
        notes: formNotes,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-orange-500" />
            Calendario Lezioni Settimanale
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Visualizzazione orario con date reali • Canale M-Z Università Cattolica Roma
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            icon={<RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />}
            title="Importa gli orari ufficiali dal portale Unicatt"
          >
            {isSyncing ? "Sincronizzazione..." : "Sincronizza Unicatt"}
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => openAddModal()}
          >
            Nuova Lezione
          </Button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncMessage && (
        <div
          className={cn(
            "p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1",
            syncMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          )}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncMessage.text}</span>
          </div>
          <button
            onClick={() => setSyncMessage(null)}
            className="text-xs underline hover:opacity-80"
          >
            Chiudi
          </button>
        </div>
      )}

      {/* Week Navigation Controls */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        {/* Previous / Today / Next Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousWeek}
            icon={<ChevronLeft className="w-4 h-4" />}
            title="Settimana precedente"
          >
            <span className="hidden sm:inline">Settimana prec.</span>
          </Button>

          <Button
            variant={weekDays.some((w) => w.isToday) ? "primary" : "secondary"}
            size="sm"
            onClick={goToToday}
            title="Torna alla settimana di oggi"
          >
            Oggi
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextWeek}
            title="Settimana successiva"
          >
            <span className="hidden sm:inline">Settimana succ.</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Current Week Range Label */}
        <div className="text-center sm:text-left">
          <div className="text-[11px] font-medium uppercase tracking-wider text-orange-500">
            Periodo Accademico
          </div>
          <div className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <span>Settimana: {weekRangeLabel}</span>
          </div>
        </div>

        {/* View Switcher: Tabs vs 5-Column Grid */}
        <div className="flex items-center bg-zinc-800/60 p-1 rounded-xl border border-zinc-700/60 self-start sm:self-auto">
          <button
            onClick={() => setViewMode("TABS")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
              viewMode === "TABS"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            )}
            title="Visualizza lezioni per singolo giorno selezionato"
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Giorno</span>
          </button>
          <button
            onClick={() => setViewMode("GRID")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
              viewMode === "GRID"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            )}
            title="Visualizza tutte le 5 colonne della settimana affiancate"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Settimana (5 Col.)</span>
          </button>
        </div>
      </div>

      {/* Weekday Tabs (Lun - Ven con date esatte, es. 'Lun 16 nov') */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 select-none">
        {weekDays.map((day) => {
          const isSelected = selectedIsoDate === day.isoDate;
          const count = weekCounts[day.isoDate] || 0;

          return (
            <button
              key={day.isoDate}
              onClick={() => {
                setSelectedIsoDate(day.isoDate);
                if (viewMode === "GRID") setViewMode("TABS");
              }}
              className={cn(
                "p-3 rounded-2xl border text-left transition-all relative overflow-hidden",
                isSelected
                  ? "bg-orange-500/10 border-orange-500/50 shadow-sm ring-1 ring-orange-500/30"
                  : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/90",
                day.isToday && !isSelected && "border-amber-500/40 bg-amber-500/5"
              )}
            >
              {day.isToday && (
                <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-zinc-950 uppercase">
                  Oggi
                </span>
              )}
              <div className="text-xs font-bold text-zinc-200 flex items-center justify-between gap-1">
                <span>{day.dayName}</span>
              </div>
              <div className="text-[11px] font-medium text-orange-400/90 mt-0.5">
                {day.formattedDate}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500">
                  {count === 1 ? "1 lezione" : `${count} lezioni`}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
                    count > 0
                      ? isSelected
                        ? "bg-orange-500 text-white font-bold"
                        : "bg-zinc-800 text-zinc-300"
                      : "bg-zinc-800/40 text-zinc-600"
                  )}
                >
                  {count}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca materia, docente, aula o argomento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "Teoria", "Esercitazione", "Laboratorio"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedTypeFilter(type)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium border transition-all",
                selectedTypeFilter === type
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              )}
            >
              {type === "ALL" ? "Tutte le tipologie" : type}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT AREA: Tab Singolo vs 5 Colonne */}
      {viewMode === "GRID" ? (
        /* VISTA 5 COLONNE AFFIANCATE */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
          {weekDays.map((colDay) => {
            const colLessons = getLessonsForDate(colDay.isoDate, colDay.dayOfWeek);

            return (
              <div
                key={colDay.isoDate}
                className={cn(
                  "rounded-2xl border p-3.5 space-y-3 bg-zinc-900/40 transition-all",
                  colDay.isToday ? "border-amber-500/50 bg-amber-500/[0.02]" : "border-zinc-800/80"
                )}
              >
                {/* Header Colonna */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">{colDay.dayName}</h4>
                    <span className="text-[10px] font-mono text-orange-400">
                      {colDay.formattedDate}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                    {colLessons.length}
                  </span>
                </div>

                {/* Lezioni della colonna */}
                <div className="space-y-2.5">
                  {colLessons.length > 0 ? (
                    colLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/90 hover:border-orange-500/40 transition-all space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold text-orange-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lesson.startTime} - {lesson.endTime}
                          </span>
                          <Badge
                            variant={
                              lesson.type === "Laboratorio"
                                ? "purple"
                                : lesson.type === "Esercitazione"
                                ? "cyan"
                                : "orange"
                            }
                            className="text-[9px] px-1.5 py-0"
                          >
                            {lesson.type}
                          </Badge>
                        </div>

                        <div>
                          <h5 className="text-xs font-semibold text-zinc-100 group-hover:text-orange-300 transition-colors line-clamp-2">
                            {lesson.subject}
                          </h5>
                          <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
                            {lesson.professor}
                          </p>
                        </div>

                        <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                          <span className="truncate">{lesson.room}</span>
                        </div>

                        <div className="pt-1.5 flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity border-t border-zinc-800/60">
                          <button
                            onClick={() => openEditModal(lesson)}
                            className="p-1 rounded text-zinc-400 hover:text-orange-400"
                            title="Modifica"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Eliminare la lezione di ${lesson.subject}?`)) {
                                deleteLesson(lesson.id);
                              }
                            }}
                            className="p-1 rounded text-zinc-400 hover:text-red-400"
                            title="Elimina"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-[11px] text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                      Nessuna lezione
                    </div>
                  )}

                  <button
                    onClick={() => openAddModal(colDay.isoDate)}
                    className="w-full py-1.5 rounded-xl border border-dashed border-zinc-800 text-[10px] text-zinc-500 hover:text-orange-400 hover:border-orange-500/40 hover:bg-orange-500/5 transition-all flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Aggiungi
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VISTA TAB DETTAGLIATA PER IL GIORNO SELEZIONATO */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <span>Lezioni in programma per</span>
              <span className="text-orange-400">
                {activeDay.dayName} {activeDay.formattedDate}
              </span>
              <span className="text-xs font-mono text-zinc-500">
                ({currentDayLessons.length} {currentDayLessons.length === 1 ? "lezione" : "lezioni"})
              </span>
            </h3>

            <Button
              variant="outline"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => openAddModal(activeDay.isoDate)}
            >
              Aggiungi a questo giorno
            </Button>
          </div>

          <div className="space-y-3">
            {currentDayLessons.length > 0 ? (
              currentDayLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-700 hover:bg-zinc-900/90 transition-all group"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Time Slot Badge */}
                    <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center min-w-[95px] text-center shrink-0">
                      <span className="text-sm font-extrabold font-mono text-orange-400">
                        {lesson.startTime}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">fino alle</span>
                      <span className="text-xs font-extrabold font-mono text-zinc-300">
                        {lesson.endTime}
                      </span>
                    </div>

                    {/* Lesson Details */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-zinc-100 group-hover:text-orange-300 transition-colors">
                          {lesson.subject}
                        </h4>
                        <Badge
                          variant={
                            lesson.type === "Laboratorio"
                              ? "purple"
                              : lesson.type === "Esercitazione"
                              ? "cyan"
                              : "orange"
                          }
                        >
                          {lesson.type}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-zinc-500" />
                          {lesson.professor}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                          <strong className="text-zinc-300">{lesson.room}</strong>
                          {lesson.building && <span className="text-zinc-500">({lesson.building})</span>}
                        </span>
                      </div>

                      {lesson.notes && (
                        <div className="text-xs text-zinc-400 bg-zinc-950/70 rounded-xl px-3 py-1.5 border border-zinc-800/60 max-w-2xl mt-1">
                          <span className="text-orange-400 font-medium">Nota:</span> {lesson.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit2 className="w-3.5 h-3.5" />}
                      onClick={() => openEditModal(lesson)}
                    >
                      Modifica
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => {
                        if (confirm(`Eliminare la lezione di ${lesson.subject}?`)) {
                          deleteLesson(lesson.id);
                        }
                      }}
                    >
                      Elimina
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
                <BookOpen className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-zinc-300">
                  Nessuna lezione in programma per {activeDay.dayName} {activeDay.formattedDate}
                </h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Nessuna lezione programmata in questa data con i filtri selezionati.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSync}
                    icon={<RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />}
                  >
                    Sincronizza da Unicatt (Canale M-Z)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAddModal(activeDay.isoDate)}
                    icon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Aggiungi a questo giorno
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Aggiungi / Modifica Lezione con Data Esatta */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLesson ? "Modifica Lezione" : "Aggiungi Nuova Lezione"}
        description="Inserisci i dettagli dell'orario e la data accademica"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Materia"
            placeholder="es. Patologia Generale 2"
            value={formSubject}
            onChange={(e) => setFormSubject(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Docente"
              placeholder="es. Prof. Calviello Gabriella"
              value={formProfessor}
              onChange={(e) => setFormProfessor(e.target.value)}
              required
            />
            <Input
              label="Data della Lezione"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Orario Inizio"
              type="time"
              value={formStartTime}
              onChange={(e) => setFormStartTime(e.target.value)}
              required
            />
            <Input
              label="Orario Fine"
              type="time"
              value={formEndTime}
              onChange={(e) => setFormEndTime(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Aula"
              placeholder="es. Aula Franceschini"
              value={formRoom}
              onChange={(e) => setFormRoom(e.target.value)}
              required
            />
            <Input
              label="Edificio / Plesso"
              placeholder="es. Giovanni XXIII"
              value={formBuilding}
              onChange={(e) => setFormBuilding(e.target.value)}
            />
          </div>

          <Select
            label="Tipologia Lezione"
            value={formType}
            onChange={(e) => setFormType(e.target.value as any)}
          >
            <option value="Teoria">Teoria</option>
            <option value="Esercitazione">Esercitazione</option>
            <option value="Laboratorio">Laboratorio / Tirocinio</option>
          </Select>

          <Textarea
            label="Note & Canale"
            placeholder="es. Canale M-Z • Portare camice..."
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" variant="primary">
              {editingLesson ? "Salva Modifiche" : "Aggiungi Lezione"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
