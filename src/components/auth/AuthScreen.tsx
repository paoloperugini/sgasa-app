"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Mail, Lock, ArrowRight, UserPlus, LogIn, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface AuthScreenProps {
  onSuccess?: () => void;
}

export function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email || !password) {
      setErrorMsg("Compila tutti i campi richiesti.");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setErrorMsg("Le password non coincidono.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("La password deve contenere almeno 6 caratteri.");
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          onSuccess?.();
        } else if (data.user) {
          setInfoMsg(
            "Registrazione completata! Se la conferma email è attiva su Supabase, controlla la tua casella di posta per confermare l'account."
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          onSuccess?.();
        }
      }
    } catch (err: any) {
      console.error("Errore autenticazione:", err);
      let msg = err.message || "Si è verificato un errore durante l'autenticazione.";
      if (msg.includes("Invalid login credentials")) {
        msg = "Email o password non corretti.";
      } else if (msg.includes("User already registered")) {
        msg = "Esiste già un account registrato con questa email. Prova ad accedere.";
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Crest & Header */}
        <div className="text-center space-y-3">
          <div className="inline-block relative w-20 h-20 rounded-full p-1 bg-gradient-to-br from-orange-500/40 to-amber-500/20 border border-orange-500/30 shadow-2xl shadow-orange-500/20 mx-auto">
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Portale Studenti S.G.A.S.A.
            </div>
            <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">
              {isSignUp ? "Crea il tuo Account" : "Bentornato su S.G.A.S.A."}
            </h1>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-1">
              {isSignUp
                ? "Registrati per sincronizzare lezioni, esami e calciotto in tempo reale con i tuoi compagni."
                : "Accedi con le tue credenziali per entrare nella piattaforma condivisa."}
            </p>
          </div>
        </div>

        {/* Auth Form Card */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                !isSignUp
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Accedi
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                isSignUp
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Registrati
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              {infoMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Email"
                type="email"
                placeholder="nome.cognome@unicatt.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Almeno 6 caratteri"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
            </div>

            {isSignUp && (
              <div>
                <Input
                  label="Conferma Password"
                  type="password"
                  placeholder="Ripeti la password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-3 font-bold text-sm shadow-orange-glow/30"
              disabled={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {isLoading
                ? "Attendere..."
                : isSignUp
                ? "Completa Registrazione"
                : "Accedi al Portale"}
            </Button>
          </form>

          <div className="pt-2 text-center text-[11px] text-zinc-500">
            Piattaforma multi-utente sincronizzata con Supabase PostgreSQL & Realtime
          </div>
        </div>
      </div>
    </div>
  );
}
