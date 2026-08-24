import type { OnboardingAnswers } from "@/components/onboarding-modal";
import type { TimeEntry } from "@/components/recent-entries";
import type { TimerEntry } from "@/components/timer";

export interface DraftPlan {
  client: string;
  rate: string;
  project: string;
  tags: string[];
  entries: TimeEntry[];
}

export interface PersistedState {
  answers: OnboardingAnswers | null;
  plan: DraftPlan | null;
  entries: TimeEntry[];
  timerEntry: TimerEntry | null;
  approved: boolean;
}

const KEY = "focus.onboarding.v1";
export const REOPEN_KEY = "focus.onboarding.reopen";
export const REOPEN_EVENT = "focus:reopen-onboarding";

export function loadState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      answers: parsed.answers ?? null,
      plan: parsed.plan ?? null,
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      timerEntry: parsed.timerEntry ?? null,
      approved: !!parsed.approved,
    };
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}

export function clearState() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function requestReopenOnboarding() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REOPEN_KEY, "1");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(REOPEN_EVENT));
}

export function consumeReopenRequest(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const flag = window.localStorage.getItem(REOPEN_KEY);
    if (flag) window.localStorage.removeItem(REOPEN_KEY);
    return !!flag;
  } catch {
    return false;
  }
}
