/** Доступные шаблоны по номеру страницы (ТЗ шага 7, п.4) — источник
 *  истины для TemplatePicker и для проверки "шаблон существует".
 *  Ключи 1–4 — фирменные страницы выпуска (обложка/"История"/тема/
 *  "Лица"). Любая добавленная сверх них страница (5, 6, …) — не
 *  отдельная запись здесь: она использует набор страницы 3 (см.
 *  templateOptionsFor ниже и isExtraPage/A4Page.tsx) — тот же смысл,
 *  что и "просто ещё одна внутренняя полоса", без привязки к
 *  конкретному номеру. */
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
    { id: "theme-text-photos-v1", label: "Текст + 2–3 фото + открытка" },
  ],
  4: [
    { id: "person-feature-v1", label: "Лицо" },
    { id: "team-faces-v1", label: "Команда" },
  ],
};

/** true для любой страницы сверх фирменных 1–4 (QA: "добавить новую
 *  страницу... без жёсткого лимита") — такая страница всегда "как
 *  внутренние страницы" и пользуется ТЕМ ЖЕ набором шаблонов, что и
 *  страница 3 (Большое фото+текст / Текст+фото+открытка), а не своим
 *  собственным контентным устройством (без именинников как у стр. 2,
 *  без команды/достижений как у стр. 4). */
export function isExtraPage(pageNumber: number): boolean {
  return pageNumber > 4;
}

/** Варианты шаблона для страницы — обёртка над TEMPLATE_OPTIONS, что
 *  умеет и в добавленные страницы (5+): для них возвращает тот же
 *  список, что и для страницы 3. */
export function templateOptionsFor(
  pageNumber: number,
  currentTemplateId?: string | null
): { id: string; label: string }[] {
  const base = isExtraPage(pageNumber)
    ? TEMPLATE_OPTIONS[3]
    : TEMPLATE_OPTIONS[pageNumber as 1 | 2 | 3 | 4] ?? TEMPLATE_OPTIONS[3];
  // После удаления страницы остальные перенумеровываются, и страница
  // может оказаться под номером, "чужим" для её шаблона (например,
  // "Лица" вместо 4 стали страницей 3). Тогда показываем набор, к
  // которому относится её текущий шаблон, чтобы выбранный шаблон не
  // пропал из переключателя.
  if (currentTemplateId && pageNumber > 1 && !base.some((t) => t.id === currentTemplateId)) {
    const family = ([2, 3, 4] as const)
      .map((n) => TEMPLATE_OPTIONS[n])
      .find((options) => options.some((t) => t.id === currentTemplateId));
    if (family) return family;
  }
  return base;
}

/** Сколько фото имеет смысл держать в редакторе для конкретного
 *  шаблона, и нужны ли поля имя/должность (страница 4). Значение
 *  информирует ТОЛЬКО интерфейс редактора (сколько слотов показать) —
 *  сам шаблон и так использует лишь photos[0], photos.slice(0,3) или
 *  photos.slice(0,3)/photos[3] (страница 3 и любая добавленная сверх
 *  4, "Текст + фото" — см. ThemeTextPhotos), так что это не меняет
 *  поведение рендера, только удобство ввода. */
export function photoConfigFor(
  pageNumber: number,
  templateId: string | null
): { maxCount?: number; showPersonFields: boolean } {
  // Настройки зависят только от templateId (id шаблонов уникальны), а
  // не от номера страницы: после удаления страницы номера сдвигаются, и
  // шаблон может оказаться на другом номере. pageNumber оставлен в
  // сигнатуре, чтобы не менять вызовы.
  void pageNumber;
  if (templateId === "article-photo-v1") return { maxCount: 1, showPersonFields: false };
  if (templateId === "photo-grid-v1") return { maxCount: undefined, showPersonFields: false };
  if (templateId === "theme-photo-v1") return { maxCount: 1, showPersonFields: false };
  // Рельса жёстко ограничена тремя кадрами; 4-е фото — отдельная
  // открытка на всю ширину под дивайдером, без обрезания (QA: "три
  // вертикальных фото и отдельный блок... открытка", photos[3] в
  // ThemeTextPhotos) — отдельный слот сверх рельсы, а не расширение
  // самой рельсы до 4 кадров.
  if (templateId === "theme-text-photos-v1") return { maxCount: 4, showPersonFields: false };
  if (templateId === "person-feature-v1") return { maxCount: 1, showPersonFields: true };
  if (templateId === "team-faces-v1") return { maxCount: 3, showPersonFields: true };
  return { maxCount: undefined, showPersonFields: false };
}

export const PAGE_DEFAULT_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: "Обложка",
  2: "Страница 2",
  3: "Страница 3",
  4: "Страница 4",
};

/** Подпись страницы, когда у неё ещё нет собственного заголовка —
 *  обёртка над PAGE_DEFAULT_LABEL, что умеет и в добавленные страницы
 *  (5+): для них просто "Страница N". */
export function pageDefaultLabel(pageNumber: number): string {
  return PAGE_DEFAULT_LABEL[pageNumber as 1 | 2 | 3 | 4] ?? `Страница ${pageNumber}`;
}
