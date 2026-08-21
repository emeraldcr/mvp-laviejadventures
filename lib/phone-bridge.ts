import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const script = path.join(process.cwd(), "docs", "huawei-mao-lx9", "phone.py");
const python = process.env.PHONE_PYTHON || "python";

export type PhoneView = "summary" | "report" | "features";

export function bridgeEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.PHONE_BRIDGE_ENABLED === "true";
}

async function runPython(args: string[], timeout = 20_000) {
  const { stdout, stderr } = await execFileAsync(python, [script, ...args], {
    cwd: process.cwd(),
    timeout,
    windowsHide: true,
    maxBuffer: 2 * 1024 * 1024,
    env: { ...process.env, PYTHONIOENCODING: "utf-8" },
  });
  if (stderr.trim()) throw new Error(stderr.trim());
  return stdout.trim();
}

export async function readPhone(view: PhoneView) {
  const output = await runPython([view]);
  if (view === "features") return { features: output.split(/\r?\n/).filter(Boolean) };
  return JSON.parse(output) as unknown;
}

export const phoneActions = [
  "home", "back", "recents", "power", "wake", "volume-up", "volume-down", "mute",
  "notifications", "quick-settings", "wifi-settings", "bluetooth-settings", "display-settings",
  "sound-settings", "battery-settings", "storage-settings", "location-settings", "security-settings",
  "app-settings", "developer-settings", "tether-settings", "open-url", "type-hotspot-password",
] as const;

export type PhoneAction = (typeof phoneActions)[number];

const keycodes: Partial<Record<PhoneAction, string>> = {
  home: "3", back: "4", recents: "187", power: "26", wake: "224",
  "volume-up": "24", "volume-down": "25", mute: "164",
  notifications: "83", "quick-settings": "281",
};

const settingsActions: Partial<Record<PhoneAction, string>> = {
  "wifi-settings": "android.settings.WIFI_SETTINGS",
  "bluetooth-settings": "android.settings.BLUETOOTH_SETTINGS",
  "display-settings": "android.settings.DISPLAY_SETTINGS",
  "sound-settings": "android.settings.SOUND_SETTINGS",
  "battery-settings": "android.settings.BATTERY_SAVER_SETTINGS",
  "storage-settings": "android.settings.INTERNAL_STORAGE_SETTINGS",
  "location-settings": "android.settings.LOCATION_SOURCE_SETTINGS",
  "security-settings": "android.settings.SECURITY_SETTINGS",
  "app-settings": "android.settings.APPLICATION_SETTINGS",
  "developer-settings": "android.settings.APPLICATION_DEVELOPMENT_SETTINGS",
};

export async function phoneAction(action: PhoneAction, value?: string) {
  const keycode = keycodes[action];
  if (keycode) return runPython(["--confirm", "key", keycode]);
  const settingsIntent = settingsActions[action];
  if (settingsIntent) return runPython(["--confirm", "open-settings", settingsIntent]);
  if (action === "tether-settings") return runPython(["--confirm", "tether-settings"]);
  if (action === "type-hotspot-password") {
    if (!value || !/^[A-Za-z0-9._@#+=!-]{8,63}$/.test(value)) throw new Error("Password must be 8-63 allowed characters");
    await runPython(["--confirm", "replace-focused-password", value]);
    return "Password typed into the focused phone field";
  }
  if (!value || !/^https?:\/\//i.test(value) || value.length > 2048) throw new Error("A valid HTTP(S) URL is required");
  return runPython(["--confirm", "open-url", value]);
}
