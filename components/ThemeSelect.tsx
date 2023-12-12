import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "react-feather";
import { cx } from "@/lib/utils";

const THEME_MAP: { [key: string]: React.ReactNode } = {
  light: <Sun width=".9em" />,
  dark: <Moon width=".9em" />,
};

export const ThemeSelect = () => {
  const [mounted, setMounted] = useState(false);
  const { theme: activeTheme, setTheme } = useTheme();

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const themeSwitcherStyle = {
    display: 'flex',
    borderRadius: '9999px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
  };

  const themeOptionStyle = {
    flex: 1,
    padding: '1px 10px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    borderRadius: '9999px',
  };

  return (
    <div style={themeSwitcherStyle} className={cx(
      "bg-gray-200",
      "dark:bg-gray-900"
    )}>
      {Object.keys(THEME_MAP).map((theme) => (
        <button
          key={theme}
          style={themeOptionStyle}
          onClick={() => setTheme(activeTheme === "light" ? 'dark' : 'light')}
          className={cx(
            "flex-0 py-0 px-0 transition-colors duration-300 focus:outline-none",
            {
              "bg-gray-50 text-gray-900": activeTheme === theme,
              "text-gray-300 hover:text-gray-950": activeTheme !== theme,
            },
            {
              "dark:bg-gray-500 dark:text-gray-950": activeTheme === theme,
              "dark:text-gray-500 dark:hover:text-gray-50": activeTheme !== theme,
            }
          )}
        >
          {THEME_MAP[theme]}
        </button>
      ))}
    </div>
  );
};
