"use client";

import type { ReactNode } from "react";
import type { Locale } from "@/lib/site";

/**
 * 引擎本地 UI 辅助(与站内 components/ui 解耦):
 * pick 取内联五语标签,Field/Tabs/Note 是六个颜色引擎共用的排版件。
 */

/** 从内联 per-locale 记录里取字符串;缺语言回退英文。 */
export function pick(locale: Locale, rec: Record<string, string>): string {
  return rec[locale] ?? rec.en;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="block text-[13px] font-medium text-[var(--color-sub)]">{label}</span>
      {children}
    </div>
  );
}

/** 分段圆片 tab(引擎内切换 kind / harmony / 色盲类型)。 */
export function Tabs({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
            value === o.id
              ? "border-transparent bg-[var(--color-ink)] text-white dark:bg-white dark:text-[#1d1d1f]"
              : "hairline hover:bg-[var(--color-surface)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-[13px] leading-5 text-[var(--color-sub)]">{children}</p>;
}

/** 警示条(空态 / 不可达说明),role=alert。 */
export function Warn({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-[rgba(178,80,0,0.06)] px-3.5 py-2.5 text-[13.5px] text-[var(--color-bad)]" role="alert">
      {children}
    </p>
  );
}

/** 徽章用 WCAG 判定片(达标绿 / 不达标灰红)。 */
export function Badge({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        ok
          ? "bg-[rgba(26,127,55,0.1)] text-[var(--color-good)]"
          : "bg-[rgba(178,80,0,0.08)] text-[var(--color-bad)]"
      }`}
    >
      {children}
    </span>
  );
}
