"use client";

import { TEMPLATE_OPTIONS } from "@/lib/content/templateOptions";

/**
 * Переключатель шаблона текущей страницы (ТЗ шага 7, п.4). Меняет
 * ТОЛЬКО templateId — контент (PageContent) не трогается вообще,
 * поэтому смена шаблона никогда не уничтожает то, что уже введено.
 * Это прямое следствие того, что templateId хранится отдельно от
 * content ещё с архитектуры шага 1 — здесь просто наконец есть кнопка,
 * которая этим пользуется.
 */
export function TemplatePicker({
  pageNumber,
  currentTemplateId,
  onChange,
}: {
  pageNumber: 1 | 2 | 3 | 4;
  currentTemplateId: string | null;
  onChange: (templateId: string) => void;
}) {
  const options = TEMPLATE_OPTIONS[pageNumber];
  if (options.length <= 1) return null; // страница 1: единственный шаблон, выбирать нечего

  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          data-testid={`template-option-${opt.id}`}
          data-selected={currentTemplateId === opt.id}
          // Выделение выбранного варианта — было border-accent
          // (красный), QA: "активные зоны... выделение красным
          // заменить" — единый спокойный "zone-alert" по всем таким
          // селекторам редактора (см. PageList/EngravingPicker/
          // AwardPicker).
          className={`flex-1 appearance-none rounded-hairline border px-2 py-2 text-left font-display text-[11px] font-bold uppercase tracking-wide ${
            currentTemplateId === opt.id
              ? "border-zone-alert bg-zone-alert/10 text-ink"
              : "border-ink/20 text-olive-dim hover:border-ink/40"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
