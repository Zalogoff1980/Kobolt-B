import { Issue } from "./issue";
import { ContentBlock, createBlockId } from "./types";

/**
 * QA-фикстуры шага 6 — интеграционная проверка: два ПОЛНЫХ выпуска
 * (все 4 страницы одного Issue), а не изолированные шаблоны.
 * Используются только /qa/full-issue.
 */

function photoSrc(seed: number, tone: "warm" | "cool" | "portrait" | "portrait_cool" = "warm") {
  const palettes = {
    warm: ["#8a8f6f", "#4c503a", "#23241c"],
    cool: ["#7f8a8f", "#3c4650", "#181c20"],
    portrait: ["#9a8f6f", "#54503a", "#241f16"],
    portrait_cool: ["#7f8a8f", "#3c4650", "#181c20"],
  };
  const c = palettes[tone];
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="700" height="500">
        <defs><linearGradient id="fi${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${c[0]}"/><stop offset="55%" stop-color="${c[1]}"/><stop offset="100%" stop-color="${c[2]}"/>
        </linearGradient></defs>
        <rect width="700" height="500" fill="url(#fi${seed})"/>
      </svg>
    `)
  );
}

/** Omit<ContentBlock, "id"> схлопывает union до общих полей (id, type) —
 *  не распределяется по вариантам, поэтому TS не видит text/level/src/etc.
 *  Дженерик T, выводимый из формы аргумента, распределяет Omit правильно. */
function block<T extends ContentBlock>(b: Omit<T, "id">): T {
  return { ...b, id: createBlockId() } as T;
}

/** Полный выпуск: обложка заполнена, стр.2 = Template A, стр.3 =
 *  Template B, стр.4 = Team (3 человека) — комбинация, явно
 *  затребованная в шаге 6. */
export const qaIssueFull: Issue = {
  id: "qa-full-issue",
  number: "14",
  date: "2024-12-01",
  status: "draft",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  pages: {
    1: {
      templateId: "cover-v1",
      content: {
        pageNumber: 1,
        blocks: [
          block({ type: "photo", src: photoSrc(1), caption: "Плановые учения экипажей на полигоне." }),
          block({ type: "heading", level: 2, text: "Готовы выполнить задачу в любых условиях" }),
          block({ type: "quote", text: "Слаженность экипажа — это не удача, а результат ежедневной работы и доверия.", author: "Командир танкового батальона" }),
        ],
      },
    },
    2: {
      templateId: "article-photo-v1",
      content: {
        pageNumber: 2,
        blocks: [
          block({ type: "heading", level: 1, text: "История нашего батальона" }),
          block({ type: "heading", level: 2, text: "Путь, традиции, братство" }),
          block({ type: "text", text: "Танковый батальон прошёл долгий путь становления. За эти годы менялась техника, менялись люди, но неизменным оставалось главное — верность делу и боевое братство." }),
          block({ type: "text", text: "Каждое поколение танкистов привносило свой опыт, укрепляя традиции подразделения." }),
          block({ type: "text", text: "История батальона — это истории конкретных людей, которые изо дня в день оттачивают мастерство." }),
          block({ type: "photo", src: photoSrc(2), caption: "Архивный снимок батальона." }),
          block({ type: "quote", text: "Опыт, накопленный годами, становится опорой для каждого нового поколения танкистов.", author: "Из архива части" }),
        ],
      },
    },
    3: {
      templateId: "theme-text-photos-v1",
      content: {
        pageNumber: 3,
        blocks: [
          block({ type: "heading", level: 1, text: "Мастерство экипажа" }),
          block({ type: "heading", level: 2, text: "Люди, техника, результат" }),
          block({ type: "text", text: "Подготовка экипажа не заканчивается в учебном классе. Настоящая слаженность рождается на полигоне." }),
          block({ type: "text", text: "Механик-водитель, наводчик и командир работают как единый организм." }),
          block({ type: "text", text: "Регулярные тактические занятия позволяют отрабатывать разные сценарии." }),
          block({ type: "photo", src: photoSrc(3), caption: "Полевые занятия, кадр 1." }),
          block({ type: "photo", src: photoSrc(4, "cool"), caption: "Полевые занятия, кадр 2." }),
          block({ type: "photo", src: photoSrc(5), caption: "Полевые занятия, кадр 3." }),
          block({ type: "quote", text: "Экипаж — это не просто должности в машине. Это люди, которые отвечают друг за друга.", author: "Из беседы с командиром роты" }),
        ],
      },
    },
    4: {
      templateId: "team-faces-v1",
      content: {
        pageNumber: 4,
        blocks: [
          block({ type: "heading", level: 1, text: "Лица батальона" }),
          block({ type: "heading", level: 2, text: "Наши люди — наша сила" }),
          block({ type: "photo", src: photoSrc(6, "portrait"), personName: "Гвардии старший сержант Иванов Алексей Сергеевич", personRole: "Командир танка, позывной «Сокол»" }),
          block({ type: "photo", src: photoSrc(7, "portrait_cool"), personName: "Д. Петров", personRole: "Механик-водитель" }),
          block({ type: "photo", src: photoSrc(8, "portrait"), personName: "Младший сержант Сидоров Максим Андреевич", personRole: "Наводчик-оператор" }),
          block({ type: "text", text: "Слаженность подразделения складывается не только в бою. Совместные тренировки, обслуживание техники, помощь товарищам — часть повседневной работы." }),
          block({ type: "text", text: "Именно в таких моментах рождается настоящая сила батальона." }),
          block({ type: "text", text: "Лучший экипаж по итогам весенних учений", variant: "achievement" }),
          block({ type: "text", text: "Отмечены за оперативное устранение неисправности в полевых условиях", variant: "achievement" }),
          block({ type: "text", text: "Отличные результаты по итогам полевого выхода", variant: "achievement" }),
          block({ type: "quote", text: "Танк прощает ошибки только один раз. Поэтому мы работаем чётко, спокойно, слаженно.", author: "Механик-водитель экипажа" }),
        ],
      },
    },
  },
};

/** Минимальный выпуск: пустая обложка, стр.2 = Template B без фото,
 *  стр.3 = Template A без фото, стр.4 = «Лицо» без фото — проверяет
 *  одновременно и разрешённые гравюрные заглушки (2–3), и их
 *  обязательное отсутствие (4) в одном комплекте. */
export const qaIssueMinimal: Issue = {
  id: "qa-minimal-issue",
  number: "07",
  date: "2025-01-08",
  status: "draft",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  pages: {
    1: { templateId: "cover-v1", content: { pageNumber: 1, blocks: [] } },
    2: {
      templateId: "photo-grid-v1",
      content: {
        pageNumber: 2,
        blocks: [
          block({ type: "heading", level: 1, text: "История нашего батальона" }),
          block({ type: "heading", level: 2, text: "Путь, традиции, братство" }),
          block({ type: "text", text: "Танковый батальон прошёл долгий путь становления." }),
        ],
      },
    },
    3: {
      templateId: "theme-photo-v1",
      content: {
        pageNumber: 3,
        blocks: [
          block({ type: "heading", level: 1, text: "Мастерство экипажа" }),
          block({ type: "heading", level: 2, text: "Люди, техника, результат" }),
          block({ type: "text", text: "Подготовка экипажа не заканчивается в учебном классе." }),
        ],
      },
    },
    4: {
      templateId: "person-feature-v1",
      content: {
        pageNumber: 4,
        blocks: [
          block({ type: "heading", level: 1, text: "Лица батальона" }),
          block({ type: "heading", level: 2, text: "Наши люди — наша сила" }),
          block({ type: "text", text: "Служит в батальоне третий год." }),
        ],
      },
    },
  },
};
