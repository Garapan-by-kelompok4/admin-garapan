import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchInputProps = React.ComponentProps<typeof Input> & {
  containerClassName?: string;
};

export function SearchInput({
  className,
  containerClassName,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative", containerClassName)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400"
        strokeWidth={1.75}
      />
      <Input placeholder="Cari…" className={cn("h-9 pl-9", className)} {...props} />
    </div>
  );
}
