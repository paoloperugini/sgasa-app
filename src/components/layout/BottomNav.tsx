"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, GraduationCap, Trophy, Users } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { cn } from "../../lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { currentMatch } = useApp();

  const confirmedPlayers = currentMatch?.roster.filter((r) => r.status === "present").length || 0;

  const navItems = [
    { href: "/", label: "Home", icon: LayoutDashboard },
    { href: "/lezioni", label: "Lezioni", icon: Calendar },
    {
      href: "/calciotto",
      label: "Calciotto",
      icon: Trophy,
      badge: confirmedPlayers > 0 ? `${confirmedPlayers}` : undefined,
    },
    { href: "/esami", label: "Esami", icon: GraduationCap },
    { href: "/profilo", label: "Gruppo", icon: Users },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative",
                isActive ? "text-orange-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5", isActive ? "text-orange-400" : "text-zinc-400")} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 text-[9px] font-bold bg-orange-500 text-white rounded-full w-4 h-4 flex items-center justify-center border border-zinc-950">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-orange-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
