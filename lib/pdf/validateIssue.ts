import { Issue } from "@/lib/content/issue";

/**
 * Минимальная защитная проверка формы присланного клиентом Issue JSON
 * перед тем, как его вообще пытаться рендерить в /api/pdf. Сервер
 * НЕ обращается к IndexedDB (её там физически нет — это клиентское
 * браузерное хранилище), поэтому единственный источник данных для PDF —
 * ровно то, что прислал клиент; но прежде чем скармливать это React,
 * стоит убедиться, что это действительно похоже на Issue с ровно 4
 * страницами, а не на что угодно другое.
 *
 * Это НЕ полная валидация схемы (не zod) — намеренно: цель здесь не
 * "отвергнуть всё подозрительное", а поймать явно битый/чужеродный
 * payload с понятной ошибкой вместо непонятного краша где-то в
 * середине рендера шаблона.
 */
export function assertValidIssueShape(value: unknown): asserts value is Issue {
  if (!value || typeof value !== "object") {
    throw new Error("Issue must be a JSON object");
  }
  const issue = value as Record<string, unknown>;
  if (typeof issue.id !== "string" || typeof issue.number !== "string" || typeof issue.date !== "string") {
    throw new Error("Issue must have string id/number/date");
  }
  if (!issue.pages || typeof issue.pages !== "object") {
    throw new Error("Issue.pages must be an object");
  }
  const pages = issue.pages as Record<string, unknown>;
  // Обязательна только обложка (страница 1): остальные страницы оператор
  // может удалять, поэтому их число произвольно. Каждая присутствующая
  // страница проверяется одной и той же формой, по фактическим ключам
  // объекта, а не по жёстко зашитому списку номеров.
  if (!pages["1"] || typeof pages["1"] !== "object") {
    throw new Error("Issue.pages[1] is missing — an issue needs at least a cover page");
  }
  for (const [key, page] of Object.entries(pages)) {
    const n = Number(key);
    if (!Number.isInteger(n) || n < 1) {
      throw new Error(`Issue.pages has an invalid page number: ${key}`);
    }
    if (!page || typeof page !== "object") {
      throw new Error(`Issue.pages[${n}] must be an object`);
    }
    const p = page as Record<string, unknown>;
    if (!p.content || typeof p.content !== "object" || !Array.isArray((p.content as any).blocks)) {
      throw new Error(`Issue.pages[${n}].content.blocks must be an array`);
    }
  }
}
