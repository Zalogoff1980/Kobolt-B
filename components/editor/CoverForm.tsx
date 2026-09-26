"use client";

import { Issue } from "@/lib/content/issue";
import { PageSections } from "@/lib/content/sections";
import { TextInput, TextArea, Field, SectionHeading } from "./fields";
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
  onIssueMetaChange: (patch: {
    number?: string;
    date?: string;
    coverNews?: string | null;
    dayInHistory?: string | null;
  }) => void;
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
        quotes={sections.quotes}
        onChange={(quotes) => onSectionsChange({ ...sections, quotes })}
      />

      {/* Блок "Новости" под списком "В номере" — сырой многострочный
          текст: каждая строка (после Enter) становится отдельной
          короткой новостью при отрисовке (см. NewsBlock.tsx). Одно
          текстовое поле, а не список с "+ Добавить" — по просьбе
          оператора ("одним текстом с несколькими переносами сделаем в
          несколько абзацев"), сюда обычно вписывают 3–4 короткие
          заметки. Не часть sections/PageContent — отдельное поле
          выпуска (см. Issue.coverNews), поэтому меняется через
          onIssueMetaChange, а не onSectionsChange. */}
      <div className="space-y-2">
        <SectionHeading zone="news">Новости</SectionHeading>
        <TextArea
          data-testid="field-cover-news"
          value={issue.coverNews ?? ""}
          onChange={(e) => onIssueMetaChange({ coverNews: e.target.value })}
          rows={5}
          placeholder={"Каждая строка — отдельная новость.\nНапример:\nБатальон занял 1-е место на учениях.\nПрибыло новое пополнение техники."}
        />
      </div>

      {/* Блок "День в истории" — только у шаблона "Боевой листок"
          (cover-v2, см. ContentsGrid.tsx): заменяет собой список "В
          номере", который дублировал подписи под миниатюрами страниц
          (QA: "два одинаковых блока в разной степени содержания"). Тот
          же формат ввода, что и у "Новости" — строка через Enter =
          один факт. Поле показывается всегда (не только когда выбран
          cover-v2), так же как coverNews не зависит от текущего
          шаблона обложки — значение сохраняется в Issue независимо от
          того, какой шаблон сейчас активен. */}
      <div className="space-y-2">
        <SectionHeading zone="dayInHistory">День в истории</SectionHeading>
        <TextArea
          data-testid="field-day-in-history"
          value={issue.dayInHistory ?? ""}
          onChange={(e) => onIssueMetaChange({ dayInHistory: e.target.value })}
          rows={5}
          placeholder={"Каждая строка — отдельный факт (используется в шаблоне «Боевой листок»).\nНапример:\nВ этот день в 1943 году началась Курская битва."}
        />
      </div>
    </div>
  );
}
