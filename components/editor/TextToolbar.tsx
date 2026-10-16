"use client";

import { useState } from "react";
import { FONT_OPTIONS, FONT_SIZE_OPTIONS, TEXT_COLOR_OPTIONS } from "@/lib/content/fonts";
import { TextAlign, TextFormat, cleanTextFormat } from "@/lib/content/types";
import { AlignPicker } from "./AlignPicker";

const selectClass =
  "h-9 w-full rounded-control border border-ink/15 bg-chrome/40 px-2 font-body text-sm text-ink outline-none focus:border-ink/50";

function ToggleButton({
  pressed,
  onClick,
  label,
  testId,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  label: string;
  testId: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      data-testid={testId}
      onClick={onClick}
      className={`flex h-8 min-w-[36px] appearance-none items-center justify-center rounded-control border font-body text-sm ${
        pressed
          ? "border-ink bg-ink text-paper"
          : "border-ink/20 bg-paper text-olive-dim hover:border-ink/40 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Панель оформления текста, как в Word: выравнивание (всегда на виду) и
 * раскрывающаяся панель "Шрифт" — шрифт, размер, цвет, жирный/курсив/
 * подчёркнутый. Всё необязательно: пока оператор ничего не выбрал,
 * текст выглядит так, как задумано шаблоном.
 */
export function TextToolbar({
  align,
  format,
  onAlignChange,
  onFormatChange,
  defaultBold = false,
  testId,
}: {
  align?: TextAlign;
  format?: TextFormat;
  onAlignChange: (align: TextAlign | undefined) => void;
  onFormatChange: (format: TextFormat | undefined) => void;
  /** Жирный ли этот текст по умолчанию в шаблоне (заголовки и лид — да,
   *  обычные абзацы — нет): нужно, чтобы кнопка "Ж" показывала
   *  правильное состояние. */
  defaultBold?: boolean;
  testId: string;
}) {
  const [open, setOpen] = useState(false);
  const f = format ?? {};
  const hasFormat = cleanTextFormat(f) !== undefined;
  const isBold = f.bold ?? defaultBold;

  function patch(next: Partial<TextFormat>) {
    onFormatChange(cleanTextFormat({ ...f, ...next }));
  }

  return (
    <div className="space-y-2" data-testid={testId}>
      <div className="flex flex-wrap items-center gap-2">
        <AlignPicker testId={`${testId}-align`} value={align} onChange={onAlignChange} />
        <button
          type="button"
          aria-expanded={open}
          data-testid={`${testId}-font-toggle`}
          onClick={() => setOpen((v) => !v)}
          className={`flex h-8 appearance-none items-center gap-1.5 rounded-control border px-3 font-body text-xs font-semibold ${
            hasFormat ? "border-ink/50 text-ink" : "border-ink/20 text-olive-dim"
          } bg-paper hover:border-ink/40`}
        >
          <span aria-hidden>Аа</span>
          Шрифт
          {hasFormat && <span aria-label="изменён" className="text-zone-alert">●</span>}
          <span aria-hidden>{open ? "▴" : "▾"}</span>
        </button>
      </div>

      {open && (
        <div className="space-y-3 rounded-control border border-ink/10 bg-paper p-3" data-testid={`${testId}-font-panel`}>
          <div className="grid grid-cols-[1fr_88px] gap-2">
            <label className="block">
              <span className="font-body text-[11px] font-semibold text-olive">Шрифт</span>
              <select
                data-testid={`${testId}-font-family`}
                value={f.fontFamily ?? ""}
                onChange={(e) =>
                  patch({ fontFamily: (e.target.value || undefined) as TextFormat["fontFamily"] })
                }
                className={selectClass}
              >
                <option value="">Как в шаблоне</option>
                {FONT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="font-body text-[11px] font-semibold text-olive">Размер</span>
              <select
                data-testid={`${testId}-font-size`}
                value={f.fontSize ?? ""}
                onChange={(e) => patch({ fontSize: e.target.value ? Number(e.target.value) : undefined })}
                className={selectClass}
              >
                <option value="">Авто</option>
                {FONT_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-1">
            <ToggleButton
              pressed={isBold}
              label="Жирный"
              testId={`${testId}-bold`}
              onClick={() => patch({ bold: isBold === defaultBold ? !defaultBold : undefined })}
            >
              <span className="font-bold">Ж</span>
            </ToggleButton>
            <ToggleButton
              pressed={Boolean(f.italic)}
              label="Курсив"
              testId={`${testId}-italic`}
              onClick={() => patch({ italic: !f.italic })}
            >
              <span className="italic">К</span>
            </ToggleButton>
            <ToggleButton
              pressed={Boolean(f.underline)}
              label="Подчёркнутый"
              testId={`${testId}-underline`}
              onClick={() => patch({ underline: !f.underline })}
            >
              <span className="underline">Ч</span>
            </ToggleButton>
          </div>

          <div>
            <span className="font-body text-[11px] font-semibold text-olive">Цвет текста</span>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {TEXT_COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  aria-label={c.label}
                  aria-pressed={f.color?.toLowerCase() === c.value.toLowerCase()}
                  data-testid={`${testId}-color-${c.value.slice(1)}`}
                  onClick={() => patch({ color: c.value })}
                  style={{ backgroundColor: c.value }}
                  className={`h-7 w-7 appearance-none rounded-full border-2 ${
                    f.color?.toLowerCase() === c.value.toLowerCase() ? "border-zone-alert" : "border-ink/20"
                  }`}
                />
              ))}
              <label className="flex items-center gap-1.5 font-body text-xs text-olive-dim">
                <input
                  type="color"
                  aria-label="Свой цвет"
                  data-testid={`${testId}-color-custom`}
                  value={f.color ?? "#161511"}
                  onChange={(e) => patch({ color: e.target.value })}
                  className="h-7 w-9 cursor-pointer rounded-control border border-ink/20 bg-paper p-0.5"
                />
                свой
              </label>
              {f.color && (
                <button
                  type="button"
                  data-testid={`${testId}-color-reset`}
                  onClick={() => patch({ color: undefined })}
                  className="h-7 appearance-none rounded-control border border-ink/20 px-2 font-body text-xs text-olive-dim hover:border-ink/40"
                >
                  Как в шаблоне
                </button>
              )}
            </div>
          </div>

          {hasFormat && (
            <button
              type="button"
              data-testid={`${testId}-font-reset`}
              onClick={() => onFormatChange(undefined)}
              className="h-8 appearance-none rounded-control border border-ink/20 bg-paper px-3 font-body text-xs font-semibold text-olive-dim hover:border-ink/40 hover:text-ink"
            >
              Сбросить шрифт
            </button>
          )}
        </div>
      )}
    </div>
  );
}
