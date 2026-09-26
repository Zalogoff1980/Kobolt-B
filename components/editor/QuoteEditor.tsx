"use client";

import { createBlockId } from "@/lib/content/types";
import { PageSections } from "@/lib/content/sections";
import { TextInput, TextArea, SmallButton, SectionHeading, Field } from "./fields";

type Quote = PageSections["quotes"][number];

/** Цитаты страницы — сколько угодно (QA: "дать возможность добавлять
 *  такой блок сколько нужно"; раньше — не больше одной, все шаблоны
 *  читали только quotes[0]). Тот же список-паттерн, что и у
 *  BirthdaysEditor/AchievementsEditor — два поля на запись (текст +
 *  автор), добавить/удалить/изменить любую из них независимо. */
export function QuoteEditor({
  quotes,
  onChange,
}: {
  quotes: Quote[];
  onChange: (quotes: Quote[]) => void;
}) {
  function update(id: string, patch: Partial<Quote>) {
    onChange(quotes.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }
  function remove(id: string) {
    onChange(quotes.filter((q) => q.id !== id));
  }
  function add() {
    onChange([...quotes, { id: createBlockId(), text: "", author: "" }]);
  }

  return (
    <div className="space-y-2">
      <SectionHeading zone="quote">Цитаты</SectionHeading>
      {quotes.map((q) => (
        <div
          key={q.id}
          data-testid="quote-item"
          data-block-id={q.id}
          className="space-y-1.5 rounded-container border border-ink/10 p-2"
        >
          <Field label="Текст цитаты">
            <TextArea
              data-testid="field-quote-text"
              rows={2}
              value={q.text}
              onChange={(e) => update(q.id, { text: e.target.value })}
            />
          </Field>
          <Field label="Автор (необязательно)">
            <TextInput
              data-testid="field-quote-author"
              value={q.author}
              onChange={(e) => update(q.id, { author: e.target.value })}
            />
          </Field>
          <SmallButton data-testid="remove-quote-button" onClick={() => remove(q.id)}>
            Удалить цитату
          </SmallButton>
        </div>
      ))}
      <SmallButton data-testid="add-quote-button" onClick={add}>
        + Добавить цитату
      </SmallButton>
    </div>
  );
}
