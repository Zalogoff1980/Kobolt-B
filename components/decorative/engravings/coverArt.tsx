/**
 * 4 готовые иллюстрации фоновой гравюры для обложки (Page 1),
 * предоставленные напрямую пользователем — не генерируются заново и
 * не перекомпонуются, используются как есть (public/engravings/*.jpg).
 *
 * В отличие от абстрактных line-art мотивов (motifs.tsx, подготовлены
 * для будущего PRIORITY 6 на страницах 2–4, но пока НЕ включены в
 * ENGRAVING_OPTIONS — сознательно отложено), это полноценные
 * детализированные иллюстрации на всю страницу, поэтому рендерятся
 * иначе: BackgroundEngraving распознаёт kind: "cover-art" и растягивает
 * их на всю страницу (object-cover), а не как мелкую иконку-водяной
 * знак по центру — см. BackgroundEngraving.tsx.
 */
export function CoverEngraving01({ className = "" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/engravings/cover-engraving-01.jpg" alt="" className={className} />;
}

export function CoverEngraving02({ className = "" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/engravings/cover-engraving-02.jpg" alt="" className={className} />;
}

export function CoverEngraving03({ className = "" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/engravings/cover-engraving-03.jpg" alt="" className={className} />;
}

export function CoverEngraving04({ className = "" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/engravings/cover-engraving-04.jpg" alt="" className={className} />;
}
