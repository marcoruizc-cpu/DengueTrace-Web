import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';

const STORAGE_KEY = 'denguetrace-theme';

function readSaved(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved === 'dark';
  } catch {
    /* almacenamiento no disponible */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark') || readSaved());

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    } catch {
      /* almacenamiento no disponible */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={dark ? 'Modo claro' : 'Modo oscuro'}
      className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {dark ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
    </button>
  );
}
