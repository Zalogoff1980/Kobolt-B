"use client";

import { createBlockId } from "@/lib/content/types";
import { PageSections } from "@/lib/content/sections";
import { fileToDataUrl } from "@/lib/editor/fileToDataUrl";
import { TextInput, SmallButton, SectionHeading, Field } from "./fields";

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
      { id: createBlockId(), src, caption: "", personName: "", personRole: "" },
    ]);
  }
  async function replaceFromFile(id: string, file: File) {
    const src = await fileToDataUrl(file);
    update(id, { src });
  }

  const atMax = maxCount !== undefined && photos.length >= maxCount;

  return (
    <div className="space-y-3">
      <SectionHeading zone="photo">Фотографии</SectionHeading>
      {photos.map((p) => (
        <div key={p.id} data-testid="photo-item" data-block-id={p.id} className="space-y-1.5 rounded-container border border-ink/10 p-2">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt="" data-testid="photo-preview-image" className="h-12 w-16 flex-shrink-0 object-cover" />
            <label className="text-xs text-olive-dim underline">
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
            </>
          )}
        </div>
      ))}

      <label
        data-testid="photo-upload-label"
        className={`inline-block rounded-hairline border px-2 py-1 text-xs ${
          atMax ? "cursor-not-allowed border-ink/10 text-ink/30" : "cursor-pointer border-ink/20 text-olive-dim hover:border-ink/40"
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
    </div>
  );
}
