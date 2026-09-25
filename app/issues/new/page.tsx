"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveNewIssue } from "@/lib/db/issues";

export default function NewIssuePage() {
  const router = useRouter();
  const [number, setNumber] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!number.trim() || !date) {
      setError("Укажите номер выпуска и дату.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const issue = await saveNewIssue({ number: number.trim(), date });
      router.push(`/issues/${issue.id}`);
    } catch (err) {
      setError("Не удалось сохранить выпуск. Попробуйте ещё раз.");
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper p-8 font-body text-ink">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
          Новый выпуск
        </h1>
        <p className="mt-1 text-olive-dim">Боевой листок · Танковый батальон</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="number" className="font-display text-sm font-bold uppercase text-olive">
              Номер выпуска
            </label>
            <input
              id="number"
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="12"
              className="mt-1 w-full appearance-none rounded-hairline border border-ink/30 bg-white/60 px-3 py-2 outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="date" className="font-display text-sm font-bold uppercase text-olive">
              Дата
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full appearance-none rounded-hairline border border-ink/30 bg-white/60 px-3 py-2 outline-none focus:border-accent"
            />
          </div>

          {error && <p className="text-sm text-accent">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            data-testid="submit-new-issue"
            className="w-full bg-ink py-2.5 font-display font-bold uppercase tracking-wide text-paper disabled:opacity-50"
          >
            {saving ? "Создаём…" : "Создать выпуск"}
          </button>
        </form>
      </div>
    </main>
  );
}
