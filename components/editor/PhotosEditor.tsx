"use client";

import { createBlockId } from "@/lib/content/types";
import { PageSections } from "@/lib/content/sections";
import { fileToDataUrl } from "@/lib/editor/fileToDataUrl";
import { TextInput, TextArea, SmallButton, FormSection, Field } from "./fields";
import { AwardPicker } from "./AwardPicker";

type Photo = PageSections["photos"][number];

/**
 * Фото страницы: загрузить / заменить / удалить / подпись (везде), и
 * имя/должность — только там, где шаблон их использует (страница 4).
 * maxCount ограничивает количество слотов под тот шаблон, для
 * которого реально видна разница (напр. Template B страницы 4 — не
 * более 3, ТЗ шага 5); undefined — без ограничения (photo-grid-v1).
 *
 * Важно: удаление фото просто убирает элемент из списка — шаблон
 * страницы 4 не подставляет вместо него гравюрную заглушку (правило,
 * зафиксированное на шаге 5).
 */
export function PhotosEditor({
  photos,
  onChange,
  showPersonFields = false,
  maxCount,
}: {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  showPersonFields?: boolean;
  maxCount?: number;
}) {
  function update(id: string, patch: Partial<Photo>) {
    onChange(photos.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  function remove(id: string) {
    onChange(photos.filter((p) => p.id !== id));
  }
  async function addFromFile(file: File) {
    const src = await fileToDataUrl(file);
    onChange([
      ...photos,
      {
        id: createBlockId(),
        src,
        caption: "",
        personName: "",
        personRole: "",
        personQuote: "",
        personBio: "",
        awardIds: [],
      },
    ]);
  }
  async function replaceFromFile(id: string, file: File) {
    const src = await fileToDataUrl(file);
    update(id, { src });
  }

  const atMax = maxCount !== undefined && photos.length >= maxCount;

  return (
    <FormSection
      id="photos"
      title="Фотографии"
      zone="photo"
      filled={photos.length > 0}
      summary={photos.length > 0 ? `${photos.length} шт.` : undefined}
      className="space-y-3"
    >
      {photos.map((p) => (
        <div key={p.id} data-testid="photo-item" data-block-id={p.id} className="space-y-2 rounded-control border border-ink/10 bg-chrome/25 p-3">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt="" data-testid="photo-preview-image" className="h-12 w-16 flex-shrink-0 rounded-hairline object-cover" />
            <label className="cursor-pointer text-xs font-semibold text-olive-dim underline">
              Заменить
              <input
                type="file"
                accept="image/*"
                data-testid="photo-replace-input"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) replaceFromFile(p.id, f);
                }}
              />
            </label>
            <SmallButton data-testid="photo-remove-button" onClick={() => remove(p.id)} className="ml-auto">
              Удалить фото
            </SmallButton>
          </div>
          <Field label="Подпись">
            <TextInput
              data-testid="photo-caption-input"
              value={p.caption}
              onChange={(e) => update(p.id, { caption: e.target.value })}
              placeholder="Подпись к фото…"
            />
          </Field>
          {showPersonFields && (
            <>
              <Field label="Имя">
                <TextInput
                  data-testid="photo-person-name-input"
                  value={p.personName}
                  onChange={(e) => update(p.id, { personName: e.target.value })}
                  placeholder="Иванов Алексей Сергеевич"
                />
              </Field>
              <Field label="Должность / позывной">
                <TextInput
                  data-testid="photo-person-role-input"
                  value={p.personRole}
                  onChange={(e) => update(p.id, { personRole: e.target.value })}
                  placeholder="Командир танка, позывной «Сокол»"
                />
              </Field>
              {/* Цитата и описание — карточка "Лица батальона" по
                  макету-референсу (QA, сентябрь 2026): короткая реплика
                  человека рядом с фото и абзац-био под ролью. Оба поля
                  привязаны именно к этому человеку, а не к общим полям
                  "Основной текст"/абзацы страницы. */}
              <Field label="Короткая цитата">
                <TextArea
                  data-testid="photo-person-quote-input"
                  rows={2}
                  value={p.personQuote}
                  onChange={(e) => update(p.id, { personQuote: e.target.value })}
                  placeholder="«Главное — не техника, а люди…»"
                />
              </Field>
              <Field label="Описание">
                <TextArea
                  data-testid="photo-person-bio-input"
                  rows={2}
                  value={p.personBio}
                  onChange={(e) => update(p.id, { personBio: e.target.value })}
                  placeholder="Провёл множество боевых задач, отличается хладнокровием…"
                />
              </Field>
              <AwardPicker
                selectedIds={p.awardIds}
                onChange={(awardIds) => update(p.id, { awardIds })}
              />
            </>
          )}
        </div>
      ))}

      <label
        data-testid="photo-upload-label"
        className={`inline-flex h-8 items-center rounded-control border px-3 font-body text-xs font-semibold ${
          atMax ? "cursor-not-allowed border-ink/10 text-ink/30" : "cursor-pointer border-ink/20 bg-paper text-ink hover:border-ink/40 hover:bg-chrome/60"
        }`}
      >
        + Добавить фото
        <input
          type="file"
          accept="image/*"
          data-testid="photo-upload-input"
          className="hidden"
          disabled={atMax}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) addFromFile(f);
            e.target.value = "";
          }}
        />
      </label>
      {maxCount !== undefined && (
        <span className="ml-2 text-xs text-olive-dim">
          {photos.length} / {maxCount}
        </span>
      )}
    </FormSection>
  );
}
