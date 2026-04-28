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
                  ? "border-white/35 bg-[#9ae8ff] text-[#11161d] shadow-[0_18px_45px_-18px_rgba(154,232,255,0.55)]"
                  : "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08] hover:text-white",
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
