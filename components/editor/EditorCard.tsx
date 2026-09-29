import { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Карточка-панель редактора в стиле Vercel ("Production Deployment"):
 * тонкая рамка и мягкий радиус, заголовок отдельной строкой над
 * разделителем, ниже — тело. Используется для блоков "Шаблон страницы"
 * и "Фон страницы" в боковой панели.
 */
export function EditorCard({
  title,
  children,
  testId,
}: {
  title: string;
  children: ReactNode;
  testId?: string;
}) {
  return (
    <section
      data-testid={testId}
      className="overflow-hidden rounded-panel border border-ink/15 bg-paper shadow-[0_1px_2px_rgba(22,21,17,0.06)]"
    >
      <h3 className="border-b border-ink/10 px-4 py-3 font-body text-[15px] font-bold text-ink">
        {title}
      </h3>
      <div className="p-4">{children}</div>
    </section>
  );
}

/**
 * Узкая кнопка карточки. Выбранная — тёмная сплошная (как "Visit" у
 * Vercel), остальные — с тонкой обводкой (как "Instant Rollback").
 */
export function CardButton({
  selected = false,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      {...props}
      className={`h-8 appearance-none rounded-control border px-3 font-body text-xs font-semibold ${
        selected
          ? "border-ink bg-ink text-paper"
          : "border-ink/20 bg-paper text-ink hover:border-ink/40 hover:bg-chrome/60"
      } ${className}`}
    >
      {children}
    </button>
  );
}
