import { avatarClass, initials } from "@/lib/avatar";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-6 text-[10px]",
  default: "size-8 text-xs",
  md: "size-9 text-[13px]",
  lg: "size-[72px] text-2xl",
} as const;

type UserAvatarProps = {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
};

/** Gradient initials avatar (handoff av-0…av-7), seeded from the name. */
export function UserAvatar({ name, size = "default", className }: UserAvatarProps) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-bold text-white",
        SIZES[size],
        avatarClass(name),
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
