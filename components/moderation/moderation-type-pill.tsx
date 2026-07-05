import type { ModerationContentType } from "@/lib/moderation/content-labels";
import { moderationContentLabels } from "@/lib/moderation/content-labels";

export function ModerationTypePill({
  contentType,
}: {
  contentType: ModerationContentType;
}) {
  const labels = moderationContentLabels(contentType);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${labels.typeBadgeClass}`}
    >
      {labels.typeLabel}
    </span>
  );
}
