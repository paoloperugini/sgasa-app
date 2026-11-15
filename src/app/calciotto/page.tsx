"use client";

import React, { useState } from "react";
import {
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Share2,
  Users,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Sparkles,
  DollarSign,
  ArrowRightLeft,
  Flame,
  Shield,
  Check,
  Copy,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Student } from "../../lib/types";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import {
  formatItalianDate,
  formatEuro,
  generateWhatsAppMessage,
  cn,
} from "../../lib/utils";

export default function CalciottoPage() {
  const {
    students,
    activeStudent,
    matches,
    currentMatch,
    updateAttendance,
    togglePayment,
    autoBalanceTeams,
    updateTeams,
  } = useApp();

  const [copiedToast, setCopiedToast] = useState(false);
  const [activeTab, setActiveTab] = useState<"PROSSIMA" | "SQUADRE" | "STORICO">("PROSSIMA");

  if (!currentMatch) {
    return (
      <div className="p-12 text-center text-zinc-400">
        Nessuna partita di calciotto programmata.
      </div>
    );
  }

  const presents = currentMatch.roster.filter((r) => r.status === "present");
  const maybes = currentMatch.roster.filter((r) => r.status === "maybe");
  const absents = currentMatch.roster.filter((r) => r.status === "absent");

  const confirmedCount = presents.length;
  const costPerHead = confirmedCount > 0 ? currentMatch.pitchCost / confirmedCount : 0;
  const totalPaidCount = presents.filter((r) => r.paid).length;

  const studentMap = new Map(students.map((s) => [s.id, s]));

  // Active student status
  const myAttendance = currentMatch.roster.find((r) => r.studentId === activeStudent?.id);

  // Copy WhatsApp invitation to clipboard
  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppMessage(currentMatch, students);
    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  // Move player from one team to another
  const movePlayerToTeam = (playerId: string, toTeam: "light" | "dark") => {
    let newLight = currentMatch.teamLight.playerIds.filter((id) => id !== playerId);
    let newDark = currentMatch.teamDark.playerIds.filter((id) => id !== playerId);

    if (toTeam === "light") {
      newLight.push(playerId);
    } else {
      newDark.push(playerId);
    }

    updateTeams(currentMatch.id, newLight, newDark);
  };

  const teamLightStudents = currentMatch.teamLight.playerIds
    .map((id) => studentMap.get(id))
    .filter((s): s is Student => Boolean(s));

  const teamDarkStudents = currentMatch.teamDark.playerIds
    .map((id) => studentMap.get(id))
    .filter((s): s is Student => Boolean(s));

  return (
    <div className="space-y-6">
      {/* Hero Match Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="orange" icon={<Flame className="w-3.5 h-3.5" />}>
                Partita Ufficiale S.G.A.S.A.
              </Badge>
              <Badge variant={confirmedCount >= 16 ? "emerald" : "amber"}>
                {confirmedCount >= 16 ? "Numero Giocatori Raggiunto (8 vs 8)" : `Mancano ${16 - confirmedCount} convocati`}
              </Badge>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
              {currentMatch.title}
            </h2>

            <div className="flex items-center gap-4 text-xs sm:text-sm text-zinc-300 flex-wrap">
              <span className="flex items-center gap-1.5 font-medium text-orange-400">
                <Calendar className="w-4 h-4" />
                {formatItalianDate(currentMatch.date)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Clock className="w-4 h-4 text-zinc-400" />
                ore {currentMatch.time}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <MapPin className="w-4 h-4 text-zinc-400" />
                {currentMatch.location}
              </span>
            </div>

            <p className="text-xs text-zinc-400 italic">
              {currentMatch.notes}
            </p>
          </div>

          {/* Cost & WhatsApp Action Card */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center sm:text-left min-w-[220px]">
              <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                Quota Calcolata a Persona
              </div>
              <div className="text-3xl font-black text-emerald-400 font-mono mt-0.5">
                {formatEuro(costPerHead)}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">
                Campo: {formatEuro(currentMatch.pitchCost)} ÷ {confirmedCount} presenti
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              icon={copiedToast ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              onClick={handleCopyWhatsApp}
              className="w-full"
            >
              {copiedToast ? "Copiato negli Appunti!" : "Copia Riepilogo per WhatsApp"}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("PROSSIMA")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
            activeTab === "PROSSIMA"
              ? "bg-zinc-800 text-orange-400 border border-orange-500/30"
              : "text-zinc-400 hover:text-zinc-200"
          )}
        >
          <Users className="w-4 h-4" />
          Convocazioni & Presenze ({confirmedCount}/16)
        </button>

        <button
          onClick={() => setActiveTab("SQUADRE")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
            activeTab === "SQUADRE"
              ? "bg-zinc-800 text-orange-400 border border-orange-500/30"
              : "text-zinc-400 hover:text-zinc-200"
          )}
        >
          <Trophy className="w-4 h-4" />
          Formazioni 8 vs 8
        </button>

        <button
          onClick={() => setActiveTab("STORICO")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
            activeTab === "STORICO"
              ? "bg-zinc-800 text-orange-400 border border-orange-500/30"
              : "text-zinc-400 hover:text-zinc-200"
          )}
        >
          <Shield className="w-4 h-4" />
          Storico Partite
        </button>
      </div>

      {/* TAB 1: CONVOCAZIONI & PRESENZE */}
      {activeTab === "PROSSIMA" && (
        <div className="space-y-6">
          {/* Active Student Quick RSVP Box */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-orange-500/30 shadow-orange-glow/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-orange-400 font-semibold uppercase tracking-wider">
                Il tuo stato per la partita
              </div>
              <h3 className="text-base font-bold text-zinc-100 mt-0.5">
                {activeStudent?.name} ({activeStudent?.footballRole} • Rating {activeStudent?.footballRating}/10)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Stato attuale:{" "}
                <strong className={myAttendance?.status === "present" ? "text-emerald-400" : myAttendance?.status === "maybe" ? "text-amber-400" : "text-red-400"}>
                  {myAttendance?.status === "present" ? "Presente (Confermato)" : myAttendance?.status === "maybe" ? "In Forse" : "Assente"}
                </strong>
                {myAttendance?.paid && " • Quota Pagata ✅"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={myAttendance?.status === "present" ? "primary" : "secondary"}
                size="sm"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={() => updateAttendance(currentMatch.id, activeStudent?.id || "", "present")}
              >
                Ci Sono
              </Button>
              <Button
                variant={myAttendance?.status === "maybe" ? "primary" : "secondary"}
                size="sm"
                icon={<HelpCircle className="w-4 h-4" />}
                onClick={() => updateAttendance(currentMatch.id, activeStudent?.id || "", "maybe")}
              >
                In Forse
              </Button>
              <Button
                variant={myAttendance?.status === "absent" ? "danger" : "secondary"}
                size="sm"
                icon={<XCircle className="w-4 h-4" />}
                onClick={() => updateAttendance(currentMatch.id, activeStudent?.id || "", "absent")}
              >
                Non Ci Sono
              </Button>
            </div>
          </div>

          {/* Attendance Stats bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <div className="text-xl font-bold text-emerald-400 font-mono">{confirmedCount}</div>
              <div className="text-[11px] text-zinc-400">Presenti</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <div className="text-xl font-bold text-amber-400 font-mono">{maybes.length}</div>
              <div className="text-[11px] text-zinc-400">In Forse</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-center">
              <div className="text-xl font-bold text-zinc-300 font-mono">
                {totalPaidCount}/{confirmedCount}
              </div>
              <div className="text-[11px] text-zinc-400">Quote Pagate</div>
            </div>
          </div>

          {/* Roster Table of all Members */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-400" />
                Membri del Gruppo & Convocazioni
              </h3>
              <span className="text-xs text-zinc-400">
                Clicca per modificare la presenza o segnare la quota pagata
              </span>
            </div>

            <div className="divide-y divide-zinc-800/60">
              {students.map((student) => {
                const att = currentMatch.roster.find((r) => r.studentId === student.id);
                const status = att?.status || "absent";
                const isPaid = att?.paid || false;

                return (
                  <div
                    key={student.id}
                    className="p-3.5 sm:px-5 flex items-center justify-between gap-3 hover:bg-zinc-800/30 transition-colors"
                  >
                    {/* Student Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center font-bold text-xs text-orange-400 shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-zinc-100 truncate flex items-center gap-1.5">
                          {student.name}
                          {student.id === activeStudent?.id && (
                            <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.2 rounded">
                              Tu
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 flex items-center gap-2">
                          <span className="text-zinc-500">{student.footballRole}</span>
                          <span>•</span>
                          <span className="text-zinc-500 font-mono">Voto: {student.footballRating}/10</span>
                        </div>
                      </div>
                    </div>

                    {/* Attendance status toggles & Payment */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Presence buttons */}
                      <button
                        onClick={() => updateAttendance(currentMatch.id, student.id, "present")}
                        title="Segna Presente"
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                          status === "present"
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                        )}
                      >
                        Presente
                      </button>
                      <button
                        onClick={() => updateAttendance(currentMatch.id, student.id, "maybe")}
                        title="Segna In Forse"
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                          status === "maybe"
                            ? "bg-amber-500 text-white shadow-sm"
                            : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                        )}
                      >
                        Forse
                      </button>
                      <button
                        onClick={() => updateAttendance(currentMatch.id, student.id, "absent")}
                        title="Segna Assente"
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                          status === "absent"
                            ? "bg-red-500/80 text-white shadow-sm"
                            : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                        )}
                      >
                        Assente
                      </button>

                      {/* Payment Toggle (only if present) */}
                      {status === "present" && (
                        <button
                          onClick={() => togglePayment(currentMatch.id, student.id)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ml-1 flex items-center gap-1",
                            isPaid
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-zinc-800 text-zinc-400 hover:border-zinc-600 border border-transparent"
                          )}
                          title="Clicca per invertire stato pagamento quota"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          {isPaid ? "Pagato" : "Da pagare"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FORMAZIONI 8 vs 8 */}
      {activeTab === "SQUADRE" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                Composizione Squadre 8 vs 8
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Genera formazioni bilanciate in base al ruolo (Portiere, Difensore, Centrocampista, Attaccante) e ai voti abilità.
              </p>
            </div>

            <Button
              variant="primary"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={() => autoBalanceTeams(currentMatch.id)}
            >
              Bilancia Squadre in Automatico
            </Button>
          </div>

          {/* Two Teams Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team 1: Maglia Chiara */}
            <div className="rounded-2xl border border-zinc-700/80 bg-zinc-900/80 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-white border border-zinc-400 shadow" />
                  <h4 className="text-base font-bold text-zinc-100">
                    {currentMatch.teamLight.name}
                  </h4>
                </div>
                <Badge variant="zinc">
                  {teamLightStudents.length}/8 Giocatori
                </Badge>
              </div>

              <div className="space-y-2">
                {teamLightStudents.length > 0 ? (
                  teamLightStudents.map((player) => (
                    <div
                      key={player.id}
                      className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between group hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {player.footballRole.substring(0, 3).toUpperCase()}
                        </span>
                        <div>
                          <span className="text-sm font-semibold text-zinc-200">
                            {player.name}
                          </span>
                          <span className="text-xs text-zinc-500 ml-1.5 font-mono">
                            ★{player.footballRating}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => movePlayerToTeam(player.id, "dark")}
                        className="text-xs text-zinc-400 hover:text-orange-400 p-1 rounded hover:bg-zinc-800 transition-colors"
                        title="Sposta nella squadra scura"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-zinc-500 text-xs">
                    Nessun giocatore assegnato. Clicca &quot;Bilancia Squadre in Automatico&quot;.
                  </div>
                )}
              </div>
            </div>

            {/* Team 2: Maglia Scura */}
            <div className="rounded-2xl border border-orange-500/30 bg-zinc-900/80 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-orange-500 border border-orange-400 shadow" />
                  <h4 className="text-base font-bold text-zinc-100">
                    {currentMatch.teamDark.name}
                  </h4>
                </div>
                <Badge variant="orange">
                  {teamDarkStudents.length}/8 Giocatori
                </Badge>
              </div>

              <div className="space-y-2">
                {teamDarkStudents.length > 0 ? (
                  teamDarkStudents.map((player) => (
                    <div
                      key={player.id}
                      className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between group hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30">
                          {player.footballRole.substring(0, 3).toUpperCase()}
                        </span>
                        <div>
                          <span className="text-sm font-semibold text-zinc-200">
                            {player.name}
                          </span>
                          <span className="text-xs text-zinc-500 ml-1.5 font-mono">
                            ★{player.footballRating}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => movePlayerToTeam(player.id, "light")}
                        className="text-xs text-zinc-400 hover:text-orange-400 p-1 rounded hover:bg-zinc-800 transition-colors"
                        title="Sposta nella squadra chiara"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-zinc-500 text-xs">
                    Nessun giocatore assegnato. Clicca &quot;Bilancia Squadre in Automatico&quot;.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STORICO PARTITE */}
      {activeTab === "STORICO" && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-orange-400" />
            Risultati & Partite Precedenti S.G.A.S.A.
          </h3>

          {matches
            .filter((m) => m.status === "terminata")
            .map((match) => (
              <div
                key={match.id}
                className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                  <span>{formatItalianDate(match.date)}</span>
                  <Badge variant="emerald">Partita Conclusa</Badge>
                </div>

                <h4 className="text-base font-bold text-zinc-100">{match.title}</h4>

                {match.score && (
                  <div className="my-4 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-center gap-8">
                    <div className="text-center">
                      <div className="text-xs text-zinc-400">Maglia Chiara</div>
                      <div className="text-3xl font-black text-zinc-100 font-mono mt-1">
                        {match.score.teamLight}
                      </div>
                    </div>
                    <div className="text-zinc-600 font-bold text-lg">-</div>
                    <div className="text-center">
                      <div className="text-xs text-orange-400">Maglia Scura</div>
                      <div className="text-3xl font-black text-orange-400 font-mono mt-1">
                        {match.score.teamDark}
                      </div>
                    </div>
                  </div>
                )}

                {match.mvp && (
                  <div className="text-xs text-zinc-300 mt-2 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span>MVP della partita: <strong>{studentMap.get(match.mvp)?.name}</strong></span>
                  </div>
                )}

                {match.notes && (
                  <p className="text-xs text-zinc-500 italic mt-2">
                    &quot;{match.notes}&quot;
                  </p>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
