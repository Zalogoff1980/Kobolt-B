/**
 * Библиотека фоновых гравюр (PRIORITY 6 — реализация).
 *
 * 16 самостоятельных контурных иллюстраций в том же изобразительном
 * языке, что и `EngravingTank` (см. components/decorative/EngravingTank.tsx):
 * только stroke="currentColor", без заливки, округлые концы линий —
 * собственная линейная графика издания, а не растровые референсы.
 *
 * Каждый мотив — независимый компонент с сигнатурой `{ className }`,
 * пробрасываемой прямо на корневой <svg>, — тот же вызов, что и у
 * EngravingTank (`<Motif className="... text-olive/30" />`), чтобы
 * BackgroundEngraving и любой другой код могли использовать все 17
 * (16 + сам EngravingTank) единообразно.
 *
 * Это НАМЕРЕННО простая, стилизованная линейная графика (не
 * фотореалистичные иллюстрации) — фон работает на очень низкой
 * непрозрачности (см. BackgroundEngraving), деталь важнее не точности
 * силуэта, а того, чтобы 16 фонов ощутимо отличались друг от друга.
 */

type MotifProps = { className?: string };

const svgBase = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.4",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function EngravingCompass({ className = "" }: MotifProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} {...svgBase}>
      <circle cx="100" cy="100" r="85" />
      <circle cx="100" cy="100" r="68" opacity="0.5" />
      <path d="M100 15 L100 40 M100 160 L100 185 M15 100 L40 100 M160 100 L185 100" />
      <path d="M100 30 L112 100 L100 170 L88 100 Z" />
      <path d="M30 100 L100 88 L170 100 L100 112 Z" opacity="0.4" />
      <circle cx="100" cy="100" r="5" />
    </svg>
  );
}

export function EngravingTopo({ className = "" }: MotifProps) {
  return (
    <svg viewBox="0 0 240 160" className={className} {...svgBase}>
      <path d="M10 130 Q60 80 120 110 T240 90" />
      <path d="M0 105 Q70 60 130 90 T240 65" opacity="0.7" />
      <path d="M0 80 Q80 40 140 68 T240 40" opacity="0.5" />
      <path d="M10 55 Q90 20 150 45 T240 18" opacity="0.3" />
    </svg>
  );
}

export function EngravingLaurel({ className = "" }: MotifProps) {
  const leaves = (side: 1 | -1) =>
    Array.from({ length: 6 }, (_, i) => {
      const y = 20 + i * 22;
      const x = 100 + side * (18 + i * 4);
      return <ellipse key={i} cx={x} cy={y} rx="10" ry="16" transform={`rotate(${side * 35} ${x} ${y})`} />;
    });
  return (
    <svg viewBox="0 0 200 200" className={className} {...svgBase}>
      <path d="M100 20 Q60 100 100 175" />
      <path d="M100 20 Q140 100 100 175" />
      {leaves(-1)}
      {leaves(1)}
    </svg>
  );
}

export function EngravingStar({ className = "" }: MotifProps) {
  const points = Array.from({ length: 5 }, (_, i) => {
    const outerAngle = (Math.PI / 2) + (i * 2 * Math.PI) / 5;
    const innerAngle = outerAngle + Math.PI / 5;
    return { ox: 100 + 80 * Math.cos(outerAngle), oy: 100 - 80 * Math.sin(outerAngle), ix: 100 + 32 * Math.cos(innerAngle), iy: 100 - 32 * Math.sin(innerAngle) };
  });
  const path =
    points.map((p, i) => `${i === 0 ? "M" : "L"}${p.ox.toFixed(1)} ${p.oy.toFixed(1)} L${p.ix.toFixed(1)} ${p.iy.toFixed(1)}`).join(" ") + " Z";
  return (
    <svg viewBox="0 0 200 200" className={className} {...svgBase}>
      <path d={path} />
      <circle cx="100" cy="100" r="95" opacity="0.25" />
    </svg>
  );
}

export function EngravingRadioTower({ className = "" }: MotifProps) {
  return (
    <svg viewBox="0 0 160 220" className={className} {...svgBase}>
      <path d="M80 20 L30 200 M80 20 L130 200 M55 110 L105 110 M45 150 L115 150" />
      <path d="M80 20 L80 6" />
      <path d="M60 6 Q80 -8 100 6" opacity="0.6" />
      <path d="M50 -2 Q80 -22 110 -2" opacity="0.35" />
      <circle cx="80" cy="20" r="4" />
    </svg>
  );
}

export function EngravingWatchtower({ className = "" }: MotifProps) {
  return (
    <svg viewBox="0 0 180 220" className={className} {...svgBase}>
      <path d="M40 210 L70 60 L110 60 L140 210" />
      <path d="M55 140 L125 140 M50 170 L130 170" />
      <path d="M55 60 L55 20 L125 20 L125 60" />
      <path d="M55 20 L40 0 M125 20 L140 0 M90 20 L90 -8" opacity="0.5" />
      <path d="M65 100 L75 90 L85 100 M95 100 L105 90 L115 90" opacity="0.6" />
    </svg>
  );
}

export function EngravingTracks({ className = "" }: MotifProps) {
  return (
    <svg viewBox="0 0 320 80" className={className} {...svgBase}>
      <path d="M10 20 L310 20 M10 60 L310 60" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={20 + i * 26} y1="20" x2={20 + i * 26} y2="60" />
      ))}
    </svg>
  );
}

export function EngravingBinoculars({ className = "" }: MotifProps) {
  return (
    <svg viewBox="0 0 220 140" className={className} {...svgBase}>
      <circle cx="65" cy="80" r="38" />
      <circle cx="155" cy="80" r="38" />
      <path d="M95 60 L125 60 M100 45 L120 45" />
      <path d="M65 42 L65 25 M155 42 L155 25" />
      <circle cx="65" cy="80" r="16" opacity="0.4" />
      <circle cx="155" cy="80" r="16" opacity="0.4" />
    </svg>
  );
}

export function EngravingMapGrid({ className = "" }: MotifProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} {...svgBase}>
      {Array.from({ length: 5 }, (_, i) => (
        <line key={`v${i}`} x1={20 + i * 40} y1="10" x2={20 + i * 40} y2="190" opacity="0.5" />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <line key={`h${i}`} x1="10" y1={20 + i * 40} x2="190" y2={20 + i * 40} opacity="0.5" />
      ))}
      <path d="M100 60 L100 140 M60 100 L140 100" />
      <circle cx="100" cy="100" r="10" />
    </svg>
  );
}

export function EngravingMountains({ className = "" }: MotifProps) {
  return (
    <svg viewBox="0 0 320 140" className={className} {...svgBase}>
      <path d="M0 130 L60 40 L100 90 L150 20 L210 100 L250 55 L320 130" />
      <path d="M0 130 L320 130" opacity="0.4" />
      <path d="M40 60 L52 48 M140 40 L152 28" opacity="0.4" />
    </svg>
  );
}

export function EngravingOakBranch({ className = "" }: MotifProps) {
  const leaf = (x: number, y: number, r: number) => (
    <path key={`${x}-${y}`} d={`M${x} ${y} q10 -18 20 0 q-10 18 -20 0 Z`} transform={`rotate(${r} ${x} ${y})`} />
  );
  return (
    <svg viewBox="0 0 220 140" className={className} {...svgBase}>
      <path d="M10 120 Q110 100 210 30" />
      {leaf(50, 105, -20)}
      {leaf(90, 90, -35)}
      {leaf(130, 68, -50)}
      {leaf(170, 45, -65)}
      <circle cx="30" cy="118" r="8" />
      <circle cx="20" cy="128" r="8" opacity="0.6" />
    </svg>
  );
}

export function EngravingShell({ className = "" }: MotifProps) {
  return (
    <svg viewBox="0 0 100 220" className={className} {...svgBase}>
      <path d="M50 10 L30 45 L30 170 Q30 200 50 210 Q70 200 70 170 L70 45 Z" />
      <path d="M30 60 L70 60 M30 90 L70 90 M30 120 L70 120" opacity="0.5" />
      <path d="M38 45 L38 25 M62 45 L62 25" />
    </svg>
  );
}

export function EngravingWire({ className = "" }: MotifProps) {
  return (
    <svg viewBox="0 0 320 60" className={className} {...svgBase}>
      <path d="M0 30 L320 30" />
      {Array.from({ length: 8 }, (_, i) => {
        const x = 20 + i * 40;
        return <path key={i} d={`M${x - 10} 14 L${x + 10} 46 M${x - 10} 46 L${x + 10} 14 M${x} 22 L${x} 38`} />;
      })}
    </svg>
  );
}

export function EngravingFieldRadio({ className = "" }: MotifProps) {
  return (
    <svg viewBox="0 0 140 200" className={className} {...svgBase}>
      <rect x="30" y="70" width="80" height="110" rx="4" />
      <path d="M45 70 L45 40 Q45 20 70 20 Q95 20 95 40 L95 70" opacity="0.6" />
      <path d="M70 20 L70 0" />
      <path d="M45 95 L95 95 M45 115 L95 115 M45 135 L95 135" opacity="0.5" />
      <circle cx="70" cy="160" r="10" />
    </svg>
  );
}

export function EngravingRibbonStars({ className = "" }: MotifProps) {
  return (
    <svg viewBox="0 0 260 120" className={className} {...svgBase}>
      <path d="M20 30 L240 30 L220 60 L240 90 L20 90 L40 60 Z" />
      {[70, 130, 190].map((x) => (
        <path key={x} d={`M${x} 45 L${x + 4} 55 L${x + 15} 56 L${x + 6} 63 L${x + 9} 74 L${x} 68 L${x - 9} 74 L${x - 6} 63 L${x - 15} 56 L${x - 4} 55 Z`} />
      ))}
    </svg>
  );
}

export function EngravingGear({ className = "" }: MotifProps) {
  const teeth = Array.from({ length: 10 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 10;
    const x1 = 100 + 70 * Math.cos(a);
    const y1 = 100 + 70 * Math.sin(a);
    const x2 = 100 + 88 * Math.cos(a);
    const y2 = 100 + 88 * Math.sin(a);
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
  });
  return (
    <svg viewBox="0 0 200 200" className={className} {...svgBase}>
      <circle cx="100" cy="100" r="70" />
      <circle cx="100" cy="100" r="30" />
      {teeth}
    </svg>
  );
}
