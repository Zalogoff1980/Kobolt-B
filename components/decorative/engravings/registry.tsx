import { ComponentType } from "react";
import { PageNumber } from "@/lib/content/types";
import {
  CoverEngraving01,
  CoverEngraving02,
  CoverEngraving03,
  CoverEngraving04,
} from "./coverArt";
import {
  Page2Engraving01,
  Page2Engraving02,
  Page2Engraving03,
  Page2Engraving04,
} from "./page2Art";
import { Page3Engraving01, Page3Engraving02 } from "./page3Art";

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
 * Реализовано: 4 варианта для Page 1 (обложка), 4 варианта для Page 2
 * ("История") и 2 варианта для Page 3 (пока меньше — ровно столько
 * предоставлено; добавить ещё позже можно тем же приёмом) — все наборы
 * предоставлены пользователем напрямую, как готовые полноразмерные A4
 * иллюстрации (public/engravings/*.jpg), а не собраны из отдельных
 * элементов. Полная библиотека ~16 абстрактных line-art мотивов
 * (components/decorative/engravings/motifs.tsx) подготовлена в коде
 * для страницы 4, но пока сознательно НЕ подключена сюда и нигде не
 * выбирается (следующий этап).
 *
 * Page 2 и Page 3 получают ровно тот же kind: "cover-art" (полноразмерная
 * иллюстрация, opacity-25 — см. BackgroundEngraving.tsx), что и Page 1
 * (QA: "про прозрачность так же, как и на странице 1") — kind не
 * привязан к конкретной странице, он просто описывает, ЧТО это за
 * изображение (полноразмерная композиция vs мелкая line-art иконка),
 * поэтому единственное, что нужно было сделать для одинаковой
 * прозрачности — использовать тот же kind, а не копировать стили.
 */
export const ENGRAVING_OPTIONS_BY_PAGE: Record<PageNumber, EngravingOption[]> = {
  1: [
    { id: "cover-engraving-01", label: "Вариант 1 — компас и карта", kind: "cover-art" },
    { id: "cover-engraving-02", label: "Вариант 2 — бинокль и рюкзак", kind: "cover-art" },
    { id: "cover-engraving-03", label: "Вариант 3 — танк на марше", kind: "cover-art" },
    { id: "cover-engraving-04", label: "Вариант 4 — колонна и чертежи", kind: "cover-art" },
  ],
  2: [
    { id: "page2-engraving-01", label: "Вариант 1 — танковая мастерская", kind: "cover-art" },
    { id: "page2-engraving-02", label: "Вариант 2 — танковая колонна", kind: "cover-art" },
    { id: "page2-engraving-03", label: "Вариант 3 — минималистичный", kind: "cover-art" },
    { id: "page2-engraving-04", label: "Вариант 4 — танк и чертежи", kind: "cover-art" },
  ],
  3: [
    { id: "page3-engraving-01", label: "Вариант 1 — дрон над рекой", kind: "cover-art" },
    { id: "page3-engraving-02", label: "Вариант 2 — оператор БПЛА", kind: "cover-art" },
  ],
  4: [],
};

export const ENGRAVING_COMPONENTS: Record<string, MotifComponent> = {
  "cover-engraving-01": CoverEngraving01,
  "cover-engraving-02": CoverEngraving02,
  "cover-engraving-03": CoverEngraving03,
  "cover-engraving-04": CoverEngraving04,
  "page2-engraving-01": Page2Engraving01,
  "page2-engraving-02": Page2Engraving02,
  "page2-engraving-03": Page2Engraving03,
  "page2-engraving-04": Page2Engraving04,
  "page3-engraving-01": Page3Engraving01,
  "page3-engraving-02": Page3Engraving02,
};

export function engravingKindFor(id: string | null | undefined): EngravingKind | null {
  if (!id) return null;
  for (const options of Object.values(ENGRAVING_OPTIONS_BY_PAGE)) {
    const found = options.find((o) => o.id === id);
    if (found) return found.kind;
  }
  return null;
}
