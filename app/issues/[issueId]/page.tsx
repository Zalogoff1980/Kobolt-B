"use client";

import { useEffect, useRef, useState } from "react";
import { getIssue, updateIssue } from "@/lib/db/issues";
import { Issue } from "@/lib/content/issue";
import { PageSections, blocksToSections, sectionsToBlocks } from "@/lib/content/sections";
import { A4Page } from "@/components/canvas/A4Page";
import { PagePreviewScaler } from "@/components/canvas/PagePreviewScaler";
import { EditorTopBar } from "@/components/editor/EditorTopBar";
import { PageList } from "@/components/editor/PageList";
import { TemplatePicker } from "@/components/editor/TemplatePicker";
import { CoverForm } from "@/components/editor/CoverForm";
import { InnerPageForm } from "@/components/editor/InnerPageForm";
import { ContentZoneOverlay } from "@/components/editor/guides/ContentZoneOverlay";
import { HiddenOverflowProbe } from "@/components/editor/guides/HiddenOverflowProbe";

/**
 * Редактор выпуска (ТЗ шага 7).
 *
 * EDITOR DATA → Issue JSON → A4Page → Preview: форма пишет только в
 * `issue` (через persist), а Preview рендерит тот же `A4Page`, что и
 * везде в приложении — отдельной "версии дизайна для редактора" нет.
 * Issue.pages остаётся единственным источником истины: активная
 * страница — это просто число (1–4), секции для формы каждый раз
 * заново выводятся из issue.pages[activePage] через blocksToSections,
 * а не хранятся отдельно.
 */
export default function IssueEditorPage({ params }: { params: { issueId: string } }) {
  const [issue, setIssue] = useState<Issue | null | undefined>(undefined);
  const [activePage, setActivePage] = useState<1 | 2 | 3 | 4>(1);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("saved");
  const [overflowingPages, setOverflowingPages] = useState<number[]>([]);
  const previewRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getIssue(params.issueId).then((found) => setIssue(found ?? null));
  }, [params.issueId]);

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
  const sections = blocksToSections(issue.pages[activePage].content.blocks, levels);

  function handleSectionsChange(next: PageSections) {
    const blocks = sectionsToBlocks(next, levels);
    persist({
      ...issue!,
      pages: {
        ...issue!.pages,
        [activePage]: { ...issue!.pages[activePage], content: { pageNumber: activePage, blocks } },
      },
    });
  }

  function handleTemplateChange(templateId: string) {
    persist({
      ...issue!,
      pages: {
        ...issue!.pages,
        [activePage]: { ...issue!.pages[activePage], templateId },
      },
    });
  }

  function handleIssueMetaChange(patch: { number?: string; date?: string }) {
    persist({ ...issue!, ...patch });
  }

  return (
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
      <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto lg:flex-row lg:overflow-hidden">
        {/* EDITOR SIDEBAR */}
        <aside className="w-full flex-shrink-0 border-ink/15 bg-chrome p-4 lg:w-80 lg:overflow-y-auto lg:border-r">
          <PageList issue={issue} activePage={activePage} onSelect={setActivePage} />

          <div className="mt-4 border-t border-ink/10 pt-4">
            <TemplatePicker
              pageNumber={activePage}
              currentTemplateId={issue.pages[activePage].templateId}
              onChange={handleTemplateChange}
            />
          </div>

          <div className="mt-4 border-t border-ink/10 pt-4">
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
                templateId={issue.pages[activePage].templateId}
                sections={sections}
                onChange={handleSectionsChange}
              />
            )}
          </div>
        </aside>

        {/* A4 PREVIEW — целиком масштабируется, пропорция страницы не меняется */}
        <div className="flex-1 bg-stage p-6 lg:overflow-auto">
          <PagePreviewScaler>
            {/* relative-обёртка — точка отсчёта для ContentZoneOverlay
                (offset-геометрия зон считается относительно неё же).
                Сам A4Page не меняется и не оборачивается ничем на
                production-пути — только здесь, в редакторе. */}
            <div ref={previewRootRef} className="relative">
              <A4Page issue={issue} pageNumber={activePage} />
              <ContentZoneOverlay containerRef={previewRootRef} />
            </div>
          </PagePreviewScaler>
        </div>
      </div>
    </div>
  );
}
