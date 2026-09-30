"use client";

import {
  ENGRAVING_COMPONENTS,
  ENGRAVING_OPTIONS_BY_PAGE,
} from "@/components/decorative/engravings/registry";
import { PageNumber } from "@/lib/content/types";
import { EditorCard, CardButton } from "./EditorCard";

/**
 * Выбор фоновой гравюры текущей страницы (PRIORITY 6). Меняет ТОЛЬКО
 * `backgroundEngravingId` — точно так же, как TemplatePicker меняет
 * только `templateId`, никогда не трогая content: смена (или отмена)
 * гравюры никогда не может стереть или переставить ContentBlock,
 * шаблон, зоны контента или текст/фото.
 *
 * Для страниц без вариантов (ENGRAVING_OPTIONS_BY_PAGE пуст) рендерит
 * null, как TemplatePicker для страницы с единственным шаблоном.
 *
 * Оформление — карточка в стиле Vercel (EditorCard): сверху превью
 * выбранного фона на листе (целиком, без обрезки), под ним название
 * варианта и узкие кнопки "Нет · 1 · 2 · 3…".
 */
export function EngravingPicker({
  pageNumber,
  currentEngravingId,
  onChange,
}: {
  pageNumber: PageNumber;
  currentEngravingId: string | null | undefined;
  onChange: (engravingId: string | null) => void;
}) {
  const options = ENGRAVING_OPTIONS_BY_PAGE[pageNumber] ?? [];
  if (options.length === 0) return null;

  const selected = options.find((o) => o.id === currentEngravingId);
  const Motif = selected ? ENGRAVING_COMPONENTS[selected.id] : undefined;

  return (
    <EditorCard title="Фон страницы" testId="engraving-card">
      {/* Превью: лист A4 целиком (object-cover при пропорции листа не
          обрезает) на нейтральной подложке, чтобы бумажный цвет листа
          читался. Непрозрачность выше, чем на самой странице (там 25% —
          фон намеренно приглушён под текст), иначе миниатюра выглядела бы
          просто бледным пятном. */}
      <div className="flex justify-center rounded-control border border-ink/10 bg-chrome/70 py-3">
        <div
          data-testid="engraving-preview"
          data-engraving-id={selected?.id ?? ""}
          className="relative aspect-[210/297] h-40 overflow-hidden bg-paper shadow-[0_1px_6px_rgba(22,21,17,0.25)]"
        >
          {Motif ? (
            <Motif className="h-full w-full object-cover opacity-70" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center px-2 text-center font-body text-[11px] text-olive-dim">
              Без фона
            </span>
          )}
        </div>
      </div>

      <p data-testid="engraving-selected-label" className="mt-2 text-xs text-olive-dim">
        {selected ? selected.label : "Фон не выбран"}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <CardButton
          onClick={() => onChange(null)}
          data-testid="engraving-option-none"
          data-selected={!currentEngravingId}
          selected={!currentEngravingId}
        >
          Нет
        </CardButton>
        {options.map((opt, i) => (
          <CardButton
            key={opt.id}
            onClick={() => onChange(opt.id)}
            data-testid={`engraving-option-${opt.id}`}
            data-selected={currentEngravingId === opt.id}
            selected={currentEngravingId === opt.id}
            title={opt.label}
            aria-label={opt.label}
            className="min-w-9"
          >
            {i + 1}
          </CardButton>
        ))}
      </div>
    </EditorCard>
  );
}
