"use client";

import { ReactNode } from "react";
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
    <span className="ml-2 rounded-hairline border border-olive-dim/40 px-1 py-0.5 font-display text-[7px] font-bold uppercase tracking-wide text-olive-dim">
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
    <label className="block">
      <span className="font-display text-[10px] font-bold uppercase tracking-wide text-olive">
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
  "w-full appearance-none rounded-hairline border border-ink/20 bg-white/60 px-2 py-1.5 font-body text-sm text-ink outline-none focus:border-accent";

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
      className={`appearance-none rounded-hairline border border-ink/20 px-2 py-1 text-xs text-olive-dim hover:border-ink/40 disabled:opacity-30 ${
        props.className ?? ""
      }`}
    >
      {children}
    </button>
  );
}

export function SectionHeading({ children, zone }: { children: ReactNode; zone?: string }) {
  return (
    <h3 className="flex items-center border-b border-ink/10 pb-1 font-display text-xs font-bold uppercase tracking-wide text-ink">
      {children}
      {zone && <ZoneTag zone={zone} />}
    </h3>
  );
}
