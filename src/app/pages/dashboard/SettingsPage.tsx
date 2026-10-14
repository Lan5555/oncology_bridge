"use client";

import { useEffect, useState } from "react";
import { SETTINGS_SERVICE } from "@/app/services/settings-service/settings-service";
import { useProvider } from "@/app/providers/provider";
import { UserResponse } from "@/app/models/user-model";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  const { userData, setUser } = useProvider();
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    void Promise.all([
      SETTINGS_SERVICE.getSettings(),
      SETTINGS_SERVICE.me(),
    ]).then(([settingsResponse, profileResponse]) => {
      if (settingsResponse.success)
        setSettings(
          (settingsResponse.data as any)?.settings ??
            settingsResponse.data ??
            {},
        );
      if (profileResponse.success && profileResponse.data) {
        const user = (profileResponse.data as any).user ?? profileResponse.data;
        const session = JSON.parse(
          window.localStorage.getItem("userSession") ?? "{}",
        );
        const updated = { ...session, user };
        window.localStorage.setItem("userSession", JSON.stringify(updated));
        setUser(UserResponse.fromJson(updated));
      }
    });
  }, [setUser]);
  const saveSettings = async () => {
    setSaving(true);
    const response = await SETTINGS_SERVICE.save(settings);
    setNotice(
      response.message ||
        (response.success ? "Settings saved." : "Settings could not be saved."),
    );
    setSaving(false);
  };
  const update = (key: string, value: unknown) =>
    setSettings((current) => ({ ...current, [key]: value }));
  return (
    <div className="block animate-fade-up">
      <header className="mb-6 rounded-2xl border border-g200 bg-linear-to-br from-w via-w to-pll p-5 shadow-sm">
        <h1 className="flex items-center gap-2 text-xl font-bold text-g900">
          <Settings className="size-5 text-p" aria-hidden="true" />
          Settings
        </h1>
        <p className="mt-1 text-[12.5px] text-g500">
          Profile and network configuration
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border border-g200 bg-w p-6">
          <h2 className="mb-4 text-[15px] font-bold text-g900">Profile</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["first_name", "First name"],
              ["last_name", "Last name"],
              ["email", "Email"],
              ["phone", "Phone"],
            ].map(([key, label]) => (
              <label className="text-xs font-semibold text-g600" key={key}>
                {label}
                <input
                  className="mt-1 w-full rounded-lg border border-g200 px-3 py-2 text-sm font-normal"
                  value={(userData.user as any)?.[key] ?? ""}
                  onChange={(event) =>
                    setUser(
                      UserResponse.fromJson({
                        ...userData,
                        user: { ...userData.user, [key]: event.target.value },
                      }),
                    )
                  }
                />
              </label>
            ))}
          </div>
          <button
            className="mt-4 rounded-lg border border-g200 px-4 py-2 text-sm font-semibold text-g700"
            onClick={() =>
              void SETTINGS_SERVICE.updateMe({
                first_name: (userData.user as any)?.first_name,
                last_name: (userData.user as any)?.last_name,
                email: (userData.user as any)?.email,
                phone: (userData.user as any)?.phone,
              }).then((response) =>
                setNotice(
                  response.message ||
                    (response.success
                      ? "Profile updated."
                      : "Profile update failed."),
                ),
              )
            }
            type="button"
          >
            Update profile
          </button>
        </section>
        <section className="rounded-xl border border-g200 bg-w p-6">
          <h2 className="mb-4 text-[15px] font-bold text-g900">
            General configuration
          </h2>
          <label className="mb-3 block text-xs font-semibold text-g600">
            Network name
            <input
              className="mt-1 w-full rounded-lg border border-g200 px-3 py-2 text-sm font-normal"
              value={settings.networkName ?? ""}
              onChange={(event) => update("networkName", event.target.value)}
            />
          </label>
          <label className="mb-3 block text-xs font-semibold text-g600">
            Alert threshold (days)
            <input
              className="mt-1 w-full rounded-lg border border-g200 px-3 py-2 text-sm font-normal"
              type="number"
              min="1"
              value={settings.alertThresholdDays ?? ""}
              onChange={(event) =>
                update("alertThresholdDays", Number(event.target.value))
              }
            />
          </label>
          <label className="mb-3 block text-xs font-semibold text-g600">
            Currency
            <select
              className="mt-1 w-full rounded-lg border border-g200 px-3 py-2 text-sm font-normal"
              value={settings.currency ?? "NGN"}
              onChange={(event) => update("currency", event.target.value)}
            >
              <option value="NGN">NGN</option>
              <option value="USD">USD</option>
            </select>
          </label>
          <label className="mb-4 block text-xs font-semibold text-g600">
            Notification email
            <input
              className="mt-1 w-full rounded-lg border border-g200 px-3 py-2 text-sm font-normal"
              type="email"
              value={settings.notificationEmail ?? ""}
              onChange={(event) =>
                update("notificationEmail", event.target.value)
              }
            />
          </label>
          <button
            disabled={saving}
            className="rounded-lg bg-p px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            onClick={() => void saveSettings()}
            type="button"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
          {notice ? (
            <p role="status" className="mt-3 text-xs text-g500">
              {notice}
            </p>
          ) : null}
        </section>
        <section className="rounded-xl border border-g200 bg-w p-6">
          <h2 className="mb-4 text-[15px] font-bold text-g900">
            Security controls
          </h2>
          {(
            [
              ["twoFactor", "Two-factor authentication"],
              ["biometric", "Biometric sign-in"],
              ["ipLockdown", "IP lockdown"],
              ["offlineMode", "Offline mode"],
            ] as const
          ).map(([key, label]) => (
            <label
              className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-g50 p-3 text-sm text-g700"
              key={key}
            >
              {label}
              <input
                type="checkbox"
                checked={Boolean(settings[key])}
                onChange={(event) => update(key, event.target.checked)}
              />
            </label>
          ))}
          <button
            className="mt-3 rounded-lg border border-g200 px-4 py-2 text-xs font-semibold text-g700"
            onClick={() => void saveSettings()}
            type="button"
          >
            Save security controls
          </button>
        </section>
      </div>
    </div>
  );
}
