"use client";

import { ENGRAVING_OPTIONS_BY_PAGE } from "@/components/decorative/engravings/registry";
import { PageNumber } from "@/lib/content/types";

/**
 * Выбор фоновой гравюры текущей страницы (PRIORITY 6 — реализация для
 * Page 1). Меняет ТОЛЬКО `backgroundEngravingId` — точно так же, как
 * TemplatePicker меняет только `templateId`, никогда не трогая
 * content: смена (или отмена) гравюры никогда не может стереть или
 * переставить ContentBlock, шаблон, зоны контента или текст/фото.
 *
 * Сейчас есть варианты только для страницы 1 (обложка) — для страниц
 * 2–4 ENGRAVING_OPTIONS_BY_PAGE пуст, и компонент рендерит null,
 * ничего не показывая (аналогично тому, как TemplatePicker скрывает
 * себя для страницы 1, где выбирать шаблон не из чего).
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
  const options = ENGRAVING_OPTIONS_BY_PAGE[pageNumber];
  if (options.length === 0) return null;

  return (
    <div>
      <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-wide text-olive-dim">
        Фоновая гравюра
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          data-testid="engraving-option-none"
          data-selected={!currentEngravingId}
          className={`rounded-hairline border px-2 py-2 font-display text-[11px] font-bold uppercase tracking-wide ${
            !currentEngravingId
              ? "border-zone-alert bg-zone-alert/10 text-ink"
              : "border-ink/20 text-olive-dim hover:border-ink/40"
          }`}
        >
          Нет
        </button>
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            data-testid={`engraving-option-${opt.id}`}
            data-selected={currentEngravingId === opt.id}
            // Выделение выбранной гравюры — было border-accent
            // (красный), QA: "активные зоны... выделение красным
            // заменить" — единый спокойный "zone-alert".
            className={`rounded-hairline border px-2 py-2 text-left font-display text-[11px] font-bold uppercase tracking-wide ${
              currentEngravingId === opt.id
                ? "border-zone-alert bg-zone-alert/10 text-ink"
                : "border-ink/20 text-olive-dim hover:border-ink/40"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
