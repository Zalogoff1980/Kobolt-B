import { ComponentType } from "react";
import { PageNumber } from "@/lib/content/types";
import {
  CoverEngraving01,
  CoverEngraving02,
  CoverEngraving03,
  CoverEngraving04,
} from "./coverArt";

export type MotifComponent = ComponentType<{ className?: string }>;

/** "icon" — мелкий line-art мотив по центру страницы, очень низкая
 *  непрозрачность (текущий стиль EngravingTank/motifs.tsx).
 *  "cover-art" — полноценная иллюстрация на всю страницу (object-cover,
 *  высокая непрозрачность) — именно это сейчас используется для
 *  4 гравюр обложки. См. BackgroundEngraving.tsx — рендерит их по-разному. */
export type EngravingKind = "icon" | "cover-art";

export type EngravingOption = { id: string; label: string; kind: EngravingKind };

/**
 * Библиотека фоновых гравюр (PRIORITY 6). Единственное место, где id
 * гравюры сопоставлен с компонентом и с тем, для какой страницы он
 * доступен — BackgroundEngraving и EngravingPicker оба читают отсюда.
 *
 * Сейчас реализовано намеренно только 4 варианта для Page 1 (обложка),
 * предоставленные пользователем напрямую — полная библиотека ~16
 * абстрактных line-art мотивов (components/decorative/engravings/motifs.tsx)
 * подготовлена в коде для будущих страниц 2–4, но пока сознательно НЕ
 * подключена сюда и нигде не выбирается (следующий этап).
 */
export const ENGRAVING_OPTIONS_BY_PAGE: Record<PageNumber, EngravingOption[]> = {
  1: [
    { id: "cover-engraving-01", label: "Вариант 1 — компас и карта", kind: "cover-art" },
    { id: "cover-engraving-02", label: "Вариант 2 — бинокль и рюкзак", kind: "cover-art" },
    { id: "cover-engraving-03", label: "Вариант 3 — танк на марше", kind: "cover-art" },
    { id: "cover-engraving-04", label: "Вариант 4 — колонна и чертежи", kind: "cover-art" },
  ],
  2: [],
  3: [],
  4: [],
};

export const ENGRAVING_COMPONENTS: Record<string, MotifComponent> = {
  "cover-engraving-01": CoverEngraving01,
  "cover-engraving-02": CoverEngraving02,
  "cover-engraving-03": CoverEngraving03,
  "cover-engraving-04": CoverEngraving04,
};

export function engravingKindFor(id: string | null | undefined): EngravingKind | null {
  if (!id) return null;
  for (const options of Object.values(ENGRAVING_OPTIONS_BY_PAGE)) {
    const found = options.find((o) => o.id === id);
    if (found) return found.kind;
  }
  return null;
}
