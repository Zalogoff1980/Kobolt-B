import { Issue } from "./issue";
import { createBlockId } from "./types";

/**
 * Заполняет выпуск примером контента ТОЛЬКО для визуальной проверки
 * шаблона (кнопка "Демо-контент" на странице выпуска). Это не часть
 * системы шаблонов и не запускается автоматически — реальные выпуски
 * создаются пустыми (ТЗ п.4: система не должна сама придумывать текст).
 *
 * Фото — сгенерированная SVG-заглушка (в контейнере нет доступа в
 * сеть за реальным снимком): проверяем object-fit/подпись/градиент,
 * а не конкретный кадр.
 */
const DEMO_PHOTO_SRC =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8a8f6f"/>
          <stop offset="55%" stop-color="#4c503a"/>
          <stop offset="100%" stop-color="#23241c"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#g)"/>
    </svg>
  `);

export function withDemoContent(issue: Issue): Issue {
  return {
    ...issue,
    // Сначала разворачиваем ВСЕ страницы выпуска (включая любые
    // добавленные сверх фирменных 1-4 — QA: "возможность добавить
    // новую страницу... без жёсткого лимита"), а затем переопределяем
    // только 1 и 2 демо-контентом. Раньше здесь целиком собирался
    // новый объект {1,2,3,4} — это молча стирало бы любые добавленные
    // страницы 5+ при нажатии "Демо-контент".
    pages: {
      ...issue.pages,
      1: {
        templateId: "cover-v1",
        content: {
          pageNumber: 1,
          blocks: [
            {
              id: createBlockId(),
              type: "photo",
              src: DEMO_PHOTO_SRC,
              caption: "Учения батальона в полевых условиях.",
            },
            {
              id: createBlockId(),
              type: "heading",
              level: 2,
              text: "Одна команда. Одна цель. Победа.",
            },
            {
              id: createBlockId(),
              type: "quote",
              text: "Танк — это не просто машина. Это люди, которые двигают вперёд историю.",
            },
          ],
        },
      },
      2: {
        templateId: issue.pages[2]!.templateId,
        content: {
          pageNumber: 2,
          blocks: [
            { id: createBlockId(), type: "heading", level: 1, text: "История нашего батальона" },
          ],
        },
      },
    },
  };
}
