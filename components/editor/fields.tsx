"use client";

import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";
import { ZONE_LABELS } from "./guides/ContentZoneOverlay";

/** Общие примитивы полей редактора — единообразный минималистичный
 *  вид форм, без превращения интерфейса в "конструктор дизайна" (ТЗ
 *  шага 7, п.5: "не превращать каждый декоративный элемент в поле"). */

/** Маленькая метка зоны (H1/H2/ЛИД/ФОТО/ЦИТАТА/…) — те же подписи, что
 *  рисует ContentZoneOverlay поверх превью (см. ZONE_LABELS), поэтому
 *  оператор может напрямую сопоставить поле формы с блоком на
 *  странице, а не гадать по названию поля. */
function ZoneTag({ zone }: { zone: string }) {
  return (
    <span className="ml-2 rounded-hairline border border-olive-dim/40 px-1 py-0.5 font-display text-[8px] font-bold uppercase tracking-wide text-olive-dim">
      {ZONE_LABELS[zone] ?? zone.toUpperCase()}
    </span>
  );
}

export function Field({
  label,
  zone,
  children,
}: {
  label: string;
  /** data-zone этого поля на самой странице (см. ContentZoneOverlay) —
   *  необязателен: не у каждого поля формы есть зона (например, номер
   *  выпуска или дата — это не Content Zone, а метаданные). */
  zone?: string;
  children: ReactNode;
}) {
  return (
    // data-form-zone — метка "этому полю соответствует блок страницы с
    // таким data-zone": по ней клик по блоку в превью находит поле
    // (см. handlePreviewClick в app/issues/[issueId]/page.tsx).
    <label className="block" data-form-zone={zone}>
      <span className="font-body text-xs font-semibold text-olive">
        {label}
        {zone && <ZoneTag zone={zone} />}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

// appearance-none сбрасывает нативный UA-стиль мобильных браузеров
// (Android Chrome иначе рисует свои скругления/тени поверх инпутов,
// textarea, <input type="date/file"> и кнопок — источник "топорных"
// скруглений, о которых шла речь: не CSS-скругление приложения, а
// платформенный chrome, который никогда явно не сбрасывался).
// rounded-hairline — системный радиус для тонко обведённых элементов
// (design token, tailwind.config.ts), а не hardcoded px и не 0.
const inputClass =
  "w-full appearance-none rounded-control border border-ink/15 bg-chrome/40 px-3 py-2 font-body text-sm text-ink outline-none placeholder:text-olive-dim/60 focus:border-ink/50 focus:bg-paper";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} resize-y ${props.className ?? ""}`} />;
}

export function SmallButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`h-8 appearance-none rounded-control border border-ink/20 bg-paper px-3 font-body text-xs font-semibold text-ink hover:border-ink/40 hover:bg-chrome/60 disabled:opacity-30 ${
        props.className ?? ""
      }`}
    >
      {children}
    </button>
  );
}

export function SectionHeading({ children, zone }: { children: ReactNode; zone?: string }) {
  return (
    <h3 className="flex items-center border-b border-ink/10 pb-2 font-body text-sm font-bold text-ink">
      {children}
      {zone && <ZoneTag zone={zone} />}
    </h3>
  );
}


/* ---------- Свёртываемые секции формы ---------- */

/** Состояние свёрнутости живёт НАД формами (в редакторе выпуска), а не
 *  внутри каждой секции: так выбор оператора ("это уже заполнил —
 *  свернул") переживает переключение страниц, а "Свернуть все /
 *  Развернуть все" достаёт сразу все секции, не зная их списка.
 *  Модель: по умолчанию все секции развёрнуты; overrides — точечные
 *  исключения поверх общего значения `allCollapsed`. */
type FormSectionsState = {
  isCollapsed: (id: string) => boolean;
  toggle: (id: string) => void;
  setAll: (collapsed: boolean) => void;
};

const FormSectionsContext = createContext<FormSectionsState>({
  isCollapsed: () => false,
  toggle: () => {},
  setAll: () => {},
});

export function FormSectionsProvider({ children }: { children: ReactNode }) {
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const isCollapsed = useCallback(
    (id: string) => overrides[id] ?? allCollapsed,
    [overrides, allCollapsed]
  );
  const toggle = useCallback(
    (id: string) => setOverrides((o) => ({ ...o, [id]: !(o[id] ?? allCollapsed) })),
    [allCollapsed]
  );
  const setAll = useCallback((collapsed: boolean) => {
    setAllCollapsed(collapsed);
    setOverrides({});
  }, []);

  const value = useMemo(() => ({ isCollapsed, toggle, setAll }), [isCollapsed, toggle, setAll]);
  return <FormSectionsContext.Provider value={value}>{children}</FormSectionsContext.Provider>;
}

/** Секция формы со сворачиванием. Заголовок — кнопка на всю ширину
 *  (удобно попадать пальцем), справа — статус: "✓" если секция
 *  заполнена и "○" если пуста, плюс короткая сводка ("2 шт."), чтобы
 *  и в свёрнутом виде было видно, что в ней есть. */
export function FormSection({
  id,
  title,
  zone,
  filled,
  summary,
  children,
  className = "space-y-2",
}: {
  id: string;
  title: string;
  /** data-zone соответствующего блока страницы (см. ContentZoneOverlay). */
  zone?: string;
  /** Есть ли в секции хоть что-то введённое; undefined — статус не показываем. */
  filled?: boolean;
  summary?: string;
  children: ReactNode;
  className?: string;
}) {
  const { isCollapsed, toggle } = useContext(FormSectionsContext);
  const collapsed = isCollapsed(id);

  return (
    <section
      data-form-section={id}
      data-form-zone={zone}
      data-collapsed={collapsed}
      className="overflow-hidden rounded-panel border border-ink/15 bg-paper shadow-[0_1px_2px_rgba(22,21,17,0.06)]"
    >
      <h3 className={collapsed ? "" : "border-b border-ink/10"}>
        <button
          type="button"
          onClick={() => toggle(id)}
          aria-expanded={!collapsed}
          data-testid={`section-toggle-${id}`}
          className="flex min-h-[48px] w-full appearance-none items-center gap-2 px-4 py-2 text-left font-body text-[15px] font-bold text-ink hover:bg-chrome/30"
        >
          <span aria-hidden className="w-3 flex-shrink-0 text-olive-dim">
            {collapsed ? "▸" : "▾"}
          </span>
          <span className="flex items-center">
            {title}
            {zone && <ZoneTag zone={zone} />}
          </span>
          {filled !== undefined && (
            <span
              className={`ml-auto flex-shrink-0 font-body text-xs font-normal ${
                filled ? "text-olive" : "text-olive-dim/70"
              }`}
            >
              {summary ? `${summary} ` : ""}
              {filled ? "✓" : "○"}
            </span>
          )}
        </button>
      </h3>
      <div hidden={collapsed} className={`p-4 ${className}`}>
        {children}
      </div>
    </section>
  );
}

/** "Свернуть все · Развернуть все" — вверху формы: на телефоне форма
 *  длинная, и оператору проще свернуть всё и раскрыть только нужное. */
export function FormSectionsToolbar() {
  const { setAll } = useContext(FormSectionsContext);
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        data-testid="sections-collapse-all"
        onClick={() => setAll(true)}
        className="h-7 appearance-none rounded-control border border-ink/15 bg-paper px-3 font-body text-xs font-semibold text-olive-dim hover:border-ink/40 hover:text-ink"
      >
        Свернуть все
      </button>
      <button
        type="button"
        data-testid="sections-expand-all"
        onClick={() => setAll(false)}
        className="h-7 appearance-none rounded-control border border-ink/15 bg-paper px-3 font-body text-xs font-semibold text-olive-dim hover:border-ink/40 hover:text-ink"
      >
        Развернуть все
      </button>
    </div>
  );
}
