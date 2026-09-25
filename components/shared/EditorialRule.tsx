/**
 * Разделительная линия редакционной сетки (ТЗ п.10). Переиспользуемый
 * примитив — а не одноразовый div внутри каждого блока, чтобы толщина
 * и цвет линий были согласованы по всему изданию из одного места.
 */
export function EditorialRule({
  variant = "thin",
  className = "",
}: {
  variant?: "thin" | "accent" | "double";
  className?: string;
}) {
  if (variant === "double") {
    return (
      <div className={className}>
        <div className="h-[2px] bg-ink" />
        <div className="mt-[1.5px] h-px bg-ink/40" />
      </div>
    );
  }
  if (variant === "accent") {
    return <div className={`h-[2px] bg-accent ${className}`} />;
  }
  return <div className={`h-px bg-ink/25 ${className}`} />;
}
