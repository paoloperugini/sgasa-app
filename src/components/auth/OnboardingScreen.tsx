"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  GraduationCap,
  Calendar,
  Trophy,
  User,
  ArrowRight,
  Shield,
  Star,
  CheckCircle2,
} from "lucide-react";
import { supabase, seedUserExamsForYear } from "../../lib/supabase";
import { Button } from "../ui/Button";
import { Input, Select } from "../ui/Input";

interface OnboardingScreenProps {
  userId: string;
  userEmail: string;
  onCompleted: () => void;
}

export function OnboardingScreen({ userId, userEmail, onCompleted }: OnboardingScreenProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("2002-05-15");
  const [yearOfCourse, setYearOfCourse] = useState(3);
  const [channel, setChannel] = useState<"A-L" | "M-Z">("M-Z");
  const [matricola, setMatricola] = useState("");
  const [footballRole, setFootballRole] = useState<"Portiere" | "Difensore" | "Centrocampista" | "Attaccante">("Centrocampista");
  const [footballRating, setFootballRating] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!firstName.trim() || !lastName.trim() || !birthDate) {
      setErrorMsg("Per favore compila Nome, Cognome e Data di nascita.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Salva il profilo dello studente nella tabella Supabase 'profiles'
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        birth_date: birthDate,
        year_of_course: Number(yearOfCourse),
        channel: channel,
        matricola: matricola.trim() || null,
        football_role: footballRole,
        football_rating: Number(footballRating),
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(firstName.trim())}`,
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        throw profileError;
      }

      // 2. Pre-popola automaticamente il libretto esami ufficiale Medicina Unicatt Roma
      // fino all'anno di corso selezionato dallo studente
      await seedUserExamsForYear(userId, Number(yearOfCourse));

      onCompleted();
    } catch (err: any) {
      console.error("Errore durante il salvataggio dell'onboarding:", err);
      setErrorMsg(err.message || "Impossibile salvare il profilo su Supabase. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-block relative w-16 h-16 rounded-full p-1 bg-gradient-to-br from-orange-500/40 to-amber-500/20 border border-orange-500/30 shadow-xl shadow-orange-500/20 mx-auto">
            <Image
              src="/logo.png"
              alt="S.G.A.S.A. Logo"
              width={64}
              height={64}
              priority
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Benvenuto nel Gruppo S.G.A.S.A.
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
              Configura il tuo Profilo Studente
            </h1>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
              Inserisci i tuoi dati accademici: prepareremo automaticamente il tuo orario lezioni e
              il libretto degli esami ufficiali di <strong>Medicina e Chirurgia (Cattolica Roma)</strong>.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sezione 1: Dati Anagrafici */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4" /> 1. Dati Personali
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nome *"
                  placeholder="es. Paolo"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  label="Cognome *"
                  placeholder="es. Rossi"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Data di Nascita *"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
                <Input
                  label="Matricola (Opzionale)"
                  placeholder="es. 00054321"
                  value={matricola}
                  onChange={(e) => setMatricola(e.target.value)}
                />
              </div>
            </div>

            {/* Sezione 2: Corso e Canale Accademico */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <div className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> 2. Corso & Canale Didattico
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Anno di Corso (Medicina e Chirurgia)"
                  value={yearOfCourse}
                  onChange={(e) => setYearOfCourse(Number(e.target.value))}
                >
                  <option value={1}>1° Anno (Matricola)</option>
                  <option value={2}>2° Anno</option>
                  <option value={3}>3° Anno (Clinica & Patologia)</option>
                  <option value={4}>4° Anno</option>
                  <option value={5}>5° Anno</option>
                  <option value={6}>6° Anno (Laureando)</option>
                </Select>

                <Select
                  label="Canale di Appartenenza"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as "A-L" | "M-Z")}
                >
                  <option value="M-Z">Canale M-Z (Sede Gemelli)</option>
                  <option value="A-L">Canale A-L (Sede Gemelli)</option>
                </Select>
              </div>

              <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>
                  Selezionando il tuo anno di corso, caricheremo in automatico tutti gli esami previsti
                  dal piano di studi della Cattolica fino al tuo anno nel tuo libretto esami personale!
                </span>
              </div>
            </div>

            {/* Sezione 3: Calciotto S.G.A.S.A. */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <div className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4" /> 3. Profilo Sportivo (Calciotto 8 vs 8)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Ruolo Preferito in Campo"
                  value={footballRole}
                  onChange={(e) => setFootballRole(e.target.value as any)}
                >
                  <option value="Centrocampista">Centrocampista (Regista / Incursore)</option>
                  <option value="Attaccante">Attaccante (Punta / Ala)</option>
                  <option value="Difensore">Difensore (Centrale / Terzino)</option>
                  <option value="Portiere">Portiere</option>
                </Select>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Livello / Rating di Abilità (1 - 10):{" "}
                    <strong className="text-orange-400 font-mono text-sm">{footballRating}/10</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={footballRating}
                    onChange={(e) => setFootballRating(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                    <span>Principiante (1)</span>
                    <span>Medio (5-7)</span>
                    <span>Campione (10)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pulsante Submit */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center py-3.5 font-bold text-sm shadow-orange-glow/30"
                disabled={isLoading}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {isLoading ? "Configurazione in corso..." : "Salva Profilo & Genera Libretto Esami"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
