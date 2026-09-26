"use client";

import { PageSections } from "@/lib/content/sections";
import { photoConfigFor } from "@/lib/content/templateOptions";
import { TextInput, TextArea, Field, SectionHeading } from "./fields";
import { PhotosEditor } from "./PhotosEditor";
import { ParagraphsEditor } from "./ParagraphsEditor";
import { AchievementsEditor } from "./AchievementsEditor";
import { QuoteEditor } from "./QuoteEditor";

/** Общая форма для страниц 2–4: заголовок/подзаголовок, фото, текст,
 *  цитата — и список достижений, но только для team-faces-v1 (ТЗ
 *  шага 5: достижения относятся именно к "Команде", не к остальным
 *  внутренним страницам). */
export function InnerPageForm({
  pageNumber,
  templateId,
  sections,
  onChange,
}: {
  pageNumber: 2 | 3 | 4;
  templateId: string | null;
  sections: PageSections;
  onChange: (next: PageSections) => void;
}) {
  const { maxCount, showPersonFields } = photoConfigFor(pageNumber, templateId);
  const showAchievements = templateId === "team-faces-v1";

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <SectionHeading>Заголовок</SectionHeading>
        <Field label="Заголовок" zone="h1">
          <TextInput
            data-testid="field-title"
            value={sections.title}
            onChange={(e) => onChange({ ...sections, title: e.target.value })}
          />
        </Field>
        <Field label="Подзаголовок" zone="h2">
          <TextInput
            data-testid="field-subtitle"
            value={sections.subtitle}
            onChange={(e) => onChange({ ...sections, subtitle: e.target.value })}
          />
        </Field>
      </div>

      <div className="space-y-2">
        <SectionHeading zone="lead">Основной текст</SectionHeading>
        <Field label="Вводный абзац (лид)">
          <TextArea
            data-testid="field-lead"
            rows={3}
            value={sections.lead}
            onChange={(e) => onChange({ ...sections, lead: e.target.value })}
            placeholder="Короткий вводный абзац сразу после заголовка…"
          />
        </Field>
      </div>

      <PhotosEditor
        photos={sections.photos}
        maxCount={maxCount}
        showPersonFields={showPersonFields}
        onChange={(photos) => onChange({ ...sections, photos })}
      />

      <ParagraphsEditor
        paragraphs={sections.paragraphs}
        onChange={(paragraphs) => onChange({ ...sections, paragraphs })}
      />

      {showAchievements && (
        <AchievementsEditor
          achievements={sections.achievements}
          onChange={(achievements) => onChange({ ...sections, achievements })}
        />
      )}

      <QuoteEditor
        text={sections.quoteText}
        author={sections.quoteAuthor}
        onChange={({ text, author }) =>
          onChange({ ...sections, quoteText: text, quoteAuthor: author })
        }
      />
    </div>
  );
}
