"use client";

import { Issue } from "@/lib/content/issue";
import { PageSections } from "@/lib/content/sections";
import { TextInput, Field, SectionHeading } from "./fields";
import { PhotosEditor } from "./PhotosEditor";
import { ParagraphsEditor } from "./ParagraphsEditor";
import { QuoteEditor } from "./QuoteEditor";

/**
 * Редактор обложки (ТЗ шага 7, п.5). Поля "Главный заголовок" и
 * "Hero-заголовок" в задании называют, по сути, один и тот же
 * hero-хедлайн HeroMedia — здесь это одно поле "Главный заголовок";
 * "Подзаголовок" — новая вторая строка под ним (heading level 3),
 * "Hero-подпись" — это подпись к фото (photo.caption), уже
 * присутствующая в модели.
 *
 * Постоянные элементы (название издания, слоган, эмблемы, гравюра) —
 * не поля этой формы: они фиксированы дизайном Masthead/CoverV1 и не
 * должны становиться настройками (ТЗ п.5: "не превращать каждый
 * декоративный элемент в поле редактора").
 */
export function CoverForm({
  issue,
  sections,
  onIssueMetaChange,
  onSectionsChange,
}: {
  issue: Issue;
  sections: PageSections;
  onIssueMetaChange: (patch: { number?: string; date?: string }) => void;
  onSectionsChange: (next: PageSections) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <SectionHeading>Выпуск</SectionHeading>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Field label="Номер выпуска">
            <TextInput
              value={issue.number}
              onChange={(e) => onIssueMetaChange({ number: e.target.value })}
            />
          </Field>
          <Field label="Дата">
            <TextInput
              type="date"
              value={issue.date}
              onChange={(e) => onIssueMetaChange({ date: e.target.value })}
            />
          </Field>
        </div>
      </div>

      <div className="space-y-2">
        <SectionHeading>Главный материал обложки</SectionHeading>
        <Field label="Главный заголовок (hero)" zone="h1">
          <TextInput
            data-testid="field-title"
            value={sections.title}
            onChange={(e) => onSectionsChange({ ...sections, title: e.target.value })}
            placeholder="Готовы выполнить задачу в любых условиях"
          />
        </Field>
        <Field label="Подзаголовок" zone="h2">
          <TextInput
            data-testid="field-subtitle"
            value={sections.subtitle}
            onChange={(e) => onSectionsChange({ ...sections, subtitle: e.target.value })}
          />
        </Field>
      </div>

      <PhotosEditor
        photos={sections.photos}
        maxCount={1}
        onChange={(photos) => onSectionsChange({ ...sections, photos })}
      />

      {/* Текстовый блок hero-колонки обложки (найдено QA: без текста,
          если материала мало, а нет цитаты, колонка выглядит пусто) —
          та же зона "paragraph", что и обычный текст статьи, просто
          читается шаблоном обложки отдельно от cover-v1 (см. CoverV2). */}
      <ParagraphsEditor
        paragraphs={sections.paragraphs}
        onChange={(paragraphs) => onSectionsChange({ ...sections, paragraphs })}
      />

      <QuoteEditor
        text={sections.quoteText}
        author={sections.quoteAuthor}
        onChange={({ text, author }) =>
          onSectionsChange({ ...sections, quoteText: text, quoteAuthor: author })
        }
      />
    </div>
  );
}
