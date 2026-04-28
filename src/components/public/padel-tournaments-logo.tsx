import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

const logoScale = {
  sm: {
    icon: "h-11 w-11",
    title: "text-[1.95rem]",
    subtitle: "text-[0.62rem] tracking-[0.26em]",
    gap: "gap-3",
  },
  md: {
    icon: "h-14 w-14",
    title: "text-[2.55rem]",
    subtitle: "text-[0.72rem] tracking-[0.32em]",
    gap: "gap-4",
  },
  lg: {
    icon: "h-20 w-20 sm:h-24 sm:w-24",
    title: "text-[3.2rem] sm:text-[4.2rem]",
    subtitle: "text-[0.84rem] sm:text-[0.98rem] tracking-[0.34em]",
    gap: "gap-5",
  },
} as const;

export function PadelTournamentsLogo({
  size = "sm",
  className,
  titleClassName,
  subtitleClassName,
}: {
  size?: LogoSize;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}) {
  const scale = logoScale[size];

  return (
    <div className={cn("flex items-center", scale.gap, className)}>
      <PadelTournamentsMark className={scale.icon} />
      <div className="leading-none">
        <div
          className={cn(
            "font-semibold uppercase tracking-tight text-white",
            scale.title,
            titleClassName,
          )}
        >
          Padel
        </div>
        <div
          className={cn(
            "mt-1 font-semibold uppercase text-white/72",
            scale.subtitle,
            subtitleClassName,
          )}
        >
          Tournaments
        </div>
      </div>
    </div>
  );
}

export function PadelTournamentsMark({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 108 164"
      aria-hidden="true"
      className={cn("text-[#c7ff2f]", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 14H66C87.17 14 98 27.66 98 46.59C98 66.86 84.55 81.82 66.87 86.36C48.55 91.08 39.38 103.19 38.89 122H24V14Z"
        fill="currentColor"
      />
      <path d="M24 122H42V140H24V122Z" fill="currentColor" />
      <path
        d="M24 142H42V154C42 159.52 37.52 164 32 164H34C28.48 164 24 159.52 24 154V142Z"
        fill="currentColor"
      />
      <path
        d="M33 132C42.39 132 50 139.61 50 149C50 158.39 42.39 166 33 166C23.61 166 16 158.39 16 149C16 139.61 23.61 132 33 132Z"
        fill="currentColor"
      />
      <path
        d="M33 132C26.06 136.41 21.9 142.05 21.9 149C21.9 155.95 26.06 161.59 33 166"
        fill="none"
        stroke="#10161f"
        strokeWidth="4.6"
        strokeLinecap="round"
      />
      <path
        d="M33 132C39.94 136.41 44.1 142.05 44.1 149C44.1 155.95 39.94 161.59 33 166"
        fill="none"
        stroke="#10161f"
        strokeWidth="4.6"
        strokeLinecap="round"
      />
      <path d="M24 122H42" stroke="#10161f" strokeWidth="4" />
      <path d="M24 134H42" stroke="#10161f" strokeWidth="4" />
      <path d="M24 146H42" stroke="#10161f" strokeWidth="4" />
      <path d="M35 73L55 86L35 100V73Z" fill="#10161f" />
      {[
        [53, 28],
        [65, 28],
        [77, 28],
        [89, 28],
        [45, 40],
        [57, 40],
        [69, 40],
        [81, 40],
        [93, 40],
        [41, 52],
        [53, 52],
        [65, 52],
        [77, 52],
        [89, 52],
        [41, 64],
        [53, 64],
        [65, 64],
        [77, 64],
        [89, 64],
        [49, 76],
        [61, 76],
        [73, 76],
        [85, 76],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" fill="#10161f" />
      ))}
    </svg>
  );
}
