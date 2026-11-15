"use client";

import React from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", icon, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium transition-all duration-200 select-none rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
      primary: "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 border border-orange-400/30",
      secondary: "bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-100 border border-zinc-700/60 dark:bg-zinc-800 dark:hover:bg-zinc-700",
      outline: "border border-zinc-700 hover:border-orange-500 text-zinc-300 hover:text-orange-400 bg-transparent",
      ghost: "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60",
      danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-6 py-3 gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
