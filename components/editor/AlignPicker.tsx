"use client";

import { TEXT_ALIGN_OPTIONS, TextAlign } from "@/lib/content/types";

/** Линии значка: [x1, x2] для каждой из пяти строк — как значки
 *  выравнивания в Word. */
const ICON_LINES: Record<TextAlign, [number, number][]> = {
  left: [[1, 15], [1, 10], [1, 15], [1, 10], [1, 15]],
  center: [[1, 15], [4, 12], [1, 15], [4, 12], [1, 15]],
  right: [[1, 15], [6, 15], [1, 15], [6, 15], [1, 15]],
  justify: [[1, 15], [1, 15], [1, 15], [1, 15], [1, 15]],
};

function AlignIcon({ align }: { align: TextAlign }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      {ICON_LINES[align].map(([x1, x2], i) => (
        <line key={i} x1={x1} x2={x2} y1={2 + i * 3} y2={2 + i * 3} />
      ))}
    </svg>
  );
}

/**
 * Выравнивание текста, как в Word: слева / по центру / справа / по
 * ширине. "Слева" — обычное состояние и хранится как "не задано", так
 * что выпуски без выбора выглядят ровно как раньше.
 */
export function AlignPicker({
  value,
  onChange,
  testId = "align-picker",
}: {
  value?: TextAlign;
  onChange: (align: TextAlign | undefined) => void;
  testId?: string;
}) {
  const current: TextAlign = value ?? "left";
  return (
    <div role="group" aria-label="Выравнивание текста" data-testid={testId} className="flex gap-1">
      {TEXT_ALIGN_OPTIONS.map((opt) => {
        const selected = current === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            title={opt.label}
            aria-label={opt.label}
            aria-pressed={selected}
            data-testid={`${testId}-${opt.id}`}
            data-selected={selected}
            onClick={() => onChange(opt.id === "left" ? undefined : opt.id)}
            className={`flex h-8 min-w-[36px] appearance-none items-center justify-center rounded-control border ${
              selected
                ? "border-ink bg-ink text-paper"
                : "border-ink/20 bg-paper text-olive-dim hover:border-ink/40 hover:text-ink"
            }`}
          >
            <AlignIcon align={opt.id} />
          </button>
        );
      })}
    </div>
  );
}
