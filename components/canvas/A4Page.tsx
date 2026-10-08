import { Issue } from "@/lib/content/issue";
import { PageFrame } from "./PageFrame";
import { CoverV1 } from "@/components/templates/cover/CoverV1";
import { CoverV2 } from "@/components/templates/cover/CoverV2";
import { ArticlePhoto } from "@/components/templates/inner/ArticlePhoto";
import { PhotoGridText } from "@/components/templates/inner/PhotoGridText";
import { ThemePhoto } from "@/components/templates/inner/ThemePhoto";
import { ThemeTextPhotos } from "@/components/templates/inner/ThemeTextPhotos";
import { PersonFeature } from "@/components/templates/inner/PersonFeature";
import { TeamFaces } from "@/components/templates/inner/TeamFaces";

/**
 * Единый источник истины для отображения страницы выпуска (ТЗ п.2).
 * И Preview (app/issues/[id]/preview), и /api/pdf на шаге 5 рендерят
 * ИМЕННО этот компонент — никакой отдельной вёрстки для печати не
 * заводим. Сам компонент не знает про масштабирование экрана или про
 * Puppeteer: он просто выдаёт физическую страницу 210×297mm.
 *
 * Здесь только диспетчеризация по templateId; сама раскладка живёт в
 * components/templates/<page>/*.
 */
export function A4Page({
  issue,
  pageNumber,
}: {
  issue: Issue;
  pageNumber: number;
}) {
  const page = issue.pages[pageNumber]!;

  if (pageNumber === 1 && page.templateId === "cover-v1") {
    return <CoverV1 issue={issue} />;
  }

  if (pageNumber === 1 && page.templateId === "cover-v2") {
    return <CoverV2 issue={issue} />;
  }

  // Внутренние страницы выбираются по templateId, а не по номеру: id
  // шаблонов уникальны, а номер страницы может измениться, когда
  // оператор удаляет страницу выше по списку (страницы перенумеровываются
  // подряд) — страница "Лица" не должна терять вёрстку, оказавшись на
  // месте 3. Обложка (страница 1) по-прежнему привязана к номеру.
  if (pageNumber > 1) {
    switch (page.templateId) {
      case "article-photo-v1":
        return <ArticlePhoto issue={issue} pageNumber={pageNumber} />;
      case "photo-grid-v1":
        return <PhotoGridText issue={issue} pageNumber={pageNumber} />;
      case "theme-photo-v1":
        return <ThemePhoto issue={issue} pageNumber={pageNumber} />;
      case "theme-text-photos-v1":
        return <ThemeTextPhotos issue={issue} pageNumber={pageNumber} />;
      case "person-feature-v1":
        return <PersonFeature issue={issue} pageNumber={pageNumber} />;
      case "team-faces-v1":
        return <TeamFaces issue={issue} pageNumber={pageNumber} />;
    }
  }

  return (
    <PageFrame>
      <div className="flex h-full items-center justify-center font-body text-olive-dim">
        Страница {pageNumber}: шаблон ещё не реализован
        {page.templateId ? ` (${page.templateId})` : " (не выбран)"}
      </div>
    </PageFrame>
  );
}
