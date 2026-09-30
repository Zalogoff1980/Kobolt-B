"use client";

import type { ReactElement } from "react";

/**
 * Галерея готовых лэйаутов для ВНОВЬ добавленной страницы (QA, фишка
 * дня: "2. Связанная задача. Реализовать проработанные страницы как
 * отдельное окно/раздел (моб/десктоп соответственно) с вариантами
 * компоновки, сетки, структуры. Иконки шаблонов выполнить схематично
 * согласно проработанным лэйаутам").
 *
 * Показывается ТОЛЬКО для добавленной оператором страницы (5+), пока у
 * неё ещё нет выбранного шаблона — обычный узкий TemplatePicker
 * (кнопки-ярлычки) остаётся единственным способом сменить шаблон везде
 * ещё, включая уже выбранный шаблон этой же страницы (QA-уточнение:
 * "только для новой страницы", а не редизайн TemplatePicker
 * повсеместно).
 *
 * Карточки крупные и с настоящей схемой раскладки (не просто текст),
 * чтобы оператор видел структуру до выбора: прямоугольник — фото/текст-
 * блок, тонкие линии — строки текста. Сетка сама адаптируется под
 * ширину экрана (1 колонка на телефоне, 2 — от sm и шире), отдельного
 * mobile/desktop-компонента не потребовалось.
 */

type GalleryOption = {
  id: string;
  label: string;
  description: string;
  Icon: () => ReactElement;
};

function ThemePhotoIcon() {
  return (
    <svg viewBox="0 0 120 90" className="h-full w-full" aria-hidden>
      <rect x="4" y="4" width="112" height="82" rx="2" fill="none" stroke="currentColor" strokeOpacity="0.25" />
      {/* Широкий кадр-баннер сверху */}
      <rect x="10" y="10" width="100" height="42" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeOpacity="0.5" />
      {/* Текст одной колонкой под фото */}
      <rect x="10" y="58" width="100" height="5" fill="currentColor" fillOpacity="0.55" />
      <rect x="10" y="67" width="80" height="3.5" fill="currentColor" fillOpacity="0.3" />
      <rect x="10" y="74" width="90" height="3.5" fill="currentColor" fillOpacity="0.3" />
      <rect x="10" y="81" width="60" height="3.5" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

function ThemeTextPhotosIcon() {
  return (
    <svg viewBox="0 0 120 90" className="h-full w-full" aria-hidden>
      <rect x="4" y="4" width="112" height="82" rx="2" fill="none" stroke="currentColor" strokeOpacity="0.25" />
      {/* Текст — широкая колонка слева */}
      <rect x="10" y="10" width="64" height="5" fill="currentColor" fillOpacity="0.55" />
      <rect x="10" y="19" width="64" height="3.5" fill="currentColor" fillOpacity="0.3" />
      <rect x="10" y="26" width="64" height="3.5" fill="currentColor" fillOpacity="0.3" />
      <rect x="10" y="33" width="50" height="3.5" fill="currentColor" fillOpacity="0.3" />
      <rect x="10" y="40" width="64" height="3.5" fill="currentColor" fillOpacity="0.3" />
      <rect x="10" y="47" width="40" height="3.5" fill="currentColor" fillOpacity="0.3" />
      {/* Рельса из трёх кадров справа */}
      <rect x="82" y="10" width="28" height="12" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeOpacity="0.5" />
      <rect x="82" y="24" width="28" height="12" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeOpacity="0.5" />
      <rect x="82" y="38" width="28" height="12" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeOpacity="0.5" />
      {/* Открытка на всю ширину под дивайдером */}
      <line x1="10" y1="58" x2="110" y2="58" stroke="currentColor" strokeOpacity="0.4" />
      <rect x="10" y="63" width="100" height="19" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeOpacity="0.4" />
    </svg>
  );
}

const GALLERY_OPTIONS: GalleryOption[] = [
  {
    id: "theme-photo-v1",
    label: "Большое фото + текст",
    description: "Один широкий кадр-баннер сверху, под ним — текст статьи одной колонкой.",
    Icon: ThemePhotoIcon,
  },
  {
    id: "theme-text-photos-v1",
    label: "Текст + 2–3 фото + открытка",
    description: "Текст слева, рельса из трёх кадров справа, снизу — открытка на всю ширину.",
    Icon: ThemeTextPhotosIcon,
  },
];

export function TemplateGallery({
  onSelect,
}: {
  onSelect: (templateId: string) => void;
}) {
  return (
    <section
      data-testid="template-gallery"
      className="overflow-hidden rounded-panel border border-ink/15 bg-paper shadow-[0_1px_2px_rgba(22,21,17,0.06)]"
    >
      <h3 className="border-b border-ink/10 px-4 py-3 font-body text-[15px] font-bold text-ink">
        Новая страница — выберите раскладку
      </h3>
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        {GALLERY_OPTIONS.map(({ id, label, description, Icon }) => (
          <button
            key={id}
            type="button"
            data-testid={`template-gallery-option-${id}`}
            onClick={() => onSelect(id)}
            className="flex flex-col overflow-hidden rounded-control border border-ink/15 bg-chrome/30 text-left transition-colors hover:border-ink/40 hover:bg-chrome/60"
          >
            <div className="aspect-[120/90] w-full p-3 text-olive">
              <Icon />
            </div>
            <div className="border-t border-ink/10 bg-paper px-3 py-2.5">
              <p className="font-display text-xs font-bold uppercase tracking-wide text-ink">{label}</p>
              <p className="mt-1 text-[11px] leading-snug text-olive-dim">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
