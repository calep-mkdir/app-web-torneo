"use client";

import { Select } from "@/components/ui";
import type { PublicTournamentCategory } from "@/features/public/types";

export function CategorySwitcher({
  categories,
  value,
  onChange,
}: {
  categories: PublicTournamentCategory[];
  value: string;
  onChange: (categoryId: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="sm:hidden">
        <Select value={value} onChange={(event) => onChange(event.target.value)}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="hidden flex-wrap gap-2 sm:flex">
        {categories.map((category) => {
          const isActive = category.id === value;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange(category.id)}
              className={[
                "rounded-full border px-4 py-2 text-sm font-medium transition",
                isActive
                  ? "border-transparent bg-[linear-gradient(135deg,#67e8f9_0%,#bef264_100%)] text-slate-950 shadow-[0_18px_45px_-22px_rgba(103,232,249,0.45)]"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white",
              ].join(" ")}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
