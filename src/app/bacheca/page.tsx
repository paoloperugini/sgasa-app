"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Send,
  Trash2,
  CheckCheck,
  Sparkles,
  Users,
  MessageCircle,
  Smile,
  AlertCircle,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

function formatMessageTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function getMessageDateLabel(dateString: string): string {
  try {
    const d = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return "Oggi";
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return "Ieri";
    }
    return d.toLocaleDateString("it-IT", { day: "numeric", month: "long" });
  } catch {
    return "";
  }
}

export default function BachecaPage() {
  const {
    boardMessages,
    addBoardMessage,
    deleteBoardMessage,
    isLoadingBoard,
    user,
    profile,
    onlineUsers,
  } = useApp();

  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ordina i messaggi cronologicamente (dal più vecchio in alto al più recente in basso come WhatsApp)
  const sortedMessages = useMemo(() => {
    return [...boardMessages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [boardMessages]);

  // Raggruppa i messaggi per data per mostrare i divisori "Oggi", "Ieri", ecc.
  const groupedMessages = useMemo(() => {
    const groups: { dateLabel: string; messages: typeof sortedMessages }[] = [];
    let currentDateLabel = "";
    let currentList: typeof sortedMessages = [];

    for (const msg of sortedMessages) {
      const label = getMessageDateLabel(msg.created_at);
      if (label !== currentDateLabel) {
        if (currentList.length > 0) {
          groups.push({ dateLabel: currentDateLabel, messages: currentList });
        }
        currentDateLabel = label;
        currentList = [msg];
      } else {
        currentList.push(msg);
      }
    }

    if (currentList.length > 0) {
      groups.push({ dateLabel: currentDateLabel, messages: currentList });
    }

    return groups;
  }, [sortedMessages]);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "end",
    });
  };

  // Scrolla all'apertura
  useEffect(() => {
    scrollToBottom(false);
  }, [sortedMessages.length]);

  const handleSend = async () => {
    const clean = inputText.trim();
    if (!clean || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setInputText("");

    const result = await addBoardMessage(clean);
    setIsSubmitting(false);

    if (result.success) {
      setTimeout(() => scrollToBottom(true), 50);
      inputRef.current?.focus();
    } else {
      setInputText(clean);
      setErrorMessage(result.error || "Impossibile inviare il messaggio. Riprova.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Vuoi davvero eliminare questo messaggio dalla chat?")) {
      setDeletingId(id);
      await deleteBoardMessage(id);
      setDeletingId(null);
    }
  };

  const currentOnlineCount = onlineUsers.length > 0 ? onlineUsers.length : 1;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)] max-w-5xl mx-auto rounded-3xl overflow-hidden border border-zinc-200/90 dark:border-zinc-800 bg-[#f4f4f6] dark:bg-[#0f0f11] shadow-xl">
      {/* WhatsApp Group Chat Header */}
      <div className="shrink-0 px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200/90 dark:border-zinc-800/90 flex items-center justify-between z-10 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center p-0.5 shadow-md shadow-orange-500/20">
            <Image
              src="/logo.png"
              alt="SGASA"
              width={38}
              height={38}
              className="w-full h-full object-contain rounded-full bg-zinc-900"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Bacheca S.G.A.S.A.
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                <Sparkles className="w-3 h-3" /> Gruppo Ufficiale
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{currentOnlineCount} {currentOnlineCount === 1 ? "studente online" : "studenti online"}</span>
              <span>•</span>
              <span>Sincronizzato in tempo reale</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full hidden sm:inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Supabase
          </span>
        </div>
      </div>

      {/* Error Alert if send fails */}
      {errorMessage && (
        <div className="shrink-0 p-3 bg-red-500/10 border-b border-red-500/20 text-xs text-red-500 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="underline font-semibold hover:opacity-80"
          >
            Chiudi
          </button>
        </div>
      )}

      {/* Messages Stream (WhatsApp Wallpaper Background) */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 bg-radial from-orange-500/[0.03] to-transparent">
        {groupedMessages.length > 0 ? (
          groupedMessages.map((group, groupIdx) => (
            <div key={`group-${groupIdx}`} className="space-y-3">
              {/* Data Divider (Oggi, Ieri, Data) */}
              <div className="flex justify-center my-3 sticky top-1 z-0">
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/90 dark:bg-zinc-800/90 text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs backdrop-blur-xs">
                  {group.dateLabel}
                </span>
              </div>

              {/* Messaggi del giorno */}
              {group.messages.map((msg) => {
                const isMe = user && msg.user_id === user.id;

                if (isMe) {
                  // MIO MESSAGGIO (A DESTRA - ARANCIONE)
                  return (
                    <div
                      key={msg.id}
                      className="flex justify-end items-end gap-1.5 group animate-in fade-in slide-in-from-bottom-1 duration-200"
                    >
                      {/* Bottone elimina messaggio */}
                      <button
                        onClick={() => handleDelete(msg.id)}
                        disabled={deletingId === msg.id}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-opacity rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 mb-1"
                        title="Elimina messaggio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Bolla Arancione */}
                      <div className="relative max-w-[85%] sm:max-w-[70%] rounded-2xl rounded-tr-xs px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/15">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-white select-text font-normal">
                          {msg.content}
                        </p>

                        <div className="flex items-center justify-end gap-1 mt-1 select-none">
                          <span className="text-[10px] text-orange-100 font-medium">
                            {formatMessageTime(msg.created_at)}
                          </span>
                          <CheckCheck className="w-3.5 h-3.5 text-orange-100/90" />
                        </div>
                      </div>
                    </div>
                  );
                }

                // MESSAGGIO DI UN ALTRO UTENTE (A SINISTRA - GRIGIO/CHIARO)
                return (
                  <div
                    key={msg.id}
                    className="flex justify-start items-end gap-2.5 group animate-in fade-in slide-in-from-bottom-1 duration-200"
                  >
                    {/* Avatar iniziale autore */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs border border-zinc-200 dark:border-zinc-700 select-none mb-0.5">
                      {msg.author_name ? msg.author_name.slice(0, 2).toUpperCase() : "??"}
                    </div>

                    {/* Bolla Sinistra */}
                    <div className="relative max-w-[85%] sm:max-w-[70%] rounded-2xl rounded-tl-xs px-4 py-2.5 bg-white dark:bg-zinc-800/95 text-zinc-900 dark:text-zinc-100 border border-zinc-200/90 dark:border-zinc-700/60 shadow-sm dark:shadow-none">
                      {/* Nome autore con colore distintivo */}
                      <div className="text-[11px] font-bold text-orange-600 dark:text-orange-400 mb-0.5 select-none">
                        {msg.author_name}
                      </div>

                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-zinc-800 dark:text-zinc-200 select-text font-normal">
                        {msg.content}
                      </p>

                      <div className="flex items-center justify-end gap-1 mt-1 select-none">
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-400 font-medium">
                          {formatMessageTime(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        ) : isLoadingBoard ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-400 space-y-3">
            <div className="w-8 h-8 border-3 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-xs">Connessione alla chat in corso...</p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 select-none">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
              <MessageCircle className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Nessun messaggio nella chat
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm">
              Scrivi il primo messaggio qui sotto per iniziare la conversazione con tutti i membri di S.G.A.S.A.!
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp Fixed Bottom Input Bar */}
      <div className="shrink-0 p-3 sm:p-3.5 bg-white dark:bg-zinc-900 border-t border-zinc-200/90 dark:border-zinc-800/90 z-10 shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 max-w-5xl mx-auto"
        >
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scrivi un messaggio... (Premi Invio per inviare)"
              className="w-full py-2.5 sm:py-3 pl-4 pr-10 rounded-full bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/80 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all shadow-inner"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !inputText.trim()}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-orange-500/25 shrink-0"
            title="Invia messaggio (Invio)"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
