import { window } from 'browser-monads';

export const localStorage = {
  set: (key: string, value: any) =>
    window?.localStorage &&
    window.localStorage.setItem(key, JSON.stringify(value)),
  get: (key: string): any => {
    if (window?.localStorage) {
      try {
        return JSON.parse(window.localStorage.getItem(key));
      } catch {}
    }
  },
};
