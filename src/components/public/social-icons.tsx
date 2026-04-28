import { cn } from "@/lib/utils";

const socialItems = [
  { label: "Instagram", icon: InstagramIcon },
  { label: "Facebook", icon: FacebookIcon },
  { label: "Twitter", icon: TwitterIcon },
] as const;

export function BrandSocials({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {socialItems.map((item) => (
        <span
          key={item.label}
          aria-label={item.label}
          title={item.label}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-200 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.6)] transition hover:-translate-y-0.5 hover:border-[#c7ff2f]/30 hover:text-[#c7ff2f]"
        >
          <item.icon className={cn("h-4 w-4", iconClassName)} />
        </span>
      ))}
    </div>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.85" r="1.15" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M13.55 20.5V12.95H16.15L16.55 9.95H13.55V8.05C13.55 7.18 13.98 6.45 15.35 6.45H16.65V3.88C16.41 3.85 15.58 3.78 14.62 3.78C11.98 3.78 10.35 5.39 10.35 8.34V9.95H7.75V12.95H10.35V20.5H13.55Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M19.34 7.61C18.83 7.84 18.29 8 17.71 8.08C18.31 7.72 18.77 7.15 18.99 6.47C18.43 6.8 17.81 7.03 17.14 7.16C16.61 6.59 15.84 6.23 14.98 6.23C13.38 6.23 12.08 7.53 12.08 9.13C12.08 9.36 12.1 9.58 12.16 9.78C9.75 9.66 7.62 8.5 6.18 6.74C5.93 7.16 5.8 7.66 5.8 8.19C5.8 9.2 6.31 10.09 7.09 10.61C6.62 10.6 6.18 10.47 5.79 10.25V10.29C5.79 11.7 6.79 12.89 8.11 13.15C7.87 13.22 7.61 13.26 7.34 13.26C7.15 13.26 6.97 13.24 6.79 13.21C7.16 14.37 8.24 15.22 9.52 15.24C8.52 16.02 7.28 16.48 5.94 16.48C5.69 16.48 5.44 16.47 5.2 16.44C6.49 17.27 8.01 17.75 9.65 17.75C14.97 17.75 17.88 13.34 17.88 9.51L17.87 9.13C18.44 8.72 18.93 8.21 19.34 7.61Z"
        fill="currentColor"
      />
    </svg>
  );
}
