"use client";

import React from "react";
import { cn } from "../../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "orange" | "emerald" | "blue" | "purple" | "amber" | "rose" | "zinc" | "cyan";
  size?: "sm" | "md";
  className?: string;
  icon?: React.ReactNode;
}

export function Badge({ children, variant = "orange", size = "sm", className, icon }: BadgeProps) {
  const variants = {
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    zinc: "bg-zinc-800 text-zinc-300 border-zinc-700",
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full border tracking-wide",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
