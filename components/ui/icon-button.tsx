import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "inline-grid place-items-center rounded-[7px] border transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-border bg-surface text-ink-500 hover:bg-surface-3 hover:text-ink-700",
        ghost:
          "border-transparent text-ink-500 hover:bg-surface-3 hover:text-ink-700",
        danger:
          "border-border bg-surface text-ink-500 hover:bg-danger-50 hover:text-danger-500",
      },
      size: {
        sm: "size-[26px] [&_svg]:size-3.5",
        default: "size-8 [&_svg]:size-4",
        lg: "size-9 [&_svg]:size-[18px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

type IconButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof iconButtonVariants>;

/** Square bordered icon button (handoff "Icon btn"). */
export function IconButton({
  className,
  variant,
  size,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { iconButtonVariants };
