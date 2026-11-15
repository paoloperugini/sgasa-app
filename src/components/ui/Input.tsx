"use client";

import React from "react";
import { cn } from "../../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-xs font-medium text-zinc-300 mb-1.5">{label}</label>}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-xl bg-zinc-950/70 border border-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500",
              "focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors",
              icon && "pl-10",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-xs font-medium text-zinc-300 mb-1.5">{label}</label>}
        <select
          ref={ref}
          className={cn(
            "w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100",
            "focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors",
            error && "border-red-500",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-xs font-medium text-zinc-300 mb-1.5">{label}</label>}
        <textarea
          ref={ref}
          rows={3}
          className={cn(
            "w-full rounded-xl bg-zinc-950/70 border border-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500",
            "focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors",
            error && "border-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
