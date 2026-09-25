"use client";

import { useState } from "react";
import { TextInput, TextArea, SmallButton, SectionHeading, Field } from "./fields";

/** Цитата страницы — не более одной (все шаблоны используют
 *  quotes[0]); добавить/удалить/изменить (ТЗ шага 7, п.6).
 *  "Показывать форму" держим как отдельный локальный флаг, а не
 *  выводим его из text.trim() — иначе поле схлопывалось бы обратно
 *  в кнопку "Добавить" в момент, когда пользователь стирает текст
 *  цитаты, чтобы напечатать новый. */
export function QuoteEditor({
  text,
  author,
  onChange,
}: {
  text: string;
  author: string;
  onChange: (next: { text: string; author: string }) => void;
}) {
  const [expanded, setExpanded] = useState(text.trim().length > 0);

  if (!expanded) {
    return (
      <div className="space-y-2">
        <SectionHeading>Цитата</SectionHeading>
        <SmallButton data-testid="add-quote-button" onClick={() => setExpanded(true)}>
          + Добавить цитату
        </SmallButton>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <SectionHeading>Цитата</SectionHeading>
      <Field label="Текст цитаты">
        <TextArea
          data-testid="field-quote-text"
          rows={2}
          value={text}
          onChange={(e) => onChange({ text: e.target.value, author })}
        />
      </Field>
      <Field label="Автор (необязательно)">
        <TextInput
          data-testid="field-quote-author"
          value={author}
          onChange={(e) => onChange({ text, author: e.target.value })}
        />
      </Field>
      <SmallButton
        data-testid="remove-quote-button"
        onClick={() => {
          onChange({ text: "", author: "" });
          setExpanded(false);
        }}
      >
        Удалить цитату
      </SmallButton>
    </div>
  );
}
