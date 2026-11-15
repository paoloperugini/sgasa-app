"use client";

import React, { useState, useMemo } from "react";
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Award,
  BookCheck,
  TrendingUp,
  AlertCircle,
  Star,
  RefreshCw,
  Sparkles,
  Search,
  Filter,
  Check,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Exam } from "../../lib/types";
import { TOTAL_CURRICULUM_CFU } from "../../lib/supabase";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { Input, Select, Textarea } from "../../components/ui/Input";
import { formatItalianDate, getDaysUntil, cn } from "../../lib/utils";

const YEARS_LIST = [
  { id: 0, label: "Tutti gli Anni" },
  { id: 1, label: "1° Anno" },
  { id: 2, label: "2° Anno" },
  { id: 3, label: "3° Anno" },
  { id: 4, label: "4° Anno" },
  { id: 5, label: "5° Anno" },
  { id: 6, label: "6° Anno" },
];

export default function EsamiPage() {
  const {
    user,
    profile,
    exams,
    addExam,
    updateExam,
    deleteExam,
    syncOfficialCurriculum,
    resetOfficialCurriculum,
  } = useApp();

  // Filtri Principali
  const [selectedYearFilter, setSelectedYearFilter] = useState<number>(0); // 0 = Tutti
  const [activeStatusTab, setActiveStatusTab] = useState<"TUTTI" | "DA_SOSTENERE" | "IN_PROGRAMMA" | "SUPERATI">("TUTTI");
  const [sessionFilter, setSessionFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Stato sincronizzazione piano di studi
  const [isSyncingCurriculum, setIsSyncingCurriculum] = useState(false);
  const [isResettingCurriculum, setIsResettingCurriculum] = useState(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State Form Dettagli / Nuovo Esame (o ADE)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Form Fields
  const [formSubject, setFormSubject] = useState("");
  const [formYear, setFormYear] = useState<number>(profile?.year_of_course || 1);
  const [formCfu, setFormCfu] = useState(6);
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("09:00");
  const [formRoom, setFormRoom] = useState("Aula Franceschini (Gemelli)");
  const [formType, setFormType] = useState<"Scritto" | "Orale" | "Scritto + Orale" | "Progetto">("Scritto + Orale");
  const [formSession, setFormSession] = useState<"Invernale" | "Estiva" | "Autunnale" | "Straordinaria">("Invernale");
  const [formStatus, setFormStatus] = useState<"Da preparare" | "In studio" | "Iscritto" | "Superato" | "Respinto">("Da preparare");
  const [formGrade, setFormGrade] = useState<string>("");
  const [formNotes, setFormNotes] = useState("");

  // Modal Verbalizzazione Rapida Voto / Idoneità
  const [gradeModalExam, setGradeModalExam] = useState<Exam | null>(null);
  const [quickGrade, setQuickGrade] = useState<string>("30");
  const [quickGradeDate, setQuickGradeDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [isQuickIdoneo, setIsQuickIdoneo] = useState<boolean>(false);

  // Sincronizza l'intero piano di studi (1°-6° Anno)
  const handleSyncCurriculum = async () => {
    setIsSyncingCurriculum(true);
    setSyncFeedback(null);
    const result = await syncOfficialCurriculum();
    setIsSyncingCurriculum(false);

    if (result.success) {
      if (result.addedCount > 0) {
        setSyncFeedback({
          type: "success",
          text: `Piano di studi sincronizzato con successo! Aggiunti ${result.addedCount} insegnamenti ufficiali senza modificare quelli già verbalizzati.`,
        });
      } else {
        setSyncFeedback({
          type: "success",
          text: "Tutti gli insegnamenti ufficiali del piano di studi (1°-6° Anno) sono già presenti nel tuo libretto!",
        });
      }
      setTimeout(() => setSyncFeedback(null), 8000);
    } else {
      setSyncFeedback({
        type: "error",
        text: result.error || "Impossibile completare la sincronizzazione. Riprova.",
      });
    }
  };

  // Resetta al Piano Ufficiale Unicatt (elimina vecchi/generici e lascia solo ed esclusivamente la lista ufficiale 1°-6° anno)
  const handleResetCurriculum = async () => {
    setIsResettingCurriculum(true);
    setSyncFeedback(null);
    setIsConfirmResetOpen(false);
    const result = await resetOfficialCurriculum();
    setIsResettingCurriculum(false);

    if (result.success) {
      const parts: string[] = [];
      if (result.deletedCount > 0) {
        parts.push(`rimossi ${result.deletedCount} esami non ufficiali/obsoleti`);
      }
      if (result.addedCount > 0) {
        parts.push(`aggiunti ${result.addedCount} insegnamenti ufficiali mancanti`);
      }
      const detail = parts.length > 0 ? ` (${parts.join(", ")})` : "";
      setSyncFeedback({
        type: "success",
        text: `Libretto resettato con successo al Piano Ufficiale Unicatt (1° - 6° Anno)${detail}! I voti degli esami ufficiali sono rimasti intatti.`,
      });
      setTimeout(() => setSyncFeedback(null), 8000);
    } else {
      setSyncFeedback({
        type: "error",
        text: result.error || "Impossibile completare il reset al piano ufficiale. Riprova.",
      });
    }
  };

  const openAddModal = () => {
    setEditingExam(null);
    setFormSubject("");
    setFormYear(selectedYearFilter > 0 ? selectedYearFilter : profile?.year_of_course || 1);
    setFormCfu(2); // Default per ADE o esame a scelta
    setFormDate("");
    setFormTime("09:00");
    setFormRoom("Aula Franceschini (Gemelli)");
    setFormType("Scritto + Orale");
    setFormSession("Invernale");
    setFormStatus("Da preparare");
    setFormGrade("");
    setFormNotes("Attività Didattica Elettiva (ADE) / Esame a scelta");
    setIsModalOpen(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setFormSubject(exam.subject);
    setFormYear(exam.year_of_course || 1);
    setFormCfu(exam.cfu);
    setFormDate(exam.date || "");
    setFormTime(exam.time || "09:00");
    setFormRoom(exam.room || "Aula Franceschini (Gemelli)");
    setFormType(exam.type);
    setFormSession(exam.session);
    setFormStatus(exam.status);
    setFormGrade(exam.grade ? (exam.grade === 31 ? "30L" : exam.grade.toString()) : "");
    setFormNotes(exam.notes || "");
    setIsModalOpen(true);
  };

  const openQuickGradeModal = (exam: Exam) => {
    setGradeModalExam(exam);
    const isIdoneitaExam = exam.cfu === 0 || Boolean(exam.is_idoneita);
    setIsQuickIdoneo(isIdoneitaExam);
    setQuickGrade(exam.grade ? (exam.grade === 31 ? "30L" : exam.grade.toString()) : "30");
    setQuickGradeDate(exam.date || new Date().toISOString().split("T")[0]);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject) return;

    let parsedGrade: number | undefined = undefined;
    if (formStatus === "Superato" && formGrade) {
      parsedGrade = formGrade.toUpperCase() === "30L" ? 31 : parseInt(formGrade, 10);
    }

    if (editingExam) {
      await updateExam({
        ...editingExam,
        subject: formSubject,
        year_of_course: Number(formYear),
        cfu: Number(formCfu),
        date: formDate || "",
        time: formTime,
        room: formRoom,
        type: formType,
        session: formSession,
        status: formStatus,
        grade: parsedGrade,
        notes: formNotes,
      });
    } else {
      await addExam({
        subject: formSubject,
        year_of_course: Number(formYear),
        cfu: Number(formCfu),
        date: formDate || "",
        time: formTime,
        room: formRoom,
        type: formType,
        session: formSession,
        status: formStatus,
        grade: parsedGrade,
        notes: formNotes,
      });
    }

    setIsModalOpen(false);
  };

  const handleRecordQuickGrade = async () => {
    if (!gradeModalExam) return;

    if (isQuickIdoneo || gradeModalExam.cfu === 0 || gradeModalExam.is_idoneita) {
      // Verbalizzazione come Idoneità (senza voto numerico, non altera la media)
      await updateExam({
        ...gradeModalExam,
        status: "Superato",
        grade: undefined,
        date: quickGradeDate || gradeModalExam.date,
      });
    } else {
      const gradeNum = quickGrade.toUpperCase() === "30L" ? 31 : parseInt(quickGrade, 10);
      await updateExam({
        ...gradeModalExam,
        status: "Superato",
        grade: gradeNum,
        date: quickGradeDate || gradeModalExam.date,
      });
    }

    setGradeModalExam(null);
  };

  // KPI STATISTICHE ACCADEMICHE
  // 1. Esami superati
  const passedExams = useMemo(() => {
    return exams.filter((e) => e.status === "Superato");
  }, [exams]);

  // 2. Esami con voto numerico valido e CFU > 0 per il calcolo della Media Ponderata
  const gradedExams = useMemo(() => {
    return passedExams.filter((e) => e.cfu > 0 && typeof e.grade === "number" && e.grade >= 18);
  }, [passedExams]);

  // 3. Totale CFU conseguiti (inclusi tutti gli esami superati)
  const totalCfuPassed = useMemo(() => {
    return passedExams.reduce((sum, e) => sum + (e.cfu || 0), 0);
  }, [passedExams]);

  // 4. Calcolo Media Ponderata pesata sui CFU
  const weightedAverage = useMemo(() => {
    const totalWeightedCfu = gradedExams.reduce((sum, e) => sum + e.cfu, 0);
    if (totalWeightedCfu === 0) return "0.00";
    const totalPoints = gradedExams.reduce((sum, e) => {
      const numericGrade = e.grade === 31 ? 30 : e.grade!;
      return sum + numericGrade * e.cfu;
    }, 0);
    return (totalPoints / totalWeightedCfu).toFixed(2);
  }, [gradedExams]);

  // 5. Media Aritmetica semplice
  const arithmeticAverage = useMemo(() => {
    if (gradedExams.length === 0) return "0.00";
    const totalSum = gradedExams.reduce((sum, e) => {
      const numericGrade = e.grade === 31 ? 30 : e.grade!;
      return sum + numericGrade;
    }, 0);
    return (totalSum / gradedExams.length).toFixed(2);
  }, [gradedExams]);

  // 6. Percentuale di completamento del corso (su 344 CFU o 360 CFU)
  const degreeProgressPercent = useMemo(() => {
    const target = TOTAL_CURRICULUM_CFU || 344;
    return Math.min(Math.round((totalCfuPassed / target) * 100), 100);
  }, [totalCfuPassed]);

  // FILTRO ESAMI DINAMICO
  const filteredExams = useMemo(() => {
    return exams
      .filter((e) => {
        // Filtro per Anno di Corso (0 = Tutti)
        if (selectedYearFilter > 0 && e.year_of_course !== selectedYearFilter) {
          return false;
        }

        // Filtro per Stato
        if (activeStatusTab === "DA_SOSTENERE") {
          return e.status !== "Superato";
        }
        if (activeStatusTab === "IN_PROGRAMMA") {
          return e.status !== "Superato" && Boolean(e.date);
        }
        if (activeStatusTab === "SUPERATI") {
          return e.status === "Superato";
        }

        return true;
      })
      .filter((e) => {
        if (sessionFilter !== "ALL" && e.session !== sessionFilter) return false;
        return true;
      })
      .filter((e) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          e.subject.toLowerCase().includes(term) ||
          (e.notes && e.notes.toLowerCase().includes(term)) ||
          (e.room && e.room.toLowerCase().includes(term))
        );
      })
      .sort((a, b) => {
        // Ordina prima per anno di corso se stiamo vedendo tutti
        if (selectedYearFilter === 0 && (a.year_of_course || 0) !== (b.year_of_course || 0)) {
          return (a.year_of_course || 1) - (b.year_of_course || 1);
        }
        // Se superati, mostra gli ultimi superati prima
        if (activeStatusTab === "SUPERATI") {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        // Altrimenti ordina per data appello se presente, poi per materia
        if (a.date && b.date) {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (a.date) return -1;
        if (b.date) return 1;
        return a.subject.localeCompare(b.subject);
      });
  }, [exams, selectedYearFilter, activeStatusTab, sessionFilter, searchTerm]);

  // Conteggio esami per ciascun anno di corso
  const yearCounts = useMemo(() => {
    const counts: Record<number, number> = { 0: exams.length };
    for (let y = 1; y <= 6; y++) {
      counts[y] = exams.filter((e) => e.year_of_course === y).length;
    }
    return counts;
  }, [exams]);

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-400" />
            Libretto Universitario Medicina e Chirurgia
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Piano di Studi Ufficiale (1° - 6° Anno) • Università Cattolica del Sacro Cuore (Policlinico Gemelli, Roma)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsConfirmResetOpen(true)}
            disabled={isResettingCurriculum || isSyncingCurriculum}
            icon={<Sparkles className={cn("w-3.5 h-3.5 text-orange-400", isResettingCurriculum && "animate-spin")} />}
            title="Elimina esami vecchi o generici e allinea il libretto esclusivamente al piano ufficiale 1°-6° anno (344 CFU)"
          >
            {isResettingCurriculum ? "Reset in corso..." : "Resetta al Piano Ufficiale Unicatt"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleSyncCurriculum}
            disabled={isSyncingCurriculum || isResettingCurriculum}
            icon={<RefreshCw className={cn("w-3.5 h-3.5", isSyncingCurriculum && "animate-spin")} />}
            title="Importa gli insegnamenti mancanti senza intaccare i voti già registrati"
          >
            {isSyncingCurriculum ? "Sincronizzazione..." : "Sincronizza Mancanti"}
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={openAddModal}
          >
            Aggiungi Esame a Scelta / ADE
          </Button>
        </div>
      </div>

      {/* Sync Feedback Alert */}
      {syncFeedback && (
        <div
          className={cn(
            "p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1",
            syncFeedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          )}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{syncFeedback.text}</span>
          </div>
          <button
            onClick={() => setSyncFeedback(null)}
            className="text-xs underline hover:opacity-80"
          >
            Chiudi
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Media Ponderata */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Media Ponderata</span>
            <TrendingUp className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-extrabold text-zinc-100 font-mono">
            {weightedAverage}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Pesata sui CFU (idoneità escluse)
          </div>
        </Card>

        {/* Media Aritmetica */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Media Semplice</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-zinc-100 font-mono">
            {arithmeticAverage}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Su {gradedExams.length} esami con voto
          </div>
        </Card>

        {/* Progresso CFU */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>CFU Conseguiti</span>
            <BookCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {totalCfuPassed} <span className="text-xs font-normal text-zinc-500">/ {TOTAL_CURRICULUM_CFU}</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${degreeProgressPercent}%` }}
            />
          </div>
        </Card>

        {/* Prossimi Appelli in programma */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Appelli Fissati</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {exams.filter((e) => e.status !== "Superato" && Boolean(e.date)).length}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Con data e countdown attivo
          </div>
        </Card>
      </div>

      {/* FILTRI RAPIDI ANNO DI CORSO (1° - 6° Anno) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {YEARS_LIST.map((yearTab) => {
          const isSelected = selectedYearFilter === yearTab.id;
          const count = yearCounts[yearTab.id] || 0;

          return (
            <button
              key={yearTab.id}
              onClick={() => setSelectedYearFilter(yearTab.id)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border",
                isSelected
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                  : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              )}
            >
              <span>{yearTab.label}</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                  isSelected ? "bg-white/20 text-white font-bold" : "bg-zinc-800 text-zinc-400"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* BARRA STATO & RICERCA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        {/* State Tabs */}
        <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800 self-start sm:self-auto overflow-x-auto">
          {[
            { id: "TUTTI", label: "Tutti" },
            { id: "DA_SOSTENERE", label: "Da sostenere" },
            { id: "IN_PROGRAMMA", label: "In programma (Data fissata)" },
            { id: "SUPERATI", label: "Superati" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatusTab(tab.id as any)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                activeStatusTab === tab.id
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Session Filters */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca materia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 w-40 sm:w-48"
            />
          </div>

          <Select
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
            className="py-1.5 text-xs w-36"
          >
            <option value="ALL">Tutte le Sessioni</option>
            <option value="Invernale">Invernale</option>
            <option value="Estiva">Estiva</option>
            <option value="Autunnale">Autunnale</option>
            <option value="Straordinaria">Straordinaria</option>
          </Select>
        </div>
      </div>

      {/* GRIGLIA ESAMI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExams.length > 0 ? (
          filteredExams.map((exam) => {
            const hasDate = Boolean(exam.date);
            const daysInfo = hasDate ? getDaysUntil(exam.date) : null;
            const isSuperato = exam.status === "Superato";
            const isIdoneita = exam.cfu === 0 || exam.is_idoneita;

            return (
              <div
                key={exam.id}
                className={cn(
                  "p-5 rounded-2xl bg-zinc-900/70 border transition-all flex flex-col justify-between group",
                  isSuperato
                    ? "border-emerald-500/30 bg-emerald-500/[0.02] hover:border-emerald-500/50"
                    : hasDate
                    ? "border-amber-500/30 bg-amber-500/[0.01] hover:border-amber-500/50"
                    : "border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900"
                )}
              >
                <div>
                  {/* Top Bar: Anno di corso, CFU, e Voto o Countdown */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                        {exam.year_of_course}° ANNO
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {isIdoneita ? "0 CFU • Idoneità" : `${exam.cfu} CFU`}
                      </span>
                    </div>

                    {isSuperato ? (
                      <Badge variant="emerald" icon={<Award className="w-3.5 h-3.5" />}>
                        {exam.grade ? (exam.grade === 31 ? "30 e Lode 🏆" : `${exam.grade}/30`) : "Idoneo ✅"}
                      </Badge>
                    ) : daysInfo ? (
                      <Badge
                        variant={daysInfo.days <= 3 ? "rose" : daysInfo.days <= 10 ? "amber" : "blue"}
                        icon={<Clock className="w-3.5 h-3.5" />}
                      >
                        {daysInfo.label}
                      </Badge>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500">
                        Data da fissare
                      </span>
                    )}
                  </div>

                  {/* Nome Insegnamento */}
                  <h3 className="text-base sm:text-lg font-bold text-zinc-100 group-hover:text-orange-400 transition-colors leading-snug">
                    {exam.subject}
                  </h3>

                  {/* Data, Orario & Aula */}
                  <div className="mt-3 space-y-1.5 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>
                        {hasDate
                          ? isSuperato
                            ? `Verbalizzato il ${formatItalianDate(exam.date)}`
                            : `Appello: ${formatItalianDate(exam.date)} ore ${exam.time || "09:00"}`
                          : "Data appello non ancora fissata"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{exam.room || "Aula Franceschini (Gemelli)"}</span>
                    </div>
                  </div>

                  {/* Badges Tipologia Prova & Stato */}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <Badge variant="purple">{exam.type}</Badge>
                    <Badge
                      variant={
                        exam.status === "Iscritto"
                          ? "emerald"
                          : exam.status === "In studio"
                          ? "amber"
                          : exam.status === "Superato"
                          ? "emerald"
                          : "zinc"
                      }
                    >
                      {exam.status}
                    </Badge>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Sessione {exam.session}
                    </span>
                  </div>

                  {exam.notes && (
                    <p className="mt-3 text-xs text-zinc-400 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
                      {exam.notes}
                    </p>
                  )}
                </div>

                {/* Pulsanti Azione */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  {!isSuperato ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs"
                        icon={<CheckCircle className="w-3.5 h-3.5" />}
                        onClick={() => openQuickGradeModal(exam)}
                      >
                        {isIdoneita ? "Spunta come Idoneo" : "Spunta come Superato"}
                      </Button>
                      {!hasDate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                          icon={<Calendar className="w-3.5 h-3.5" />}
                          onClick={() => openEditModal(exam)}
                        >
                          Fissa Appello
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-zinc-400 hover:text-zinc-200"
                      onClick={() => openQuickGradeModal(exam)}
                    >
                      Modifica Verbalizzazione
                    </Button>
                  )}

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit2 className="w-3.5 h-3.5" />}
                      onClick={() => openEditModal(exam)}
                      title="Modifica dettagli, appello o aula"
                    >
                      Dettagli
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => {
                        if (confirm(`Rimuovere l'insegnamento di ${exam.subject} dal tuo libretto?`)) {
                          deleteExam(exam.id);
                        }
                      }}
                      title="Rimuovi dal libretto"
                    >
                      Rimuovi
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800">
            <GraduationCap className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-zinc-300">Nessun insegnamento trovato</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Nessun esame corrisponde all&apos;anno di corso o ai filtri selezionati.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSyncCurriculum}
                disabled={isSyncingCurriculum}
                icon={<RefreshCw className={cn("w-3.5 h-3.5", isSyncingCurriculum && "animate-spin")} />}
              >
                Sincronizza Piano Completo (1°-6° Anno)
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={openAddModal}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Aggiungi Esame a Scelta / ADE
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Verbalizzazione Voto / Idoneità */}
      <Modal
        isOpen={Boolean(gradeModalExam)}
        onClose={() => setGradeModalExam(null)}
        title={
          gradeModalExam?.cfu === 0 || gradeModalExam?.is_idoneita
            ? "Verbalizza Idoneità nel Libretto"
            : "Registra Voto d'Esame nel Libretto"
        }
        description={`Insegnamento: ${gradeModalExam?.subject} • ${gradeModalExam?.year_of_course}° Anno Medicina (${
          gradeModalExam?.cfu === 0 ? "0 CFU - Idoneità" : `${gradeModalExam?.cfu} CFU`
        })`}
      >
        <div className="space-y-5">
          {gradeModalExam?.cfu === 0 || gradeModalExam?.is_idoneita ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Insegnamento con Idoneità (0 CFU)</strong>
                <p className="text-[11px] text-emerald-400/80 mt-0.5">
                  Questo esame prevede il superamento senza voto numerico. Non altererà la tua media ponderata.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-zinc-300">
                  Seleziona il Voto conseguito (18 - 30 e Lode):
                </label>
                <button
                  type="button"
                  onClick={() => setIsQuickIdoneo(!isQuickIdoneo)}
                  className="text-[11px] text-orange-400 hover:underline"
                >
                  {isQuickIdoneo ? "Passa a Voto Numerico" : "Oppure segna come Idoneità"}
                </button>
              </div>

              {!isQuickIdoneo ? (
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {["18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "30L"].map(
                    (v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setQuickGrade(v)}
                        className={cn(
                          "py-2.5 rounded-xl text-xs font-mono font-bold border transition-all",
                          quickGrade === v
                            ? "bg-orange-500 text-white border-orange-500 shadow-md ring-2 ring-orange-500/40"
                            : "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                        )}
                      >
                        {v === "30L" ? "30L 🏆" : v}
                      </button>
                    )
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 flex items-center justify-between">
                  <span>Registra come Idoneo (Approvato senza voto numerico)</span>
                  <Badge variant="emerald">Idoneo</Badge>
                </div>
              )}
            </div>
          )}

          <Input
            label="Data di Verbalizzazione / Superamento"
            type="date"
            value={quickGradeDate}
            onChange={(e) => setQuickGradeDate(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" onClick={() => setGradeModalExam(null)}>
              Annulla
            </Button>
            <Button variant="primary" onClick={handleRecordQuickGrade}>
              Salva nel Libretto
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Aggiungi / Modifica Esame Completo o ADE */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExam ? "Modifica Insegnamento / Appello" : "Aggiungi Insegnamento / ADE"}
        description="Inserisci i dettagli dell'esame o dell'Attività Didattica Elettiva (ADE)"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <Input
            label="Nome Insegnamento / Materia *"
            placeholder="es. Anatomia Umana 1 oppure ADE Elettrocardiografia"
            value={formSubject}
            onChange={(e) => setFormSubject(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Anno di Corso"
              value={formYear}
              onChange={(e) => setFormYear(Number(e.target.value))}
            >
              <option value={1}>1° Anno</option>
              <option value={2}>2° Anno</option>
              <option value={3}>3° Anno</option>
              <option value={4}>4° Anno</option>
              <option value={5}>5° Anno</option>
              <option value={6}>6° Anno</option>
            </Select>

            <Input
              label="CFU (Crediti Formativi - 0 per idoneità)"
              type="number"
              min="0"
              max="30"
              value={formCfu}
              onChange={(e) => setFormCfu(Number(e.target.value))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Data Appello (Opzionale)"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />
            <Input
              label="Orario"
              type="time"
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Aula / Sede d'Esame"
              placeholder="es. Aula Franceschini (Gemelli)"
              value={formRoom}
              onChange={(e) => setFormRoom(e.target.value)}
            />
            <Select
              label="Sessione d'Esame"
              value={formSession}
              onChange={(e) => setFormSession(e.target.value as any)}
            >
              <option value="Invernale">Sessione Invernale (Gen/Feb)</option>
              <option value="Estiva">Sessione Estiva (Giu/Lug)</option>
              <option value="Autunnale">Sessione Autunnale (Set)</option>
              <option value="Straordinaria">Sessione Straordinaria</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Tipologia di Prova"
              value={formType}
              onChange={(e) => setFormType(e.target.value as any)}
            >
              <option value="Scritto + Orale">Scritto + Orale</option>
              <option value="Orale">Solo Orale</option>
              <option value="Scritto">Solo Scritto</option>
              <option value="Progetto">Progetto / Tirocinio</option>
            </Select>

            <Select
              label="Stato Esame"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as any)}
            >
              <option value="Da preparare">Da preparare</option>
              <option value="In studio">In studio</option>
              <option value="Iscritto">Iscritto all&apos;appello</option>
              <option value="Superato">Superato</option>
              <option value="Respinto">Respinto</option>
            </Select>
          </div>

          {formStatus === "Superato" && (
            <Input
              label="Voto Conseguito (18-30 o 30L - lascia vuoto per Idoneo)"
              placeholder="es. 28 oppure 30L"
              value={formGrade}
              onChange={(e) => setFormGrade(e.target.value)}
            />
          )}

          <Textarea
            label="Note, Programma o Docenti"
            placeholder="es. Commissione d'esame, materiale consigliato..."
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" variant="primary">
              {editingExam ? "Salva Modifiche" : "Aggiungi Insegnamento"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Conferma Reset al Piano Ufficiale Unicatt */}
      <Modal
        isOpen={isConfirmResetOpen}
        onClose={() => setIsConfirmResetOpen(false)}
        title="Resetta al Piano Ufficiale Unicatt"
        description="Allinea il libretto al Piano di Studi Ufficiale di Medicina e Chirurgia (1° - 6° Anno)."
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-400 space-y-2">
            <p className="font-semibold text-orange-400">
              Cosa fa questa operazione:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-300">
              <li>
                <strong className="text-zinc-100">Rimuove</strong> gli esami vecchi/generici non appartenenti al piano ufficiale Unicatt.
              </li>
              <li>
                <strong className="text-zinc-100">Preserva</strong> intatti tutti i voti, le lodi e le date già verbalizzate sui tuoi esami ufficiali.
              </li>
              <li>
                <strong className="text-zinc-100">Garantisce</strong> la presenza di tutti i 40 insegnamenti ufficiali (1°-6° Anno, 344 CFU).
              </li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsConfirmResetOpen(false)}
            >
              Annulla
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleResetCurriculum}
              disabled={isResettingCurriculum}
              icon={<Sparkles className="w-4 h-4" />}
            >
              {isResettingCurriculum ? "Reset in corso..." : "Conferma e Resetta"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
