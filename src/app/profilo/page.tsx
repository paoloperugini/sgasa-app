"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Users,
  UserCheck,
  Shield,
  Trophy,
  GraduationCap,
  Sparkles,
  Calendar,
  Search,
  Radio,
  Edit2,
  LogOut,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Profile } from "../../lib/types";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";
import { cn } from "../../lib/utils";

function formatItalianBirthDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export default function ProfiloPage() {
  const {
    user,
    profile,
    profiles,
    onlineUsers,
    signOut,
    updateCurrentProfile,
    exams,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");

  // Modal Modifica Profilo
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState(profile?.first_name || "");
  const [editLastName, setEditLastName] = useState(profile?.last_name || "");
  const [editBirthDate, setEditBirthDate] = useState(profile?.birth_date || "");
  const [editYear, setEditYear] = useState<number>(profile?.year_of_course || 3);
  const [editChannel, setEditChannel] = useState<"A-L" | "M-Z">(profile?.channel || "M-Z");
  const [editMatricola, setEditMatricola] = useState(profile?.matricola || "");
  const [editFootballRole, setEditFootballRole] = useState(profile?.football_role || "Centrocampista");
  const [editFootballRating, setEditFootballRating] = useState<number>(profile?.football_rating || 7);
  const [isSaving, setIsSaving] = useState(false);

  const openEditModal = () => {
    if (!profile) return;
    setEditFirstName(profile.first_name);
    setEditLastName(profile.last_name);
    setEditBirthDate(profile.birth_date);
    setEditYear(profile.year_of_course);
    setEditChannel(profile.channel);
    setEditMatricola(profile.matricola || "");
    setEditFootballRole(profile.football_role);
    setEditFootballRating(profile.football_rating);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await updateCurrentProfile({
      first_name: editFirstName.trim(),
      last_name: editLastName.trim(),
      birth_date: editBirthDate,
      year_of_course: Number(editYear),
      channel: editChannel,
      matricola: editMatricola.trim() || undefined,
      football_role: editFootballRole as any,
      football_rating: Number(editFootballRating),
    });
    setIsSaving(false);
    if (success) {
      setIsEditModalOpen(false);
    }
  };

  // Set di ID degli utenti attualmente online
  const onlineUserIds = useMemo(() => {
    return new Set(onlineUsers.map((u) => u.userId));
  }, [onlineUsers]);

  // Filtro profili
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (channelFilter !== "ALL" && p.channel !== channelFilter) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
      return (
        fullName.includes(term) ||
        (p.matricola && p.matricola.toLowerCase().includes(term)) ||
        p.channel.toLowerCase().includes(term)
      );
    });
  }, [profiles, channelFilter, searchTerm]);

  // Statistiche esami del profilo loggato
  const passedExamsCount = exams.filter((e) => e.status === "Superato").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-400" />
            Membri & Community S.G.A.S.A.
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Profili verificati e sincronizzati in tempo reale con Supabase • Università Cattolica Roma
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<Edit2 className="w-3.5 h-3.5" />}
            onClick={openEditModal}
          >
            Modifica Profilo
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            icon={<LogOut className="w-3.5 h-3.5" />}
            onClick={() => signOut()}
            title="Disconnetti il tuo account"
          >
            Esci
          </Button>
        </div>
      </div>

      {/* Il Mio Profilo (Card Personale) */}
      {profile && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-orange-500/30 p-6 sm:p-8 shadow-orange-glow/15">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-orange-500/20 border-2 border-orange-500/50 flex items-center justify-center font-black text-2xl sm:text-3xl text-orange-400 shrink-0 shadow-lg shadow-orange-500/10">
                {profile.first_name.charAt(0)}
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950" title="Tu sei online" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-100">
                    {profile.first_name} {profile.last_name}
                  </h3>
                  <Badge variant="orange">{profile.year_of_course}° Anno Medicina</Badge>
                  <Badge variant="purple">Canale {profile.channel}</Badge>
                </div>

                <div className="text-xs text-zinc-400 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    Nato il: <strong className="text-zinc-200">{formatItalianBirthDate(profile.birth_date)}</strong>
                  </span>
                  {profile.matricola && (
                    <>
                      <span>•</span>
                      <span>Matricola: <strong className="text-zinc-200 font-mono">{profile.matricola}</strong></span>
                    </>
                  )}
                </div>

                <div className="text-xs text-zinc-400 flex items-center gap-2 pt-1">
                  <Trophy className="w-3.5 h-3.5 text-orange-400" />
                  <span>Ruolo Calcetto: <strong className="text-zinc-200">{profile.football_role}</strong></span>
                  <span>•</span>
                  <span>Rating: <strong className="text-orange-400 font-mono">{profile.football_rating}/10</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Booklet Counter */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-zinc-800 pt-4 sm:pt-0 shrink-0">
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                Esami Superati nel Libretto
              </span>
              <div className="text-2xl font-black font-mono text-zinc-100 flex items-center gap-1.5">
                <GraduationCap className="w-5 h-5 text-orange-400" />
                <span>{passedExamsCount} / {exams.length}</span>
              </div>
              <span className="text-[10px] text-zinc-500">Curriculum Medicina Unicatt</span>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Realtime Presence Indicator */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <h3 className="text-sm font-bold text-zinc-100">
              Studenti Connessi in Tempo Reale
            </h3>
            <Badge variant="emerald" className="font-mono text-xs">
              {onlineUsers.length} online ora
            </Badge>
          </div>
          <span className="text-[11px] text-zinc-500">
            Sincronizzato istantaneamente via Supabase Realtime Presence
          </span>
        </div>

        {/* Online Students Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {onlineUsers.length > 0 ? (
            onlineUsers.map((ou, idx) => (
              <div
                key={`${ou.userId}-${idx}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-emerald-500/30 text-xs text-zinc-200"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium">{ou.name}</span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  ({ou.year}° Anno • Can. {ou.channel})
                </span>
              </div>
            ))
          ) : (
            <div className="text-xs text-zinc-500 py-1">
              Connessione al canale di presenza in corso...
            </div>
          )}
        </div>
      </div>

      {/* Elenco Membri Condiviso (Tabella profiles) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span>Elenco Studenti Registrati</span>
              <span className="text-xs font-mono text-zinc-500">
                ({filteredProfiles.length} {filteredProfiles.length === 1 ? "membro" : "membri"})
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Dati anagrafici e sportivi condivisi. Le email e password personali rimangono private.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cerca studente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 w-48 sm:w-56"
              />
            </div>

            <Select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="py-1.5 text-xs"
            >
              <option value="ALL">Tutti i canali</option>
              <option value="M-Z">Canale M-Z</option>
              <option value="A-L">Canale A-L</option>
            </Select>
          </div>
        </div>

        {/* Griglia Profili Studenti */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.length > 0 ? (
            filteredProfiles.map((p) => {
              const isOnline = onlineUserIds.has(p.id);
              const isMe = p.id === user?.id;

              return (
                <div
                  key={p.id}
                  className={cn(
                    "p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 group",
                    isMe
                      ? "bg-zinc-900/80 border-orange-500/50 shadow-md ring-1 ring-orange-500/20"
                      : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900"
                  )}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Avatar con pallino stato */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-base text-orange-400">
                        {p.first_name.charAt(0)}
                      </div>
                      <span
                        className={cn(
                          "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-zinc-900",
                          isOnline ? "bg-emerald-500" : "bg-zinc-600"
                        )}
                        title={isOnline ? "Online in questo momento" : "Offline"}
                      />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-zinc-100 group-hover:text-orange-300 transition-colors truncate">
                          {p.first_name} {p.last_name}
                        </h4>
                        {isMe && <Badge variant="orange" className="text-[9px] px-1.5 py-0">Tu</Badge>}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="blue" className="text-[10px] px-1.5 py-0">
                          {p.year_of_course}° Anno
                        </Badge>
                        <Badge variant="zinc" className="text-[10px] px-1.5 py-0">
                          Canale {p.channel}
                        </Badge>
                      </div>

                      <div className="text-[11px] text-zinc-400 flex items-center gap-1 pt-0.5">
                        <Calendar className="w-3 h-3 text-zinc-500 shrink-0" />
                        <span>Nascita: {formatItalianBirthDate(p.birth_date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Informazioni Calciotto & Stato Online */}
                  <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                    <div className="text-zinc-400 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-orange-400" />
                      <span>{p.football_role}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="font-mono text-orange-400 font-bold">{p.football_rating}/10</span>
                    </div>

                    <div>
                      {isOnline ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Online
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-500">Offline</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 text-zinc-500 text-xs">
              Nessuno studente trovato con i filtri correnti.
            </div>
          )}
        </div>
      </div>

      {/* Modal Modifica Profilo Personale */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifica il tuo Profilo Studente"
        description="Aggiorna i tuoi dati accademici e sportivi su Supabase"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome *"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              required
            />
            <Input
              label="Cognome *"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Data di Nascita *"
              type="date"
              value={editBirthDate}
              onChange={(e) => setEditBirthDate(e.target.value)}
              required
            />
            <Input
              label="Matricola"
              placeholder="es. 00054321"
              value={editMatricola}
              onChange={(e) => setEditMatricola(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Anno di Corso (Medicina e Chirurgia)"
              value={editYear}
              onChange={(e) => setEditYear(Number(e.target.value))}
            >
              <option value={1}>1° Anno</option>
              <option value={2}>2° Anno</option>
              <option value={3}>3° Anno</option>
              <option value={4}>4° Anno</option>
              <option value={5}>5° Anno</option>
              <option value={6}>6° Anno</option>
            </Select>

            <Select
              label="Canale"
              value={editChannel}
              onChange={(e) => setEditChannel(e.target.value as "A-L" | "M-Z")}
            >
              <option value="M-Z">Canale M-Z</option>
              <option value="A-L">Canale A-L</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Ruolo Calciotto"
              value={editFootballRole}
              onChange={(e) => setEditFootballRole(e.target.value as any)}
            >
              <option value="Centrocampista">Centrocampista</option>
              <option value="Attaccante">Attaccante</option>
              <option value="Difensore">Difensore</option>
              <option value="Portiere">Portiere</option>
            </Select>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Rating Calciotto: <strong className="text-orange-400">{editFootballRating}/10</strong>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={editFootballRating}
                onChange={(e) => setEditFootballRating(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? "Salvataggio..." : "Salva Modifiche"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
