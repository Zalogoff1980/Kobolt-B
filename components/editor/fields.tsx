"use client";

import { ReactNode } from "react";

/** Общие примитивы полей редактора — единообразный минималистичный
 *  вид форм, без превращения интерфейса в "конструктор дизайна" (ТЗ
 *  шага 7, п.5: "не превращать каждый декоративный элемент в поле"). */

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="font-display text-[10px] font-bold uppercase tracking-wide text-olive">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full border border-ink/20 bg-white/60 px-2 py-1.5 font-body text-sm text-ink outline-none focus:border-accent";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} resize-y ${props.className ?? ""}`} />;
}

export function SmallButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`border border-ink/20 px-2 py-1 text-xs uppercase text-olive-dim hover:border-ink/40 disabled:opacity-30 ${
        props.className ?? ""
      }`}
    >
      {children}
    </button>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="border-b border-ink/10 pb-1 font-display text-xs font-bold uppercase tracking-wide text-ink">
      {children}
    </h3>
  );
}
