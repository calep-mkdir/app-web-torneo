import Image from "next/image";

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
    <Image
      src="/logo-padel-p.svg"
      alt=""
      aria-hidden="true"
      width={1024}
      height={1024}
      className={className}
      priority
    />
  );
}
