"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  Trophy,
  MessageSquare,
  Users,
  Sun,
  Moon,
  ChevronDown,
  Sparkles,
  Flame,
  Check,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { cn } from "../../lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme, currentMatch, profile, user, signOut } = useApp();

  const confirmedPlayers = currentMatch?.roster.filter((r) => r.status === "present").length || 0;

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/lezioni", label: "Lezioni", icon: Calendar },
    { href: "/esami", label: "Appelli d'Esame", icon: GraduationCap },
    {
      href: "/calciotto",
      label: "Calciotto",
      icon: Trophy,
      badge: `${confirmedPlayers}/${currentMatch?.targetPlayers || 16}`,
      badgeColor: confirmedPlayers >= (currentMatch?.targetPlayers || 16) ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-orange-500/20 text-orange-400 border-orange-500/30",
    },
    { href: "/bacheca", label: "Bacheca", icon: MessageSquare },
    { href: "/profilo", label: "Gruppo & Profilo", icon: Users },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl p-4 select-none z-30">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 py-2 mb-6 border-b border-zinc-800/60 pb-5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 shrink-0 rounded-full overflow-hidden border border-orange-500/40 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform bg-zinc-950">
            <Image
              src="/logo.png"
              alt="S.G.A.S.A. Logo"
              width={44}
              height={44}
              priority
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-zinc-100 group-hover:text-orange-400 transition-colors">
                S.G.A.S.A.
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-zinc-400 font-mono tracking-tight uppercase">
              Academic & Sports
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-3 mb-2">
          Menu Principale
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-zinc-800/90 text-orange-400 border border-orange-500/30 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-orange-400" : "text-zinc-500 group-hover:text-zinc-300"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-full border",
                    item.badgeColor
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Calciotto Status Card */}
      {currentMatch && (
        <div className="mx-1 mb-4 p-3 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-900/60 border border-zinc-800/80">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1">
            <span className="flex items-center gap-1.5 text-orange-400">
              <Flame className="w-3.5 h-3.5 text-orange-500" /> Prossimo Calciotto
            </span>
            <span className="text-[10px] font-mono text-zinc-400">{currentMatch.time}</span>
          </div>
          <p className="text-[11px] text-zinc-400 truncate">{currentMatch.location}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-zinc-400">
              Convocati: <strong className="text-zinc-100">{confirmedPlayers}</strong>/16
            </span>
            <Link
              href="/calciotto"
              className="text-[11px] font-medium text-orange-400 hover:text-orange-300"
            >
              Dettagli &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Footer / Active Student Card */}
      <div className="pt-3 border-t border-zinc-800/60 space-y-2">
        {profile && (
          <Link
            href="/profilo"
            className="w-full flex items-center justify-between p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 hover:border-orange-500/40 transition-all text-left group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-orange-400">
                {profile.first_name.charAt(0)}
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-zinc-100 truncate flex items-center gap-1 group-hover:text-orange-300 transition-colors">
                  {profile.first_name} {profile.last_name}
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {profile.year_of_course}° Anno • Can. {profile.channel}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-orange-400 font-mono">Profilo</span>
          </Link>
        )}

        {/* Theme & Actions row */}
        <div className="flex items-center justify-between px-1 text-xs text-zinc-400">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-800/80 hover:text-zinc-200 transition-colors"
            title="Cambia Tema Chiaro/Scuro"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-[11px]">Tema Scuro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-400" />
                <span className="text-[11px]">Tema Chiaro</span>
              </>
            )}
          </button>
          {user && (
            <button
              onClick={() => signOut()}
              className="text-[11px] text-zinc-500 hover:text-red-400 transition-colors"
              title="Esci"
            >
              Esci
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
