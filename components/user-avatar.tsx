import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarClass, initials } from "@/lib/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  className?: string;
}

export function UserAvatar({ name, avatarUrl, className }: UserAvatarProps) {
  const displayName = name || "?";

  return (
    <Avatar className={cn("shadow-sm", className)}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
      <AvatarFallback
        className={cn("font-bold text-white", avatarClass(displayName))}
      >
        {initials(displayName)}
      </AvatarFallback>
    </Avatar>
  );
}
