import { useId } from "react";

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
  const maskId = useId();

  return (
    <svg
      viewBox="0 0 220 270"
      aria-hidden="true"
      className={cn("text-[#c7ff2f]", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="220" height="270">
        <rect width="220" height="270" fill="black" />
        <g fill="white">
          <path d="M54 30C54 21.163 61.163 14 70 14H124C170.485 14 196 46.148 196 95C196 137.076 167.846 167.468 129.769 176.433C97.075 184.13 78.63 203.583 74.093 230H54V30Z" />
          <rect x="54" y="199" width="32" height="48" />
          <circle cx="70" cy="254" r="24" />
        </g>

        <g fill="black">
          <path d="M76 164.5C76 157.25 83.348 152.276 90.12 154.9L116.93 165.292C124.672 168.294 125.731 178.726 118.749 183.193L91.939 200.347C84.396 205.172 74.5 199.756 74.5 190.823V164.5H76Z" />
          <rect x="54" y="200" width="32" height="4.5" />
          <rect x="54" y="215.5" width="32" height="4.5" />
          <rect x="54" y="231" width="32" height="4.5" />
          <circle cx="48" cy="254" r="14.5" />
          <circle cx="92" cy="254" r="14.5" />
          {[
            [112, 60],
            [132, 60],
            [152, 60],
            [172, 60],
            [102, 84],
            [122, 84],
            [142, 84],
            [162, 84],
            [182, 84],
            [102, 108],
            [122, 108],
            [142, 108],
            [162, 108],
            [182, 108],
            [102, 132],
            [122, 132],
            [142, 132],
            [162, 132],
            [182, 132],
            [112, 156],
            [132, 156],
            [152, 156],
            [172, 156],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="8" />
          ))}
        </g>
      </mask>

      <rect width="220" height="270" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
}
