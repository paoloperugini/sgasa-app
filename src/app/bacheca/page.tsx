"use client";

import React, { useState } from "react";
import { MessageSquare, Heart, Plus, Sparkles, Filter, Calendar } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input, Textarea, Select } from "../../components/ui/Input";
import { formatItalianDate } from "../../lib/utils";

export default function BachecaPage() {
  const { notices, addNotice, likeNotice, activeStudent } = useApp();
  const [selectedTag, setSelectedTag] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formTag, setFormTag] = useState<"Urgente" | "Esami" | "Lezioni" | "Calciotto" | "Generale">("Generale");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formContent) return;

    addNotice({
      authorId: activeStudent?.id || "stud-1",
      authorName: activeStudent?.name || "Membro SGASA",
      title: formTitle,
      content: formContent,
      tag: formTag,
    });

    setFormTitle("");
    setFormContent("");
    setIsModalOpen(false);
  };

  const filteredNotices = notices.filter(
    (n) => selectedTag === "ALL" || n.tag === selectedTag
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-orange-400" />
            Bacheca Ufficiale S.G.A.S.A.
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Comunicazioni, appunti di studio, avvisi calciotto e annunci per tutti i membri.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Nuovo Annuncio
        </Button>
      </div>

      {/* Filter by Category */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "Generale", "Calciotto", "Studio", "Urgente", "Festa/Social"].map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedTag === tag
                ? "bg-zinc-800 text-orange-400 border border-orange-500/30"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            {tag === "ALL" ? "Tutti gli avvisi" : tag}
          </button>
        ))}
      </div>

      {/* Notices Feed */}
      <div className="space-y-4">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      notice.tag === "Urgente"
                        ? "rose"
                        : notice.tag === "Calciotto"
                        ? "orange"
                        : notice.tag === "Studio"
                        ? "blue"
                        : "zinc"
                    }
                  >
                    {notice.tag}
                  </Badge>
                  <span className="text-xs text-zinc-400">
                    Pubblicato da <strong>{notice.authorName}</strong>
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500">
                  {formatItalianDate(notice.createdAt)}
                </span>
              </div>

              <h3 className="text-base font-bold text-zinc-100">{notice.title}</h3>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {notice.content}
              </p>

              <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                <button
                  onClick={() => likeNotice(notice.id)}
                  className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-red-400 transition-colors p-1"
                >
                  <Heart className="w-4 h-4 text-red-400 fill-red-400/20" />
                  <span className="font-mono">{notice.likes} Mi piace</span>
                </button>
                <span className="text-[11px] text-zinc-500">S.G.A.S.A. Board</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 text-zinc-500 text-sm">
            Nessun annuncio presente in questa categoria.
          </div>
        )}
      </div>

      {/* Modal Crea Annuncio */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crea Nuovo Annuncio in Bacheca"
        description="Il messaggio sarà visibile a tutti i compagni del gruppo S.G.A.S.A."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Titolo"
            placeholder="es. Scambio turno lezione o link Drive"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />

          <Select
            label="Categoria"
            value={formTag}
            onChange={(e) => setFormTag(e.target.value as any)}
          >
            <option value="Generale">Generale</option>
            <option value="Calciotto">Calciotto</option>
            <option value="Studio">Studio & Esami</option>
            <option value="Urgente">Urgente</option>
            <option value="Festa/Social">Festa / Social</option>
          </Select>

          <Textarea
            label="Testo dell'annuncio"
            placeholder="Scrivi qui tutte le informazioni utili..."
            rows={4}
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" variant="primary">
              Pubblica
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
