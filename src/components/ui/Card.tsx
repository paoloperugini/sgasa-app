"use client";

import React from "react";
import { cn } from "../../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

export function Card({ className, hover = true, glow = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md p-5 transition-all duration-200",
        "dark:bg-zinc-900/70 dark:border-zinc-800/80 light:bg-white light:border-zinc-200 light:shadow-sm",
        hover && "hover:border-zinc-700/80 hover:bg-zinc-900/90 hover:shadow-lg hover:shadow-black/20",
        glow && "border-orange-500/30 shadow-orange-glow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between gap-4 mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-semibold text-zinc-100 dark:text-zinc-100 light:text-zinc-900 flex items-center gap-2", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600", className)} {...props}>
      {children}
    </p>
  );
}
