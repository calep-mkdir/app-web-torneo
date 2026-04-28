import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-white/8 text-slate-200",
        outline: "border-white/10 bg-white/[0.03] text-foreground",
        success: "border-[#d3ff69]/18 bg-[#c7ff2f]/12 text-[#e8ff9a]",
        warning: "border-white/10 bg-white/[0.05] text-slate-100",
        destructive: "border-transparent bg-rose-400/18 text-rose-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
