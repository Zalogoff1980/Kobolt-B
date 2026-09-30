"use client";

import { PageSections } from "@/lib/content/sections";
import { photoConfigFor } from "@/lib/content/templateOptions";
import { TextInput, TextArea, Field, FormSection, FormSectionsToolbar } from "./fields";
import { PhotosEditor } from "./PhotosEditor";
import { ParagraphsEditor } from "./ParagraphsEditor";
import { AchievementsEditor } from "./AchievementsEditor";
import { BirthdaysEditor } from "./BirthdaysEditor";
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
  pageNumber: number;
  templateId: string | null;
  sections: PageSections;
  onChange: (next: PageSections) => void;
}) {
  const { maxCount, showPersonFields } = photoConfigFor(pageNumber, templateId);
  const showAchievements = templateId === "team-faces-v1";
  const showBirthdays = templateId === "photo-grid-v1";

  return (
    <div className="space-y-4">
      <FormSectionsToolbar />

      <FormSection
        id="title"
        title="Заголовок"
        filled={sections.title.trim() !== "" || sections.subtitle.trim() !== ""}
      >
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
      </FormSection>

      <FormSection id="lead" title="Основной текст" zone="lead" filled={sections.lead.trim() !== ""}>
        <Field label="Вводный абзац (лид)">
          <TextArea
            data-testid="field-lead"
            rows={3}
            value={sections.lead}
            onChange={(e) => onChange({ ...sections, lead: e.target.value })}
            placeholder="Короткий вводный абзац сразу после заголовка…"
          />
        </Field>
      </FormSection>

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

      {showBirthdays && (
        <BirthdaysEditor
          birthdays={sections.birthdays}
          onChange={(birthdays) => onChange({ ...sections, birthdays })}
        />
      )}

      <QuoteEditor
        quotes={sections.quotes}
        onChange={(quotes) => onChange({ ...sections, quotes })}
      />
    </div>
  );
}
