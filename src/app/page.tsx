"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  GraduationCap,
  Trophy,
  Flame,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  MessageSquare,
  Sparkles,
  Plus,
  Heart,
  TrendingUp,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input, Textarea, Select } from "../components/ui/Input";
import { formatItalianDate, getDaysUntil, formatEuro } from "../lib/utils";

export default function DashboardPage() {
  const {
    activeStudent,
    lessons,
    exams,
    currentMatch,
    boardMessages,
    addBoardMessage,
    updateAttendance,
  } = useApp();

  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState("");
  const [newNoticeContent, setNewNoticeContent] = useState("");
  const [newNoticeTag, setNewNoticeTag] = useState<"Urgente" | "Esami" | "Lezioni" | "Calciotto" | "Festa/Social" | "Generale" | "Studio">("Generale");

  // Determine current day of week and date
  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const currentDay = now.getDay();
  const isWeekend = currentDay === 0 || currentDay === 6;

  // Find target date: if weekend, target next Monday
  let targetDateIso = todayIso;
  if (isWeekend) {
    const nextMon = new Date(now);
    nextMon.setDate(now.getDate() + (currentDay === 0 ? 1 : 2));
    targetDateIso = `${nextMon.getFullYear()}-${String(nextMon.getMonth() + 1).padStart(2, "0")}-${String(nextMon.getDate()).padStart(2, "0")}`;
  }

  // Look for lessons matching exact target date
  let todayLessons = lessons
    .filter((l) => l.date === targetDateIso)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Fallback for mock/legacy recurring data without a date field
  if (todayLessons.length === 0 && !lessons.some((l) => Boolean(l.date))) {
    const dayOfWeek = currentDay >= 1 && currentDay <= 5 ? currentDay : 1;
    todayLessons = lessons
      .filter((l) => l.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  // Next upcoming exam (safely sorted)
  const upcomingExams = exams
    .filter((e) => e.status !== "Superato" && e.status !== "Respinto")
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  const nextExam = upcomingExams[0];

  // Passed exams & average
  const passedExams = exams.filter((e) => e.status === "Superato" && e.grade);
  const totalCfuPassed = passedExams.reduce((acc, e) => acc + e.cfu, 0);
  const avgGrade =
    passedExams.length > 0
      ? (
          passedExams.reduce((acc, e) => acc + (e.grade || 0) * e.cfu, 0) /
          totalCfuPassed
        ).toFixed(1)
      : "N/A";

  // Active student calciotto status
  const activeAttendance = currentMatch?.roster.find((r) => r.studentId === activeStudent?.id);
  const confirmedPlayers = currentMatch?.roster.filter((r) => r.status === "present").length || 0;
  const costPerHead = confirmedPlayers > 0 ? (currentMatch?.pitchCost || 96) / confirmedPlayers : 0;

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeContent.trim()) return;
    const fullText = newNoticeTitle.trim()
      ? `${newNoticeTitle.trim()}\n\n${newNoticeContent.trim()}`
      : newNoticeContent.trim();
    await addBoardMessage(fullText);
    setNewNoticeTitle("");
    setNewNoticeContent("");
    setIsNoticeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gradient-to-r dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-900 border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-8 shadow-sm dark:shadow-none">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="hidden sm:block shrink-0 relative w-20 h-20 rounded-full p-1 bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 shadow-md">
              <Image
                src="/logo.png"
                alt="S.G.A.S.A. Crest"
                width={80}
                height={80}
                priority
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Gruppo Ufficiale S.G.A.S.A.
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Ciao, {activeStudent?.name.split(" ")[0]}! 👋
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1 max-w-xl">
                Tutto sotto controllo per le lezioni, la preparazione degli appelli d&apos;esame e
                la convocazione per la partita di calciotto.
              </p>
            </div>
          </div>

          {/* Quick Active Student Calciotto RSVP */}
          {currentMatch && (
            <div className="shrink-0 bg-zinc-50/90 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-4 min-w-[260px] shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" /> Presenza Calciotto
                </span>
                <span className="text-[11px] font-mono font-semibold text-orange-600 dark:text-orange-400">
                  {confirmedPlayers}/16
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3 truncate">
                {currentMatch.title} • {formatEuro(costPerHead)}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => updateAttendance(currentMatch.id, activeStudent?.id || "", "present")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    activeAttendance?.status === "present"
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                      : "bg-zinc-200/80 hover:bg-zinc-300 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  Ci sono
                </button>
                <button
                  onClick={() => updateAttendance(currentMatch.id, activeStudent?.id || "", "maybe")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    activeAttendance?.status === "maybe"
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                      : "bg-zinc-200/80 hover:bg-zinc-300 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  Forse
                </button>
                <button
                  onClick={() => updateAttendance(currentMatch.id, activeStudent?.id || "", "absent")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    activeAttendance?.status === "absent"
                      ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                      : "bg-zinc-200/80 hover:bg-zinc-300 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  Assente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid of 3 Main Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Prossima Lezione Oggi */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-orange-400" /> Oggi a lezione
              </span>
              <Badge variant="orange">{todayLessons.length} lezioni</Badge>
            </div>
            {todayLessons.length > 0 ? (
              <div className="space-y-2.5">
                <div className="text-lg font-bold text-zinc-100">{todayLessons[0].subject}</div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  <span>
                    {todayLessons[0].startTime} - {todayLessons[0].endTime}
                  </span>
                  <span>•</span>
                  <Badge variant="zinc">{todayLessons[0].type}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="truncate">{todayLessons[0].room} ({todayLessons[0].building})</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-zinc-500 text-sm">
                Nessuna lezione in programma per oggi! 🎉
              </div>
            )}
          </div>
          <div className="pt-4 mt-4 border-t border-zinc-800/60">
            <Link
              href="/lezioni"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
            >
              Apri calendario completo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Card 2: Prossimo Esame */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-400" /> Prossimo Esame
              </span>
              {nextExam && nextExam.date && (
                <Badge variant={getDaysUntil(nextExam.date).days <= 7 ? "amber" : "blue"}>
                  {getDaysUntil(nextExam.date).label}
                </Badge>
              )}
              {nextExam && !nextExam.date && (
                <Badge variant="zinc">Da pianificare</Badge>
              )}
            </div>
            {nextExam ? (
              <div className="space-y-2.5">
                <div className="text-lg font-bold text-zinc-100">{nextExam.subject}</div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {nextExam.date
                      ? `${formatItalianDate(nextExam.date)} ore ${nextExam.time || "09:00"}`
                      : "Appello da fissare nel libretto"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>CFU: <strong className="text-zinc-200">{nextExam.cfu}</strong></span>
                  <Badge variant="purple">{nextExam.type}</Badge>
                  <Badge variant="emerald">{nextExam.status}</Badge>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-zinc-500 text-sm">
                Nessun esame futuro registrato.
              </div>
            )}
          </div>
          <div className="pt-4 mt-4 border-t border-zinc-800/60 flex items-center justify-between">
            <Link
              href="/esami"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Tutti gli appelli <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[11px] text-zinc-400">
              Media: <strong className="text-zinc-100">{avgGrade}</strong>
            </span>
          </div>
        </Card>

        {/* Card 3: Partita Calciotto */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-orange-500" /> Calciotto 8 vs 8
              </span>
              <Badge variant={confirmedPlayers >= 16 ? "emerald" : "orange"}>
                {confirmedPlayers >= 16 ? "Squadre Piene!" : `Mancano ${16 - confirmedPlayers}`}
              </Badge>
            </div>
            {currentMatch ? (
              <div className="space-y-2.5">
                <div className="text-lg font-bold text-zinc-100 truncate">{currentMatch.title}</div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  <span>{formatItalianDate(currentMatch.date)} ore {currentMatch.time}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Quota a testa:</span>
                  <strong className="text-emerald-400 text-sm font-mono">
                    {formatEuro(costPerHead)}
                  </strong>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-zinc-500 text-sm">
                Nessuna partita programmata.
              </div>
            )}
          </div>
          <div className="pt-4 mt-4 border-t border-zinc-800/60">
            <Link
              href="/calciotto"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
            >
              Gestisci formazioni e quote <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Two Column Section: Timetable Preview & Notice Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column (3 cols): Lezioni di Oggi */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              <h3 className="text-base font-bold text-zinc-100">Orario Lezioni Oggi</h3>
            </div>
            <Link
              href="/lezioni"
              className="text-xs font-semibold text-orange-400 hover:text-orange-300"
            >
              Vedi settimana &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {todayLessons.length > 0 ? (
              todayLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 shrink-0 text-center font-mono py-1 rounded-xl bg-zinc-950 border border-zinc-800">
                      <div className="text-xs font-bold text-orange-400">{lesson.startTime}</div>
                      <div className="text-[10px] text-zinc-500">{lesson.endTime}</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-100 group-hover:text-orange-300 transition-colors">
                        {lesson.subject}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {lesson.professor} • <span className="text-zinc-300">{lesson.room}</span>
                      </div>
                      {lesson.notes && (
                        <div className="text-[11px] text-zinc-500 mt-1 italic">
                          &quot;{lesson.notes}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant={lesson.type === "Laboratorio" ? "purple" : lesson.type === "Esercitazione" ? "cyan" : "orange"}>
                    {lesson.type}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-center text-zinc-500 text-sm">
                Oggi nessuna lezione da seguire. Ottimo momento per studiare o preparare il calciotto!
              </div>
            )}
          </div>
        </div>

        {/* Right Column (2 cols): Bacheca e Avvisi Gruppo */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-orange-500 dark:text-orange-400" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Bacheca S.G.A.S.A.</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsNoticeModalOpen(true)}
            >
              Nuovo Avviso
            </Button>
          </div>

          <div className="space-y-3">
            {boardMessages.length > 0 ? (
              boardMessages.slice(0, 3).map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm dark:shadow-none"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      {msg.author_name}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {formatItalianDate(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-3 leading-relaxed whitespace-pre-line">
                    {msg.content}
                  </p>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-[11px] text-orange-600 dark:text-orange-400 font-medium">
                      Bacheca S.G.A.S.A.
                    </span>
                    <Link
                      href="/bacheca"
                      className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                    >
                      Tutti i messaggi &rarr;
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-center text-zinc-500 text-sm">
                Nessun messaggio presente in bacheca. Sii il primo a scrivere!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Creating Notice */}
      <Modal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        title="Pubblica un nuovo avviso in bacheca"
        description="Condividi un messaggio con tutti i membri del gruppo S.G.A.S.A."
      >
        <form onSubmit={handleCreateNotice} className="space-y-4">
          <Input
            label="Titolo Avviso"
            placeholder="es. Appunti Anatomia Umana 1 disponibili"
            value={newNoticeTitle}
            onChange={(e) => setNewNoticeTitle(e.target.value)}
            required
          />
          <Select
            label="Categoria / Tag"
            value={newNoticeTag}
            onChange={(e) => setNewNoticeTag(e.target.value as any)}
          >
            <option value="Generale">Generale</option>
            <option value="Calciotto">Calciotto</option>
            <option value="Studio">Studio & Esami</option>
            <option value="Urgente">Urgente</option>
            <option value="Festa/Social">Festa / Social</option>
          </Select>
          <Textarea
            label="Messaggio"
            placeholder="Scrivi qui i dettagli..."
            value={newNoticeContent}
            onChange={(e) => setNewNoticeContent(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsNoticeModalOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" variant="primary">
              Pubblica Avviso
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
