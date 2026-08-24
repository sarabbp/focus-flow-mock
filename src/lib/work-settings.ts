import { useCallback, useEffect, useState } from "react";

import { DEFAULT_WORK_SETTINGS, type WorkSettings } from "@/lib/schedule";

const KEY = "focus.work-settings.v1";
export const SETTINGS_EVENT = "focus:work-settings-changed";

export function loadWorkSettings(): WorkSettings {
  if (typeof window === "undefined") return DEFAULT_WORK_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_WORK_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<WorkSettings>;
    return {
      startHour: Number(parsed.startHour ?? DEFAULT_WORK_SETTINGS.startHour),
      endHour: Number(parsed.endHour ?? DEFAULT_WORK_SETTINGS.endHour),
      weekdays: Array.isArray(parsed.weekdays) && parsed.weekdays.length
        ? parsed.weekdays.map(Number).sort((a, b) => a - b)
        : DEFAULT_WORK_SETTINGS.weekdays,
      lunchStart: Number(parsed.lunchStart ?? DEFAULT_WORK_SETTINGS.lunchStart),
      lunchEnd: Number(parsed.lunchEnd ?? DEFAULT_WORK_SETTINGS.lunchEnd),
      gapMinutes: Number(parsed.gapMinutes ?? DEFAULT_WORK_SETTINGS.gapMinutes),
    };
  } catch {
    return DEFAULT_WORK_SETTINGS;
  }
}

export function saveWorkSettings(settings: WorkSettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}

/** Reads settings after hydration and stays in sync across the app. */
export function useWorkSettings() {
  const [settings, setSettings] = useState<WorkSettings>(DEFAULT_WORK_SETTINGS);

  useEffect(() => {
    setSettings(loadWorkSettings());
    const sync = () => setSettings(loadWorkSettings());
    window.addEventListener(SETTINGS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SETTINGS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((next: WorkSettings) => {
    setSettings(next);
    saveWorkSettings(next);
  }, []);

  return { settings, update };
}
