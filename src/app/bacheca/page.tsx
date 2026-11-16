"use client";

import React, { useState } from "react";
import { MessageSquare, Plus, Trash2, Send, Clock, Sparkles, AlertCircle } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Textarea } from "../../components/ui/Input";
import { formatItalianDate } from "../../lib/utils";

export default function BachecaPage() {
  const {
    boardMessages,
    addBoardMessage,
    deleteBoardMessage,
    isLoadingBoard,
    user,
    profile,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formContent, setFormContent] = useState("");
  const [inlineContent, setInlineContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const authorDisplayName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Membro SGASA";

  const handleSend = async (contentToSend: string, isFromModal = false) => {
    if (!contentToSend.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await addBoardMessage(contentToSend);
    setIsSubmitting(false);

    if (result.success) {
      if (isFromModal) {
        setFormContent("");
        setIsModalOpen(false);
      } else {
        setInlineContent("");
      }
    } else {
      setErrorMessage(result.error || "Impossibile inviare il messaggio. Riprova.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Vuoi davvero eliminare questo messaggio?")) {
      setDeletingId(id);
      await deleteBoardMessage(id);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-orange-500 dark:text-orange-400" />
              Bacheca Ufficiale S.G.A.S.A.
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Realtime attivo
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Comunicazioni, appunti di studio, avvisi calciotto e annunci condivisi in tempo reale tra tutti i membri.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Nuovo Messaggio
        </Button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-500 flex items-center justify-between">
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

      {/* Quick Inline Composer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800/80 shadow-sm dark:shadow-none space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
            {authorDisplayName.slice(0, 2)}
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Pubblica come <strong className="text-zinc-900 dark:text-zinc-100">{authorDisplayName}</strong>
          </div>
        </div>

        <Textarea
          placeholder="Scrivi un avviso o una comunicazione per tutti i membri del gruppo S.G.A.S.A..."
          rows={3}
          value={inlineContent}
          onChange={(e) => setInlineContent(e.target.value)}
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-zinc-400 hidden sm:inline">
            Tutti gli studenti registrati vedranno il messaggio all&apos;istante.
          </span>
          <Button
            variant="primary"
            size="sm"
            icon={<Send className="w-3.5 h-3.5" />}
            disabled={isSubmitting || !inlineContent.trim()}
            onClick={() => handleSend(inlineContent, false)}
          >
            {isSubmitting ? "Invio in corso..." : "Pubblica in Bacheca"}
          </Button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="space-y-4">
        {boardMessages.length > 0 ? (
          boardMessages.map((msg) => {
            const isAuthor = user && msg.user_id === user.id;

            return (
              <div
                key={msg.id}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-3 shadow-sm dark:shadow-none"
              >
                {/* Header Card */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm shrink-0">
                      {msg.author_name.slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        {msg.author_name}
                        {isAuthor && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                            Tu
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {formatItalianDate(msg.created_at)}
                      </span>
                    </div>
                  </div>

                  {isAuthor && (
                    <button
                      onClick={() => handleDelete(msg.id)}
                      disabled={deletingId === msg.id}
                      className="p-1.5 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                      title="Elimina il tuo messaggio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Message Body */}
                <div className="pl-0 sm:pl-12">
                  <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line">
                    {msg.content}
                  </p>
                </div>

                {/* Footer Card */}
                <div className="pt-2 sm:pl-12 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/60">
                  <span className="inline-flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-medium">
                    <Sparkles className="w-3 h-3" /> S.G.A.S.A. Board
                  </span>
                  <span>Sincronizzato Supabase</span>
                </div>
              </div>
            );
          })
        ) : isLoadingBoard ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-sm">
            <div className="w-6 h-6 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto mb-2" />
            Caricamento messaggi in tempo reale...
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-sm space-y-2">
            <MessageSquare className="w-8 h-8 text-zinc-400 mx-auto opacity-50" />
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">
              Nessun messaggio presente in bacheca.
            </p>
            <p className="text-xs text-zinc-500">
              Sii il primo a scrivere un avviso per tutti i compagni del gruppo S.G.A.S.A.!
            </p>
          </div>
        )}
      </div>

      {/* Modal Nuovo Messaggio */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Scrivi un Messaggio in Bacheca"
        description="Il messaggio sarà visibile a tutti i compagni del gruppo S.G.A.S.A. in tempo reale."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(formContent, true);
          }}
          className="space-y-4"
        >
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-600 dark:text-orange-400">
            Pubblichi come: <strong>{authorDisplayName}</strong>
          </div>

          <Textarea
            label="Testo del Messaggio"
            placeholder="Scrivi qui tutte le informazioni utili, avvisi sulle lezioni, annunci per il calcetto o richieste di studio..."
            rows={5}
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            required
            autoFocus
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !formContent.trim()}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              {isSubmitting ? "Invio in corso..." : "Pubblica Messaggio"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
