import { ENGRAVING_COMPONENTS, engravingKindFor } from "./engravings/registry";

/**
 * Фоновая гравюра страницы (PRIORITY 6 — реализация для Page 1).
 *
 * Рендерится ПЕРВЫМ ребёнком внутри PageFrame (см. PageFrame.tsx),
 * то есть визуально позади всего остального контента страницы — сама
 * иллюстрация не позиционирована и не влияет на layout/раскладку
 * контента (ContentBlock/templateId/Content Zones не трогаются, см.
 * PageFrame.tsx и все места, где backgroundEngravingId пробрасывается
 * дальше — это ВСЕГДА отдельный необязательный проп, ничего не меняющий
 * в остальной разметке). Рендерится в ТОМ ЖЕ A4Page, что и live preview,
 * и в /api/pdf (renderIssueHtml.tsx инлайнит src в base64 для печати) —
 * поэтому попадает в оба места одинаково, без отдельной "версии для PDF".
 *
 * `id === null` (значение по умолчанию для всех старых и новых
 * страниц) — рендерит null: без выбранной гравюры внешний вид
 * страницы не меняется ни на пиксель по сравнению с тем, что было до
 * появления этой фичи.
 */
export function BackgroundEngraving({ id }: { id: string | null | undefined }) {
  if (!id) return null;
  const Motif = ENGRAVING_COMPONENTS[id];
  if (!Motif) return null;
  const kind = engravingKindFor(id);

  if (kind === "cover-art") {
    // Полноценная иллюстрация на всю страницу — под контентом, но
    // приглушённая (25% непрозрачности), чтобы текст поверх оставался
    // читаемым и гравюра работала как фон, а не спорила с контентом.
    return (
      <div
        className="absolute inset-0 overflow-hidden opacity-25"
        aria-hidden="true"
        data-testid="background-engraving"
        data-engraving-id={id}
      >
        <Motif className="h-full w-full object-cover" />
      </div>
    );
  }

  // "icon" — мелкий line-art мотив по центру, очень низкая
  // непрозрачность (задел под будущую библиотеку из motifs.tsx).
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      aria-hidden="true"
      data-testid="background-engraving"
      data-engraving-id={id}
    >
      <Motif className="h-[70%] w-[85%] text-olive opacity-[0.06]" />
    </div>
  );
}
