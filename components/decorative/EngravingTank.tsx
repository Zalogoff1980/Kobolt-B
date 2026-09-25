/**
 * Лёгкий гравюрный контурный силуэт — декоративный фоновый элемент
 * (ТЗ п.11: "гравюра танка, контурная техника"). Это собственная
 * линейная иллюстрация, а не воспроизведение референсных фотографий:
 * референсы задают композицию и стиль издания, а не растровый контент.
 * Только stroke, без заливки — не должен спорить с текстом поверх.
 */
export function EngravingTank({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 160"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Корпус */}
      <path d="M40 120 L70 95 L280 95 L320 118 L320 132 L40 132 Z" />
      {/* Башня */}
      <path d="M150 95 L165 68 L235 68 L248 95" />
      {/* Ствол */}
      <path d="M235 78 L340 70" />
      {/* Гусеница */}
      <path d="M30 132 L330 132" />
      <circle cx="55" cy="134" r="10" />
      <circle cx="90" cy="134" r="10" />
      <circle cx="125" cy="134" r="10" />
      <circle cx="160" cy="134" r="10" />
      <circle cx="195" cy="134" r="10" />
      <circle cx="230" cy="134" r="10" />
      <circle cx="265" cy="134" r="10" />
      <circle cx="300" cy="134" r="10" />
      {/* Штриховка неба — характерный гравюрный приём */}
      <path d="M0 30 L400 10" opacity="0.35" />
      <path d="M0 45 L400 25" opacity="0.25" />
      <path d="M0 60 L400 40" opacity="0.15" />
    </svg>
  );
}
