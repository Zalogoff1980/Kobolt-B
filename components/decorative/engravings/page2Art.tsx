/**
 * 4 готовые иллюстрации фоновой гравюры для страницы 2 ("История"),
 * предоставленные напрямую пользователем — не генерируются заново и
 * не перекомпонуются, используются как есть (public/engravings/*.jpg).
 * Тот же паттерн, что и у CoverEngraving0N (coverArt.tsx) — отдельный
 * файл для страницы 2, а не переиспользование имён компонентов
 * обложки, потому что это разные, не взаимозаменяемые наборы
 * изображений (реестр registry.tsx различает их только по id, а не по
 * структуре компонента).
 */
export function Page2Engraving01({ className = "" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/engravings/page2-engraving-01.jpg" alt="" className={className} />;
}

export function Page2Engraving02({ className = "" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/engravings/page2-engraving-02.jpg" alt="" className={className} />;
}

export function Page2Engraving03({ className = "" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/engravings/page2-engraving-03.jpg" alt="" className={className} />;
}

export function Page2Engraving04({ className = "" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/engravings/page2-engraving-04.jpg" alt="" className={className} />;
}
