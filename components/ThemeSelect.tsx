import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "react-feather";

export const ThemeSelect = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
  const Icon = nextTheme === "light" ? Sun : Moon;
  const label = `Use ${nextTheme} theme`;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(nextTheme)}
      className="inline-flex size-11 cursor-pointer items-center justify-center gap-0.5 text-sm leading-none text-muted hover:text-link focus-visible:text-link focus-visible:outline-2 focus-visible:outline-link"
    >
      <span aria-hidden="true">[</span>
      <Icon size={16} aria-hidden="true" />
      <span aria-hidden="true">]</span>
    </button>
  );
};
