/** Доступные шаблоны по номеру страницы (ТЗ шага 7, п.4) — источник
 *  истины для TemplatePicker и для проверки "шаблон существует". */
export const TEMPLATE_OPTIONS: Record<1 | 2 | 3 | 4, { id: string; label: string }[]> = {
  1: [
    { id: "cover-v1", label: "Обложка" },
    { id: "cover-v2", label: "Боевой листок" },
  ],
  2: [
    { id: "article-photo-v1", label: "Статья + большое фото" },
    { id: "photo-grid-v1", label: "Несколько фото + текст" },
  ],
  3: [
    { id: "theme-photo-v1", label: "Большое фото + текст" },
    { id: "theme-text-photos-v1", label: "Текст + 2–3 фото" },
  ],
  4: [
    { id: "person-feature-v1", label: "Лицо" },
    { id: "team-faces-v1", label: "Команда" },
  ],
};

/** Сколько фото имеет смысл держать в редакторе для конкретного
 *  шаблона, и нужны ли поля имя/должность (страница 4). Значение
 *  информирует ТОЛЬКО интерфейс редактора (сколько слотов показать) —
 *  сам шаблон и так использует лишь photos[0] или photos.slice(0,3),
 *  так что это не меняет поведение рендера, только удобство ввода. */
export function photoConfigFor(
  pageNumber: 1 | 2 | 3 | 4,
  templateId: string | null
): { maxCount?: number; showPersonFields: boolean } {
  if (pageNumber === 2 && templateId === "article-photo-v1") return { maxCount: 1, showPersonFields: false };
  if (pageNumber === 2 && templateId === "photo-grid-v1") return { maxCount: undefined, showPersonFields: false };
  if (pageNumber === 3 && templateId === "theme-photo-v1") return { maxCount: 1, showPersonFields: false };
  if (pageNumber === 3 && templateId === "theme-text-photos-v1") return { maxCount: 3, showPersonFields: false };
  if (pageNumber === 4 && templateId === "person-feature-v1") return { maxCount: 1, showPersonFields: true };
  if (pageNumber === 4 && templateId === "team-faces-v1") return { maxCount: 3, showPersonFields: true };
  return { maxCount: undefined, showPersonFields: false };
}

export const PAGE_DEFAULT_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: "Обложка",
  2: "Страница 2",
  3: "Страница 3",
  4: "Страница 4",
};
