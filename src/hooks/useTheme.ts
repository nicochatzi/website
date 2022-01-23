import { useEffect, useState } from 'react';
import Theme, { ThemeDef } from '../theme';
import { getCurrentTheme, setCurrentTheme } from '../theme/themes';

export const useTheme = (): [ThemeDef, () => ThemeDef] => {
  const [theme, setTheme] = useState(getCurrentTheme() ?? Theme.dark);

  const set = (theme: ThemeDef): ThemeDef => {
    setCurrentTheme(theme);
    setTheme(theme);
    return theme;
  };

  const toggleTheme = (): ThemeDef =>
    theme?.background === Theme.dark.background
      ? set(Theme.light)
      : set(Theme.dark);

  useEffect(() => {
    const storedTheme = getCurrentTheme();
    storedTheme && setTheme(storedTheme);
  }, []);

  return [theme, toggleTheme];
};
