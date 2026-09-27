"use client";

import { AWARD_OPTIONS } from "@/components/decorative/awards/registry";

/**
 * Выбор наград конкретного человека на фото (страница "Лица
 * батальона", QA: "в теле редактора можно будет вставлять те награды,
 * которыми кто-то награждён"). В отличие от EngravingPicker (ровно
 * одна гравюра на страницу — radio-логика, "Нет" сбрасывает выбор),
 * здесь можно отметить НЕСКОЛЬКО наград сразу — человек может быть
 * награждён не одной медалью, поэтому каждая кнопка просто переключает
 * своё присутствие в awardIds независимо от остальных.
 *
 * Пока каталог наград пуст (AWARD_OPTIONS появятся после того, как
 * будут добавлены присланные изображения значков — см. registry.tsx),
 * компонент ничего не показывает, чтобы не выводить пустой заголовок
 * раздела в форме.
 */
export function AwardPicker({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (awardIds: string[]) => void;
}) {
  if (AWARD_OPTIONS.length === 0) return null;

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id) ? selectedIds.filter((existing) => existing !== id) : [...selectedIds, id]
    );
  }

  return (
    <div>
      <p className="mb-1.5 font-display text-[10px] font-bold uppercase tracking-wide text-olive-dim">
        Награды
      </p>
      <div className="flex flex-wrap gap-2">
        {AWARD_OPTIONS.map((award) => {
          const selected = selectedIds.includes(award.id);
          return (
            <button
              key={award.id}
              type="button"
              onClick={() => toggle(award.id)}
              data-testid={`award-option-${award.id}`}
              data-selected={selected}
              className={`flex items-center gap-1.5 rounded-hairline border px-2 py-1.5 text-left font-display text-[11px] font-bold uppercase tracking-wide ${
                selected
                  ? "border-accent bg-accent/10 text-ink"
                  : "border-ink/20 text-olive-dim hover:border-ink/40"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={award.src} alt="" className="h-5 w-5 flex-shrink-0 object-contain" />
              {award.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
