import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "react-feather";
import { cx } from "@/lib/utils";

const THEME_MAP: { [key: string]: React.ReactNode } = {
  light: <Sun width=".9em" />,
  dark: <Moon width=".9em" />,
};

export const ThemeSelect = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme: activeTheme, setTheme } = useTheme();

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <span
      style={{
        display: "flex",
        borderRadius: "9999px",
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
      }}
      className={cx("bg-gray-200", "dark:bg-gray-900")}
    >
      {Object.keys(THEME_MAP).map((theme) => (
        <button
          type="button"
          key={theme}
          style={{
            flex: 1,
            padding: "1px 8px",
            cursor: "pointer",
            transition: "all 0.4s",
            borderRadius: "9999px",
            transform: activeTheme === theme ? "scale(1.2)" : "none",
          }}
          onClick={() => setTheme(activeTheme === "light" ? "dark" : "light")}
          className={cx(
            "border-2",
            {
              "bg-gray-50 border-gray-200 text-gray-900": activeTheme === theme,
              "text-gray-300 border-transparent hover:text-gray-950":
                activeTheme !== theme,
            },
            {
              "dark:bg-gray-500 dark:border-gray-900 dark:text-gray-950":
                activeTheme === theme,
              "dark:text-gray-500 dark:border-transparent dark:hover:text-gray-50":
                activeTheme !== theme,
            },
          )}
        >
          {THEME_MAP[theme]}
        </button>
      ))}
    </span>
  );
};
