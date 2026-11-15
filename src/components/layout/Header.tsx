"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sun, Moon, RotateCcw, UserCheck, Flame, Bell, LogOut, Radio } from "lucide-react";
import { useApp } from "../../context/AppContext";

export function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme, activeStudent, onlineUsers, signOut, user } = useApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const getPageTitle = () => {
    switch (pathname) {
      case "/":
        return { title: "Dashboard Hub", subtitle: "Panoramica lezioni, esami e attività S.G.A.S.A." };
      case "/lezioni":
        return { title: "Orario & Calendario Lezioni", subtitle: "Programmazione accademica giorno per giorno" };
      case "/esami":
        return { title: "Appelli d'Esame & Voti", subtitle: "Sessioni, countdown e monitoraggio CFU" };
      case "/calciotto":
        return { title: "Organizzazione Calciotto", subtitle: "Convocazioni, formazioni 8vs8, quote e campo" };
      case "/bacheca":
        return { title: "Bacheca del Gruppo", subtitle: "Annunci, materiali e comunicazioni ufficiali" };
      case "/profilo":
        return { title: "Studenti & Profilo", subtitle: "Gestione membri SGASA e preferenze personali" };
      default:
        return { title: "S.G.A.S.A.", subtitle: "Student Group Academic & Sports Assistant" };
    }
  };

  const { title, subtitle } = getPageTitle();

  const todayStr = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/" className="md:hidden shrink-0">
          <Image
            src="/logo.png"
            alt="S.G.A.S.A. Logo"
            width={34}
            height={34}
            className="w-8.5 h-8.5 object-contain rounded-full border border-orange-500/40"
          />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              {title}
            </h1>
            <span className="hidden sm:inline-flex items-center text-[11px] font-medium text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full capitalize">
              {todayStr}
            </span>
          </div>
          <p className="hidden sm:block text-xs text-zinc-400">{subtitle}</p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Realtime Online Indicator */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono"
          title="Studenti connessi in tempo reale su Supabase"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{onlineUsers.length} online</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="Cambia tema"
          className="p-2 rounded-xl text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
        </button>

        {/* Active Student Pill */}
        {activeStudent && (
          <Link
            href="/profilo"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-orange-500/40 transition-all text-xs text-zinc-200"
          >
            <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center font-bold text-[10px] text-orange-400">
              {activeStudent.name.charAt(0) || "U"}
            </div>
            <span className="font-medium hidden sm:inline max-w-[120px] truncate">{activeStudent.name}</span>
          </Link>
        )}

        {/* Logout button */}
        {user && (
          <button
            onClick={() => signOut()}
            title="Disconnetti account"
            className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
