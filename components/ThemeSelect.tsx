import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "react-feather";
import { cx } from "@/lib/utils";

const THEME_MAP: { [key: string]: { icon: React.ReactNode } } = {
  light: {
    icon: <Sun width=".9em" />,
  },
  dark: {
    icon: <Moon width=".9em" />,
  },
};

export const ThemeSelect = () => {
  const [mounted, setMounted] = useState(false);
  const { theme: activeTheme, themes, setTheme } = useTheme();

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setTheme(e.target.value);

  const handleThemeChange = (theme: string) => {
    setTheme(theme);
  };
  //
  // return (
  //   <div className="relative inline-block">
  //     <label htmlFor="theme-menu" className="sr-only">
  //       Toggle theme
  //     </label>
  //     <span
  //       aria-hidden={true}
  //       className={cx(
  //         "absolute top-1/2 -translate-y-1/2 left-2 pointer-events-none",
  //         "opacity-50"
  //       )}
  //     >
  //       {THEME_MAP[activeTheme!].icon}
  //     </span>
  //     <span
  //       aria-hidden={true}
  //       className="absolute top-1/2 -translate-y-1/2 right-2 pointer-events-none"
  //     >
  //       <Code width=".9em" className="rotate-90 opacity-50" />
  //     </span>
  //     <select
  //       id="theme-menu"
  //       className={cx(
  //         "appearance-none rounded-md sm:w-full pl-8 pr-12 border",
  //         "bg-gray-200 border-gray-200",
  //         "dark:bg-gray-800 dark:border-gray-800"
  //       )}
  //       onChange={handleChange}
  //       value={activeTheme}
  //     >
  //       {themes.map((theme) => {
  //         return (
  //           <option key={theme} value={theme}>
  //             {THEME_MAP[theme].label}
  //           </option>
  //         );
  //       })}
  //     </select>
  //   </div>
  // );

  const themeSwitcherStyle = {
    display: 'flex',
    borderRadius: '9999px', // Creates pill shape
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
  };

  const themeOptionStyle = (theme) => ({
    flex: 1,
    padding: '10px 20px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    borderRadius: '9999px', // Maintain pill shape
  });

  return (
    <div style={themeSwitcherStyle}>
      {Object.keys(THEME_MAP).map((theme) => (
        <button
          key={theme}
          style={themeOptionStyle(theme)}
          onClick={() => handleThemeChange(theme)}
          className={cx(
            "flex-1 py-2 px-4 transition-colors duration-300 focus:outline-none", // Common styles
            {
              "bg-gray-300 dark:bg-gray-800": activeTheme !== theme, // Non-active theme style
              "bg-blue-500 text-white dark:bg-blue-600": activeTheme === theme, // Active theme style
            }
          )}
        >
          {THEME_MAP[theme].icon}
        </button>
      ))}
    </div>
  );
};
