"use client";

import { templateOptionsFor } from "@/lib/content/templateOptions";
import { EditorCard, CardButton } from "./EditorCard";

/**
 * Переключатель шаблона текущей страницы (ТЗ шага 7, п.4). Меняет
 * ТОЛЬКО templateId — контент (PageContent) не трогается вообще,
 * поэтому смена шаблона никогда не уничтожает то, что уже введено.
 * Это прямое следствие того, что templateId хранится отдельно от
 * content ещё с архитектуры шага 1 — здесь просто наконец есть кнопка,
 * которая этим пользуется.
 *
 * Оформление — карточка в стиле Vercel (EditorCard): заголовок над
 * разделителем и внизу узкие кнопки вариантов, выбранная — тёмная.
 */
export function TemplatePicker({
  pageNumber,
  currentTemplateId,
  onChange,
}: {
  pageNumber: number;
  currentTemplateId: string | null;
  onChange: (templateId: string) => void;
}) {
  const options = templateOptionsFor(pageNumber);
  if (options.length <= 1) return null; // страница 1: единственный шаблон, выбирать нечего

  return (
    <EditorCard title="Шаблон страницы" testId="template-card">
      <div className="flex gap-2">
        {options.map((opt) => (
          <CardButton
            key={opt.id}
            onClick={() => onChange(opt.id)}
            data-testid={`template-option-${opt.id}`}
            data-selected={currentTemplateId === opt.id}
            selected={currentTemplateId === opt.id}
            className="flex-1"
          >
            {opt.label}
          </CardButton>
        ))}
      </div>
    </EditorCard>
  );
}
