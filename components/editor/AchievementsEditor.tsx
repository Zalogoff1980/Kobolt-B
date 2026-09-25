"use client";

import { createBlockId } from "@/lib/content/types";
import { PageSections } from "@/lib/content/sections";
import { TextInput, SmallButton, SectionHeading } from "./fields";

type Achievement = PageSections["achievements"][number];

/** Список достижений/наград — только для Template B страницы 4
 *  ("Команда", ТЗ шага 5–7). Каждая строка выводится шаблоном
 *  отдельным пунктом, а не абзацем. */
export function AchievementsEditor({
  achievements,
  onChange,
}: {
  achievements: Achievement[];
  onChange: (achievements: Achievement[]) => void;
}) {
  function update(id: string, text: string) {
    onChange(achievements.map((a) => (a.id === id ? { ...a, text } : a)));
  }
  function remove(id: string) {
    onChange(achievements.filter((a) => a.id !== id));
  }
  function add() {
    onChange([...achievements, { id: createBlockId(), text: "" }]);
  }

  return (
    <div className="space-y-2">
      <SectionHeading>Достижения и награды</SectionHeading>
      {achievements.map((a) => (
        <div key={a.id} data-testid="achievement-item" data-block-id={a.id} className="flex gap-1">
          <TextInput
            data-testid="achievement-input"
            value={a.text}
            onChange={(e) => update(a.id, e.target.value)}
            placeholder="Например: лучший экипаж по итогам учений"
          />
          <SmallButton data-testid="achievement-remove" onClick={() => remove(a.id)}>
            ✕
          </SmallButton>
        </div>
      ))}
      <SmallButton data-testid="achievement-add" onClick={add}>
        + Добавить строку
      </SmallButton>
    </div>
  );
}
