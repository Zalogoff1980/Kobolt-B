"use client";

import { createBlockId } from "@/lib/content/types";
import { PageSections } from "@/lib/content/sections";
import { TextInput, SmallButton, SectionHeading } from "./fields";

type Birthday = PageSections["birthdays"][number];

/** Список "Наши именинники" — только для Template B страницы 2
 *  (photo-grid-v1, QA: "справа... разместить блок наши именинники...
 *  с возможностью добавить несколько фамилий с датой... и текстом
 *  небольшого поздравления"). В отличие от achievements (одна строка
 *  на запись) — три отдельных поля: фамилия, дата, короткое
 *  поздравление, потому что шаблон оформляет дату и поздравление
 *  типографически по-разному, а не одной строкой текста. */
export function BirthdaysEditor({
  birthdays,
  onChange,
}: {
  birthdays: Birthday[];
  onChange: (birthdays: Birthday[]) => void;
}) {
  function update(id: string, patch: Partial<Birthday>) {
    onChange(birthdays.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }
  function remove(id: string) {
    onChange(birthdays.filter((b) => b.id !== id));
  }
  function add() {
    onChange([...birthdays, { id: createBlockId(), name: "", date: "", message: "" }]);
  }

  return (
    <div className="space-y-2">
      <SectionHeading zone="birthdays">Наши именинники</SectionHeading>
      {birthdays.map((b) => (
        <div
          key={b.id}
          data-testid="birthday-item"
          data-block-id={b.id}
          className="space-y-1.5 rounded-container border border-ink/10 p-2"
        >
          <div className="flex gap-1.5">
            <TextInput
              data-testid="birthday-name-input"
              value={b.name}
              onChange={(e) => update(b.id, { name: e.target.value })}
              placeholder="Фамилия Имя"
              className="flex-1"
            />
            <TextInput
              data-testid="birthday-date-input"
              value={b.date}
              onChange={(e) => update(b.id, { date: e.target.value })}
              placeholder="28 сентября"
              className="w-[30%] flex-shrink-0"
            />
            <SmallButton data-testid="birthday-remove-button" onClick={() => remove(b.id)}>
              ✕
            </SmallButton>
          </div>
          <TextInput
            data-testid="birthday-message-input"
            value={b.message}
            onChange={(e) => update(b.id, { message: e.target.value })}
            placeholder="Короткое поздравление…"
          />
        </div>
      ))}
      <SmallButton data-testid="birthday-add-button" onClick={add}>
        + Добавить именинника
      </SmallButton>
    </div>
  );
}
