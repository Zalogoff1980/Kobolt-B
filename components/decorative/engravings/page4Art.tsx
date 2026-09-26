/**
 * Иллюстрации фоновой гравюры для страницы 4 ("Команда"), предоставленные
 * напрямую пользователем — не генерируются заново и не перекомпонуются,
 * используются как есть (public/engravings/*.jpg). Тот же паттерн, что
 * и у CoverEngraving0N/Page2Engraving0N/Page3Engraving0N — отдельный
 * файл на страницу, а не переиспользование имён компонентов других
 * страниц, потому что это разные, не взаимозаменяемые наборы
 * изображений (реестр registry.tsx различает их только по id, а не по
 * структуре компонента).
 */
export function Page4Engraving01({ className = "" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/engravings/page4-engraving-01.jpg" alt="" className={className} />;
}

export function Page4Engraving02({ className = "" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/engravings/page4-engraving-02.jpg" alt="" className={className} />;
}
