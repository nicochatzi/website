import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "react-feather";
import { cx } from "@/lib/utils";

const icons = { light: Sun, dark: Moon };

export const ThemeSelect = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="inline-flex rounded-full bg-gray-200 p-0.5 dark:bg-gray-900">
      {Object.entries(icons).map(([theme, Icon]) => (
        <button
          type="button"
          key={theme}
          aria-label={`Use ${theme} theme`}
          aria-pressed={resolvedTheme === theme}
          onClick={() => setTheme(theme)}
          className={cx(
            "grid h-7 w-9 cursor-pointer place-items-center rounded-full",
            "text-gray-700 hover:text-gray-950 dark:text-gray-300 dark:hover:text-gray-50",
            "aria-pressed:bg-gray-50 aria-pressed:text-gray-950 dark:aria-pressed:bg-gray-700 dark:aria-pressed:text-gray-50",
          )}
        >
          <Icon size={16} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
};
