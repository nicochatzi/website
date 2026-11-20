import type { ComponentProps } from "react";
import { ChevronDown } from "react-feather";

export function AppSelect(props: ComponentProps<"select">) {
  return (
    <span className="relative inline-flex max-w-full min-w-0 text-link">
      <select
        {...props}
        className="min-h-9 w-full appearance-none rounded border border-muted/40 bg-transparent ps-2 pe-7 text-link hover:border-link"
      />
      <ChevronDown
        aria-hidden="true"
        size={14}
        className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2"
      />
    </span>
  );
}
