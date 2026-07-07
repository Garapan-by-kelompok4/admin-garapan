import { User } from "@/lib/api/users";

export function UserStatusPill({ user }: { user: Pick<User, "bannedAt" | "emailVerified"> }) {
  if (user.bannedAt !== null) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-danger-50 text-danger-700">
        <span className="h-1.5 w-1.5 rounded-full bg-danger-500" />
        Suspended
      </span>
    );
  }
  if (!user.emailVerified) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-warn-50 text-warn-700">
        <span className="h-1.5 w-1.5 rounded-full bg-warn-500" />
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success-50 text-success-700">
      <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
      Aktif
    </span>
  );
}
