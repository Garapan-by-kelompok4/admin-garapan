import { FlaggedContent } from "@/lib/api/content";

export function ModerationStatusPill({
  status,
}: {
  status: FlaggedContent["status"];
}) {
  switch (status) {
    case "Ditinjau":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-warn-50 text-warn-700">
          <span className="h-1.5 w-1.5 rounded-full bg-warn-500" />
          Ditinjau
        </span>
      );
    case "Aman":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success-50 text-success-700">
          <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
          Aman
        </span>
      );
    case "Dihapus":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-danger-50 text-danger-700">
          <span className="h-1.5 w-1.5 rounded-full bg-danger-500" />
          Dihapus
        </span>
      );
    case "Disembunyikan":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
          Disembunyikan
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700">
          {status}
        </span>
      );
  }
}
