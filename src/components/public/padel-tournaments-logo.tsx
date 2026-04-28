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
      viewBox="0 0 88 112"
      aria-hidden="true"
      className={cn("text-[#c7ff2f]", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="padel-mark-fill" x1="14" y1="10" x2="70" y2="82" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E4FF86" />
          <stop offset="1" stopColor="#B7F31E" />
        </linearGradient>
      </defs>
      <path
        d="M45.15 7.5C64.37 7.5 80 23.13 80 42.35C80 56.67 71.31 68.95 58.94 74.2L35.2 97.95C33.36 99.78 30.39 99.78 28.56 97.95L17.01 86.4C15.18 84.57 15.18 81.6 17.01 79.76L40.74 56.03C35.64 52.99 31.54 48.38 28.97 42.85C26.4 37.32 25.48 31.14 26.32 25.07C28.11 15.01 36.25 7.5 45.15 7.5Z"
        fill="url(#padel-mark-fill)"
      />
      <path
        d="M45.15 7.5C64.37 7.5 80 23.13 80 42.35C80 56.67 71.31 68.95 58.94 74.2L35.2 97.95C33.36 99.78 30.39 99.78 28.56 97.95L17.01 86.4C15.18 84.57 15.18 81.6 17.01 79.76L40.74 56.03C35.64 52.99 31.54 48.38 28.97 42.85C26.4 37.32 25.48 31.14 26.32 25.07C28.11 15.01 36.25 7.5 45.15 7.5Z"
        stroke="#CFFD38"
        strokeWidth="3"
      />
      <path
        d="M31.5 42.5C31.5 29.52 42.02 19 55 19H73"
        stroke="#091018"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path
        d="M26.5 80.5L14.5 92.5"
        stroke="#091018"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M22 101.5L10.5 90"
        stroke="#091018"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {[
        [45, 26],
        [57, 26],
        [69, 26],
        [39, 37],
        [51, 37],
        [63, 37],
        [75, 37],
        [39, 49],
        [51, 49],
        [63, 49],
        [75, 49],
        [45, 60],
        [57, 60],
        [69, 60],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.6" fill="#091018" />
      ))}
    </svg>
  );
}
