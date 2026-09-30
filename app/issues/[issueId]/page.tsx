"use client";

import { useEffect, useRef, useState } from "react";
import { getIssue, updateIssue } from "@/lib/db/issues";
import { Issue } from "@/lib/content/issue";
import { emptyPageContent } from "@/lib/content/types";
import { isExtraPage } from "@/lib/content/templateOptions";
import { PageSections, blocksToSections, sectionsToBlocks } from "@/lib/content/sections";
import { A4Page } from "@/components/canvas/A4Page";
import { PagePreviewScaler } from "@/components/canvas/PagePreviewScaler";
import { EditorTopBar } from "@/components/editor/EditorTopBar";
import { PageList } from "@/components/editor/PageList";
import { TemplatePicker } from "@/components/editor/TemplatePicker";
import { TemplateGallery } from "@/components/editor/TemplateGallery";
import { EngravingPicker } from "@/components/editor/EngravingPicker";
import { CoverForm } from "@/components/editor/CoverForm";
import { InnerPageForm } from "@/components/editor/InnerPageForm";
import { ContentZoneOverlay, OVERFLOW_MESSAGE } from "@/components/editor/guides/ContentZoneOverlay";
import { FormSectionsProvider } from "@/components/editor/fields";
import { MobileEditorBar } from "@/components/editor/MobileEditorBar";
import { PreviewPager } from "@/components/editor/PreviewPager";
import { HiddenOverflowProbe } from "@/components/editor/guides/HiddenOverflowProbe";

/** Блок страницы → зона формы: подпись к фото редактируется в секции
 *  фотографий, остальные зоны называются в форме так же, как на странице. */
const FORM_ZONE_ALIASES: Record<string, string> = { caption: "photo" };

/** Поля, куда можно поставить курсор (файловый ввод и дата — нет). */
const FOCUSABLE_FIELDS = "textarea, input:not([type=file]):not([type=date])";

/**
 * Редактор выпуска (ТЗ шага 7).
 *
 * EDITOR DATA → Issue JSON → A4Page → Preview: форма пишет только в
 * `issue` (через persist), а Preview рендерит тот же `A4Page`, что и
 * везде в приложении — отдельной "версии дизайна для редактора" нет.
 * Issue.pages остаётся единственным источником истины: активная
 * страница — это просто число, секции для формы каждый раз заново
 * выводятся из issue.pages[activePage] через blocksToSections, а не
 * хранятся отдельно. Базовые страницы 1–4 присутствуют всегда, но
 * оператор может добавлять новые страницы сверх них (QA: "возможность
 * добавить новую страницу... без жёсткого лимита") — они используют
 * тот же набор "внутренних" шаблонов, что и страница 3 (см.
 * templateOptionsFor/A4Page.tsx).
 */
export default function IssueEditorPage({ params }: { params: { issueId: string } }) {
  const [issue, setIssue] = useState<Issue | null | undefined>(undefined);
  const [activePage, setActivePage] = useState<number>(1);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("saved");
  const [overflowingPages, setOverflowingPages] = useState<number[]>([]);
  const previewRootRef = useRef<HTMLDivElement>(null);
  // Свайп по всему окну превью (QA: "свайп не снизу странички, а в
  // целом в окне, неудобно снизу") — жест ловится на всей колонке
  // превью, не только на узкой полосе PreviewPager под страницей.
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeHorizontalRef = useRef(false);
  const swipeHandledRef = useRef(false);
  // Форма (aside) и колонка превью — цели прокрутки для мобильной
  // панели и клика по блоку страницы.
  const asideRef = useRef<HTMLElement>(null);
  const previewColRef = useRef<HTMLDivElement>(null);
  const [mobileInView, setMobileInView] = useState<"form" | "page">("form");

  // Номера страниц выпуска, по возрастанию — из фактических ключей
  // issue.pages, а не жёстко зашитого [1,2,3,4] (QA: "возможность
  // добавить новую страницу... без жёсткого лимита"). Пусто, пока issue
  // ещё не загружен.
  const pages = issue ? Object.keys(issue.pages).map(Number).sort((a, b) => a - b) : [];

  useEffect(() => {
    getIssue(params.issueId).then((found) => setIssue(found ?? null));
  }, [params.issueId]);

  // Что сейчас на экране (форма или страница) — для подсветки кнопок
  // мобильной панели. Превью считается "на виду", когда видна хотя бы
  // четверть его высоты.
  const editorReady = Boolean(issue);
  useEffect(() => {
    const el = previewColRef.current;
    if (!editorReady || !el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry) setMobileInView(entry.intersectionRatio >= 0.25 ? "page" : "form");
      },
      { threshold: [0, 0.25, 0.5, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [editorReady]);

  function jumpTo(target: "form" | "page") {
    const el = target === "form" ? asideRef.current : previewColRef.current;
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const SWIPE_THRESHOLD_PX = 50;

  function handlePreviewTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    if (!t) return;
    swipeStartRef.current = { x: t.clientX, y: t.clientY };
    swipeHorizontalRef.current = false;
  }

  function handlePreviewTouchMove(e: React.TouchEvent) {
    const t = e.touches[0];
    const start = swipeStartRef.current;
    if (!t || !start) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    // Жест считается горизонтальным свайпом только когда движение по X
    // заметно больше, чем по Y — обычная вертикальная прокрутка длинной
    // страницы (или пинч, хоть он и выключен глобально) не должна
    // случайно листать страницы выпуска.
    if (!swipeHorizontalRef.current && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swipeHorizontalRef.current = true;
    }
    // touch-pan-y на контейнере уже оставляет горизонтальное движение
    // браузеру не обработанным нативно — preventDefault здесь просто
    // подстраховка, чтобы в процессе распознанного горизонтального
    // свайпа страница точно не дёргалась вбок сама по себе.
    if (swipeHorizontalRef.current && e.cancelable) e.preventDefault();
  }

  function handlePreviewTouchEnd(e: React.TouchEvent) {
    const t = e.changedTouches[0];
    const start = swipeStartRef.current;
    if (swipeHorizontalRef.current && t && start) {
      const dx = t.clientX - start.x;
      // Границы свайпа — по фактическому списку страниц, а не жёстко
      // 1..4, чтобы пролистывание работало и на добавленные страницы.
      const index = pages.indexOf(activePage);
      if (dx <= -SWIPE_THRESHOLD_PX && index !== -1 && index < pages.length - 1) {
        setActivePage(pages[index + 1]!);
        swipeHandledRef.current = true;
      } else if (dx >= SWIPE_THRESHOLD_PX && index > 0) {
        setActivePage(pages[index - 1]!);
        swipeHandledRef.current = true;
      }
    }
    swipeStartRef.current = null;
    swipeHorizontalRef.current = false;
  }

  /** Раскрыть в форме поле, соответствующее зоне страницы: раскрыть
   *  секцию, прокрутить к полю, поставить курсор и коротко подсветить.
   *  `clicked` — нажатый блок на странице (нужен, чтобы у повторяющихся
   *  блоков вести к полю с тем же порядковым номером); null — просто к
   *  первому полю зоны. */
  function revealZone(zone: string, clicked: HTMLElement | null) {
    const aside = asideRef.current;
    if (!aside) return;

    const formZone = FORM_ZONE_ALIASES[zone] ?? zone;
    const target = aside.querySelector<HTMLElement>(`[data-form-zone="${formZone}"]`);
    if (!target) return;

    // Свёрнутая секция — сначала раскрываем (обычным кликом по её
    // заголовку, чтобы состояние свёрнутости менялось одним путём).
    const section = target.closest<HTMLElement>("[data-form-section]");
    if (section?.dataset.collapsed === "true") {
      section.querySelector<HTMLButtonElement>("button[aria-expanded]")?.click();
    }

    // У повторяющихся блоков (абзацы, достижения) ведём именно к тому
    // полю, что по счёту соответствует нажатому блоку на странице.
    const fields = Array.from(target.querySelectorAll<HTMLElement>(FOCUSABLE_FIELDS));
    let field: HTMLElement | undefined = target.matches(FOCUSABLE_FIELDS) ? target : fields[0];
    if (clicked && (zone === "paragraph" || zone === "achievement")) {
      const previewRoot = previewRootRef.current;
      const sameZone = previewRoot
        ? Array.from(previewRoot.querySelectorAll<HTMLElement>(`[data-zone="${zone}"]`))
        : [];
      const nth = fields[sameZone.indexOf(clicked)];
      if (nth) field = nth;
    }

    // Небольшая пауза — раскрытая секция успевает отрисоваться.
    window.setTimeout(() => {
      const scrollTarget = field ?? target;
      scrollTarget.scrollIntoView({ behavior: "smooth", block: "center" });
      field?.focus({ preventScroll: true });
      const flash = ["ring-2", "ring-zone-alert", "ring-offset-1"];
      scrollTarget.classList.add(...flash);
      window.setTimeout(() => scrollTarget.classList.remove(...flash), 1400);
    }, 60);
  }

  /** Клик по странице: блок с зоной ведёт к своему полю формы, а
   *  карточка в блоке "В номере" на обложке — на страницу 2–4, которую
   *  она показывает (своей секции в форме обложки у неё нет). */
  function handlePreviewClick(e: React.MouseEvent<HTMLDivElement>) {
    // Свайп, только что обработанный touch-хендлерами ниже, на тач-
    // устройствах обычно всё равно порождает синтетический click —
    // без этой проверки смахивание страницы попутно открывало бы поле
    // формы под пальцем, как обычный тап по зоне.
    if (swipeHandledRef.current) {
      swipeHandledRef.current = false;
      return;
    }
    const el = e.target as HTMLElement;

    const link = el.closest<HTMLElement>("[data-page-link]");
    if (link) {
      const n = Number(link.dataset.pageLink);
      if (Number.isInteger(n) && n >= 1) {
        setActivePage(n);
        // Форма выбранной страницы отрисуется на следующем кадре —
        // после этого ставим курсор в её заголовок.
        window.setTimeout(() => revealZone("h1", null), 120);
      }
      return;
    }

    const clicked = el.closest<HTMLElement>("[data-zone]");
    const zone = clicked?.dataset.zone;
    if (!clicked || !zone) return;
    revealZone(zone, clicked);
  }

  async function persist(next: Issue) {
    setIssue(next);
    setSaveStatus("saving");
    await updateIssue(next);
    setSaveStatus("saved");
  }

  if (issue === undefined) {
    return <main className="p-8 font-body text-ink">Загрузка…</main>;
  }
  if (issue === null) {
    return (
      <main className="p-8 font-body text-ink">
        <p>Выпуск не найден.</p>
      </main>
    );
  }

  const levels =
    activePage === 1
      ? ({ titleLevel: 2, subtitleLevel: 3 } as const)
      : ({ titleLevel: 1, subtitleLevel: 2 } as const);
  const sections = blocksToSections(issue.pages[activePage]!.content.blocks, levels);

  function handleSectionsChange(next: PageSections) {
    const blocks = sectionsToBlocks(next, levels);
    persist({
      ...issue!,
      pages: {
        ...issue!.pages,
        [activePage]: { ...issue!.pages[activePage]!, content: { pageNumber: activePage, blocks } },
      },
    });
  }

  function handleTemplateChange(templateId: string) {
    persist({
      ...issue!,
      pages: {
        ...issue!.pages,
        [activePage]: { ...issue!.pages[activePage]!, templateId },
      },
    });
  }

  // Меняет ТОЛЬКО backgroundEngravingId — content, templateId и всё
  // остальное состояние страницы остаётся байт-в-байт тем же самым
  // объектом (spread ...issue!.pages[activePage]), поэтому смена (или
  // сброс на "Нет") фоновой гравюры физически не может задеть текст,
  // фото или раскладку (PRIORITY 6).
  function handleEngravingChange(engravingId: string | null) {
    persist({
      ...issue!,
      pages: {
        ...issue!.pages,
        [activePage]: { ...issue!.pages[activePage]!, backgroundEngravingId: engravingId },
      },
    });
  }

  function handleIssueMetaChange(patch: {
    number?: string;
    date?: string;
    coverNews?: string | null;
    dayInHistory?: string | null;
  }) {
    persist({ ...issue!, ...patch });
  }

  /** Добавить новую страницу в конец выпуска — пустой контент, шаблон
   *  не выбран (оператор выберет его через TemplateGallery — см. ниже,
   *  сразу под списком страниц), без жёсткого лимита числа страниц
   *  (QA: "возможность добавить новую страницу... 1. Пустая превью
   *  страницы со знаком + в кружочке"). Новая страница сразу становится
   *  активной, чтобы оператор увидел её и начал заполнять. */
  function handleAddPage() {
    const nextNumber = pages.length > 0 ? Math.max(...pages) + 1 : 5;
    persist({
      ...issue!,
      pages: {
        ...issue!.pages,
        [nextNumber]: { content: emptyPageContent(nextNumber), templateId: null },
      },
    });
    setActivePage(nextNumber);
  }

  return (
    <FormSectionsProvider>
    <div className="flex h-screen flex-col">
      <EditorTopBar issue={issue} saveStatus={saveStatus} overflowingPages={overflowingPages} />
      {/* Скрытый DOM-замер всех 4 страниц разом (не только активной) —
          источник overflowingPages для "Скачать PDF" (PRIORITY 1, п.12):
          кнопка не должна пропустить overflow на странице, которую
          пользователь сейчас не редактирует. */}
      <HiddenOverflowProbe issue={issue} onResult={setOverflowingPages} />

      {/*
        Mobile (< lg): sidebar и preview складываются друг под другом
        (flex-col) — их суммарная высота обычно больше экрана, поэтому
        скроллится ЭТА строка-обёртка целиком (overflow-y-auto), а не
        обрезается (было overflow-hidden безусловно — на mobile это
        прятало нижнюю часть формы без возможности докрутить,
        найдено реальным runtime QA).
        Desktop (lg:): sidebar и preview стоят бок о бок и делят одну
        высоту (flex-row) — обёртка снова overflow-hidden, а скролл
        уходит во внутренние overflow-y-auto/overflow-auto каждого
        блока по отдельности, как и было раньше.
      */}
      <div className="flex flex-1 scroll-pt-16 flex-col overflow-x-hidden overflow-y-auto lg:scroll-pt-0 lg:flex-row lg:overflow-hidden">
        {/* Только телефон: липкая панель "страницы 1–4 · Форма/Страница" */}
        <MobileEditorBar
          pages={pages}
          activePage={activePage}
          onSelectPage={setActivePage}
          onAddPage={handleAddPage}
          overflowingPages={overflowingPages}
          inView={mobileInView}
          onJump={jumpTo}
          currentTemplateId={issue.pages[activePage]!.templateId}
          onTemplateChange={handleTemplateChange}
        />

        {/* EDITOR SIDEBAR */}
        <aside
          ref={asideRef}
          className="w-full flex-shrink-0 border-ink/15 bg-chrome p-4 lg:w-80 lg:overflow-y-auto lg:border-r"
        >
          <PageList
            issue={issue}
            activePage={activePage}
            onSelect={setActivePage}
            onAddPage={handleAddPage}
            overflowingPages={overflowingPages}
          />

          {overflowingPages.includes(activePage) && (
            <div
              data-testid="active-page-overflow-notice"
              className="mt-4 rounded-panel border border-zone-alert bg-zone-alert/10 p-3 text-xs text-ink"
            >
              <p className="font-bold">⚠ Страница {activePage}: материал не помещается</p>
              <p className="mt-1">{OVERFLOW_MESSAGE}</p>
            </div>
          )}

          <div className="mt-4">
            {/* Добавленная страница без выбранного шаблона (QA, фишка
                дня: "иконки шаблонов выполнить схематично согласно
                проработанным лэйаутам") — крупная галерея со схемами
                раскладки вместо обычных узких кнопок-ярлычков; везде
                ещё (включая уже выбранный шаблон этой же страницы)
                остаётся TemplatePicker — QA-уточнение: "только для
                новой страницы", а не редизайн выбора шаблона
                повсеместно. */}
            {isExtraPage(activePage) && !issue.pages[activePage]!.templateId ? (
              <TemplateGallery onSelect={handleTemplateChange} />
            ) : (
              <TemplatePicker
                pageNumber={activePage}
                currentTemplateId={issue.pages[activePage]!.templateId}
                onChange={handleTemplateChange}
              />
            )}
          </div>

          <div className="mt-4">
            <EngravingPicker
              pageNumber={activePage}
              currentEngravingId={issue.pages[activePage]!.backgroundEngravingId}
              onChange={handleEngravingChange}
            />
          </div>

          <div className="mt-4">
            {activePage === 1 ? (
              <CoverForm
                issue={issue}
                sections={sections}
                onIssueMetaChange={handleIssueMetaChange}
                onSectionsChange={handleSectionsChange}
              />
            ) : (
              <InnerPageForm
                pageNumber={activePage}
                templateId={issue.pages[activePage]!.templateId}
                sections={sections}
                onChange={handleSectionsChange}
              />
            )}
          </div>
        </aside>

        {/* A4 PREVIEW — целиком масштабируется, пропорция страницы не меняется.
            touch-pan-y — вертикальная прокрутка колонки остаётся нативной,
            а горизонтальные жесты (свайп между страницами, см. хендлеры
            ниже) браузер не перехватывает сам. */}
        <div
          ref={previewColRef}
          onTouchStart={handlePreviewTouchStart}
          onTouchMove={handlePreviewTouchMove}
          onTouchEnd={handlePreviewTouchEnd}
          className="flex-1 scroll-mt-12 touch-pan-y bg-stage p-6 lg:scroll-mt-0 lg:overflow-auto"
        >
          <p className="mb-2 text-center text-xs text-paper/60">
            Нажмите на блок страницы — откроется его поле в форме
          </p>
          <PagePreviewScaler>
            {/* relative-обёртка — точка отсчёта для ContentZoneOverlay
                (offset-геометрия зон считается относительно неё же).
                Сам A4Page не меняется и не оборачивается ничем на
                production-пути — только здесь, в редакторе. */}
            <div
              ref={previewRootRef}
              onClick={handlePreviewClick}
              className="relative [&_[data-page-link]]:cursor-pointer [&_[data-zone]]:cursor-pointer"
            >
              <A4Page issue={issue} pageNumber={activePage} />
              <ContentZoneOverlay containerRef={previewRootRef} />
            </div>
          </PagePreviewScaler>

          {/* Смахивание под страницей (QA: "внизу можно было свайпом
              листать, а не по номерам нажимать") — альтернатива кнопкам
              1–4 в MobileEditorBar сверху, ближе к самой странице. */}
          <PreviewPager pages={pages} activePage={activePage} onSelectPage={setActivePage} />
        </div>
      </div>
    </div>
    </FormSectionsProvider>
  );
}
