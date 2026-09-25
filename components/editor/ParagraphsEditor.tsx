"use client";

import { createBlockId } from "@/lib/content/types";
import { PageSections } from "@/lib/content/sections";
import { TextArea, SmallButton, SectionHeading } from "./fields";

type Paragraph = PageSections["paragraphs"][number];

/** Абзацы страницы: добавить / удалить / изменить текст / изменить
 *  порядок (ТЗ шага 7, п.6). Порядок меняется простыми кнопками
 *  вверх/вниз — этого достаточно для MVP, без drag-and-drop. */
export function ParagraphsEditor({
  paragraphs,
  onChange,
}: {
  paragraphs: Paragraph[];
  onChange: (paragraphs: Paragraph[]) => void;
}) {
  function update(id: string, text: string) {
    onChange(paragraphs.map((p) => (p.id === id ? { ...p, text } : p)));
  }
  function remove(id: string) {
    onChange(paragraphs.filter((p) => p.id !== id));
  }
  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= paragraphs.length) return;
    const next = [...paragraphs];
    // tsconfig has noUncheckedIndexedAccess: true — next[index]/next[target]
    // are typed Paragraph | undefined even though both indices are already
    // guaranteed in-bounds above; grab them into locals and guard once
    // instead of assigning a possibly-undefined value into an array slot.
    const a = next[index];
    const b = next[target];
    if (!a || !b) return;
    next[index] = b;
    next[target] = a;
    onChange(next);
  }
  function add() {
    onChange([...paragraphs, { id: createBlockId(), text: "" }]);
  }

  return (
    <div className="space-y-3">
      <SectionHeading>Текст статьи</SectionHeading>
      {paragraphs.map((p, i) => (
        <div key={p.id} data-testid="paragraph-item" data-block-id={p.id} className="space-y-1">
          <TextArea
            data-testid="paragraph-textarea"
            value={p.text}
            onChange={(e) => update(p.id, e.target.value)}
            rows={3}
            placeholder="Абзац текста…"
          />
          <div className="flex gap-1">
            <SmallButton data-testid="paragraph-move-up" onClick={() => move(i, -1)} disabled={i === 0}>
              ↑
            </SmallButton>
            <SmallButton
              data-testid="paragraph-move-down"
              onClick={() => move(i, 1)}
              disabled={i === paragraphs.length - 1}
            >
              ↓
            </SmallButton>
            <SmallButton data-testid="paragraph-remove" onClick={() => remove(p.id)}>
              Удалить абзац
            </SmallButton>
          </div>
        </div>
      ))}
      <SmallButton data-testid="paragraph-add" onClick={add}>
        + Добавить абзац
      </SmallButton>
    </div>
  );
}
