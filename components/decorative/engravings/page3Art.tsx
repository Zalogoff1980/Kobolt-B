/**
 * Иллюстрации фоновой гравюры для страницы 3, предоставленные напрямую
 * пользователем — не генерируются заново и не перекомпонуются,
 * используются как есть (public/engravings/*.jpg). Тот же паттерн, что
 * и у CoverEngraving0N (coverArt.tsx) и Page2Engraving0N (page2Art.tsx)
 * — отдельный файл на страницу, а не переиспользование имён компонентов
 * других страниц, потому что это разные, не взаимозаменяемые наборы
 * изображений (реестр registry.tsx различает их только по id, а не по
 * структуре компонента).
 *
 * Пока 2 варианта (не 4, как у страниц 1 и 2) — ровно столько
 * предоставлено; добавить ещё варианты позже можно тем же приёмом, без
 * переработки существующих.
 */
export function Page3Engraving01({ className = "" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/engravings/page3-engraving-01.jpg" alt="" className={className} />;
}

export function Page3Engraving02({ className = "" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/engravings/page3-engraving-02.jpg" alt="" className={className} />;
}
