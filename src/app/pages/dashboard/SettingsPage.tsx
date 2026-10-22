"use client";

import {
  Bell,
  Building2,
  Check,
  Info,
  Loader2,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getAccountInfo } from "@/app/lib/accounts";
import { UserResponse } from "@/app/models/user-model";
import { useProvider } from "@/app/providers/provider";
import { SETTINGS_SERVICE } from "@/app/services/settings-service/settings-service";
import styles from "./SettingsPage.module.css";
import ApiOptionSelect from "@/app/components/ApiOptionSelect";

type Section = "profile" | "preferences" | "security";
type Profile = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};
type Preferences = Record<string, unknown>;
const asObject = (value: unknown): Preferences =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Preferences)
    : {};
const profileFrom = (value: unknown): Profile => {
  const row = asObject(value);
  return {
    first_name: String(row.first_name ?? ""),
    last_name: String(row.last_name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
  };
};
const tabs = [
  {
    id: "profile" as const,
    label: "Profile",
    detail: "Your personal information",
    icon: UserRound,
  },
  {
    id: "preferences" as const,
    label: "Preferences",
    detail: "Workspace and notifications",
    icon: Bell,
  },
  {
    id: "security" as const,
    label: "Security",
    detail: "Access and device preferences",
    icon: ShieldCheck,
  },
];
const controls = [
  {
    key: "twoFactor",
    label: "Two-factor authentication",
    description: "Require an additional verification step when signing in.",
  },
  {
    key: "biometric",
    label: "Biometric sign-in",
    description: "Allow biometric sign-in on supported devices.",
  },
  {
    key: "ipLockdown",
    label: "IP restrictions",
    description: "Restrict access according to your configured network policy.",
  },
  {
    key: "offlineMode",
    label: "Offline scan queue",
    description:
      "Allow scan records to be queued on this device while offline.",
  },
];
const preferenceKeys = [
  "networkName",
  "alertThresholdDays",
  "currency",
  "notificationEmail",
];
const securityKeys = controls.map((control) => control.key);

export default function SettingsPage() {
  const { userData, setUser } = useProvider();
  const [section, setSection] = useState<Section>("profile");
  const [profile, setProfile] = useState<Profile>(() =>
    profileFrom(userData.user),
  );
  const [savedProfile, setSavedProfile] = useState(profile);
  const [preferences, setPreferences] = useState<Preferences>({});
  const [savedPreferences, setSavedPreferences] = useState<Preferences>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [lastSaved, setLastSaved] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setProfileError("");
    setSettingsError("");
    const [settingsResponse, profileResponse] = await Promise.all([
      SETTINGS_SERVICE.getSettings(),
      SETTINGS_SERVICE.me(),
    ]);
    if (settingsResponse.success) {
      const data = asObject(settingsResponse.data);
      const next = asObject(data.settings ?? data);
      setPreferences(next);
      setSavedPreferences(next);
    } else {
      const message =
        settingsResponse.message || "Preferences could not be loaded.";
      setSettingsError(message);
      toast.error(message, { id: "settings-load-error" });
    }
    if (profileResponse.success && profileResponse.data) {
      const data = asObject(profileResponse.data);
      const next = profileFrom(data.user ?? data);
      setProfile(next);
      setSavedProfile(next);
    } else {
      const message =
        profileResponse.message || "Your profile could not be loaded.";
      setProfileError(message);
      toast.error(message, { id: "profile-load-error" });
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const keys = section === "security" ? securityKeys : preferenceKeys;
  const dirty =
    section === "profile"
      ? JSON.stringify(profile) !== JSON.stringify(savedProfile)
      : keys.some((key) => preferences[key] !== savedPreferences[key]);
  const loadError = section === "profile" ? profileError : settingsError;
  const availableSecurityControls = controls.filter(
    (control) => typeof preferences[control.key] === "boolean",
  );
  const updatePreference = (key: string, value: unknown) =>
    setPreferences((current) => ({ ...current, [key]: value }));
  const reset = () => {
    if (section === "profile") setProfile(savedProfile);
    else
      setPreferences((current) => {
        const next = { ...current };
        for (const key of keys) {
          if (key in savedPreferences) next[key] = savedPreferences[key];
          else delete next[key];
        }
        return next;
      });
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || loading || loadError || !dirty) return;
    setSaving(true);
    const id = toast.loading(
      section === "profile"
        ? "Updating your profile..."
        : "Saving your preferences...",
    );
    try {
      if (section === "profile") {
        const draft = {
          first_name: profile.first_name.trim(),
          last_name: profile.last_name.trim(),
          email: profile.email.trim(),
          phone: profile.phone.trim(),
        };
        const response = await SETTINGS_SERVICE.updateMe(draft);
        if (!response.success)
          throw new Error(
            response.message || "Your profile could not be updated.",
          );
        const data = asObject(response.data);
        const returned = asObject(data.user ?? data);
        const saved = profileFrom({
          ...draft,
          ...Object.fromEntries(
            Object.entries(returned).filter(([key]) => key in draft),
          ),
        });
        let updated = { ...userData, user: { ...userData.user, ...saved } };
        setProfile(saved);
        setSavedProfile(saved);
        try {
          const stored = JSON.parse(
            localStorage.getItem("userSession") || "{}",
          );
          updated = {
            ...updated,
            ...stored,
            user: { ...updated.user, ...stored.user, ...saved },
          };
          localStorage.setItem("userSession", JSON.stringify(updated));
          setUser(UserResponse.fromJson(updated));
        } catch {
          setUser(UserResponse.fromJson(updated));
          toast.warning(
            "Profile saved. Sign in again to refresh your saved session.",
            { id },
          );
          setLastSaved(
            new Date().toLocaleTimeString("en-NG", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          );
          return;
        }
        toast.success(response.message || "Your profile has been updated.", {
          id,
        });
      } else {
        const threshold = Number(preferences.alertThresholdDays);
        if (
          section === "preferences" &&
          (!Number.isInteger(threshold) || threshold < 1)
        )
          throw new Error(
            "Enter a whole number greater than zero for the expiry alert threshold.",
          );
        const payload = { ...savedPreferences };
        for (const key of keys)
          if (key in preferences) payload[key] = preferences[key];
        const response = await SETTINGS_SERVICE.save(payload);
        if (!response.success)
          throw new Error(
            response.message ||
              "Preferences could not be saved. Your changes have been kept.",
          );
        const data = asObject(response.data);
        const returned = asObject(data.settings ?? data);
        const saved = {
          ...payload,
          ...Object.fromEntries(
            Object.entries(returned).filter(([key]) => key in payload),
          ),
        };
        setSavedPreferences(saved);
        setPreferences((current) => {
          const next = { ...current };
          for (const key of keys) if (key in saved) next[key] = saved[key];
          return next;
        });
        toast.success(
          response.message ||
            (section === "security"
              ? "Security preferences saved."
              : "Workspace preferences saved."),
          { id },
        );
      }
      setLastSaved(
        new Date().toLocaleTimeString("en-NG", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Changes could not be saved. Please try again.",
        { id },
      );
    } finally {
      setSaving(false);
    }
  };
  const account = getAccountInfo(userData.user?.account_type);
  return (
    <div className="animate-fade-up space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-p">
            Your workspace
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-g900">
            Account settings
          </h1>
          <p className="mt-2 text-xs leading-6 text-g500">
            Manage your profile, workspace preferences, and account security.
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-g200 bg-w px-3 py-2 text-xs text-g500">
          <Settings className="size-3.5" />
          Personalize your workspace
        </span>
      </header>
      <div className={styles.layout}>
        <aside>
          <nav className={styles.navigation} aria-label="Settings sections">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  type="button"
                  key={tab.id}
                  aria-current={section === tab.id ? "page" : undefined}
                  disabled={saving}
                  onClick={() => setSection(tab.id)}
                >
                  <Icon className="size-[18px] shrink-0" />
                  <span>
                    {tab.label}
                    <small>{tab.detail}</small>
                  </span>
                </button>
              );
            })}
          </nav>
          <div className={styles.identity}>
            <Building2 className="size-5 text-p" />
            <strong>{userData.user?.hospital?.name || "Your facility"}</strong>
            <p>{account?.label || "Network member"}</p>
            <p>
              Licence status:{" "}
              {userData.user?.verification_status?.replaceAll("_", " ") ||
                "Not provided"}
            </p>
          </div>
        </aside>
        <form
          className={styles.panel}
          onSubmit={submit}
          aria-busy={loading || saving}
        >
          <div className={styles.panelHeader}>
            <h2>
              {section === "profile"
                ? "Personal information"
                : section === "preferences"
                  ? "Workspace preferences"
                  : "Security & device preferences"}
            </h2>
            <p>
              {section === "profile"
                ? "Keep your name and contact details up to date."
                : section === "preferences"
                  ? "Choose how your workspace handles alerts and notifications."
                  : "Manage your account access and offline preferences."}
            </p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center gap-3 p-14 text-sm text-g500">
              <Loader2 className="size-5 animate-spin" />
              Loading your settings...
            </div>
          ) : loadError ? (
            <div role="alert" className={styles.error}>
              <p>{loadError}</p>
              <button
                type="button"
                className={styles.secondary + " mt-4"}
                onClick={() => void load()}
              >
                <RefreshCw className="size-3.5" />
                Try again
              </button>
            </div>
          ) : (
            <fieldset disabled={saving} className={styles.body}>
              {section === "profile" ? (
                <>
                  <div className="flex items-center gap-4">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-g200 bg-pl text-lg font-bold text-p">
                      {[savedProfile.first_name[0], savedProfile.last_name[0]]
                        .filter(Boolean)
                        .join("") || <UserRound className="size-6" />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-g800">
                        {[savedProfile.first_name, savedProfile.last_name]
                          .filter(Boolean)
                          .join(" ") || "Your profile"}
                      </p>
                      <p className="mt-1 text-xs text-g500">
                        {account?.label || "Professional account"}
                      </p>
                    </div>
                  </div>
                  <div className={styles.fields}>
                    {(
                      [
                        {
                          key: "first_name",
                          label: "First name",
                          type: "text",
                          autoComplete: "given-name",
                        },
                        {
                          key: "last_name",
                          label: "Last name",
                          type: "text",
                          autoComplete: "family-name",
                        },
                        {
                          key: "email",
                          label: "Work email",
                          type: "email",
                          autoComplete: "email",
                        },
                        {
                          key: "phone",
                          label: "Phone number",
                          type: "tel",
                          autoComplete: "tel",
                        },
                      ] as const
                    ).map((field) => (
                      <label key={field.key} className={styles.field}>
                        {field.label}
                        <input
                          required={field.key !== "phone"}
                          type={field.type}
                          autoComplete={field.autoComplete}
                          value={profile[field.key]}
                          onChange={(event) =>
                            setProfile((current) => ({
                              ...current,
                              [field.key]: event.target.value,
                            }))
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <p className={styles.hint}>
                    <Info className="mt-0.5 size-4 shrink-0" />
                    Your role, facility membership, and licence details are
                    managed through their respective review processes.
                  </p>
                </>
              ) : section === "preferences" ? (
                <div className={styles.fields}>
                  <label className={styles.field}>
                    Network name
                    <input
                      value={String(preferences.networkName ?? "")}
                      onChange={(event) =>
                        updatePreference("networkName", event.target.value)
                      }
                    />
                    <small>The name associated with your workspace.</small>
                  </label>
                  <label className={styles.field}>
                    Expiry alert threshold
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={String(preferences.alertThresholdDays ?? "")}
                      onChange={(event) =>
                        updatePreference(
                          "alertThresholdDays",
                          event.target.value === ""
                            ? ""
                            : Number(event.target.value),
                        )
                      }
                    />
                    <small>Days before expiry to flag stock for review.</small>
                  </label>
                  <ApiOptionSelect
                    context="settings"
                    field="currencies"
                    label="Currency"
                    required
                    value={String(preferences.currency ?? "")}
                    onChange={(value) => updatePreference("currency", value)}
                    className={styles.field}
                  />
                  <label className={styles.field}>
                    Notification email
                    <input
                      type="email"
                      value={String(preferences.notificationEmail ?? "")}
                      onChange={(event) =>
                        updatePreference(
                          "notificationEmail",
                          event.target.value,
                        )
                      }
                    />
                    <small>
                      The email address used for workspace notifications.
                    </small>
                  </label>
                </div>
              ) : (
                <>
                  <div>
                    {!availableSecurityControls.length && (
                      <p className={styles.hint}>
                        No security preferences were returned for this account.
                      </p>
                    )}
                    {availableSecurityControls.map((control) => (
                      <div key={control.key} className={styles.switchRow}>
                        <div>
                          <h3 id={"setting-" + control.key}>{control.label}</h3>
                          <p id={"setting-help-" + control.key}>
                            {control.description}
                          </p>
                        </div>
                        <button
                          className={styles.switch}
                          type="button"
                          role="switch"
                          aria-checked={Boolean(preferences[control.key])}
                          aria-labelledby={"setting-" + control.key}
                          aria-describedby={"setting-help-" + control.key}
                          onClick={() =>
                            updatePreference(
                              control.key,
                              !preferences[control.key],
                            )
                          }
                        >
                          <span />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className={styles.hint}>
                    <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                    These preferences require support from your account service.
                    Saving a preference does not complete device or two-factor
                    enrollment.
                  </p>
                </>
              )}
            </fieldset>
          )}
          <footer className={styles.footer}>
            <p aria-live="polite">
              {dirty
                ? "You have unsaved changes"
                : lastSaved
                  ? "Saved at " + lastSaved
                  : "Changes are applied after you save"}
            </p>
            <div>
              <button
                type="button"
                className={styles.secondary}
                disabled={saving || loading || !dirty || Boolean(loadError)}
                onClick={reset}
              >
                Discard changes
              </button>
              <button
                type="submit"
                className={styles.primary}
                disabled={saving || loading || !dirty || Boolean(loadError)}
              >
                {saving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : lastSaved && !dirty ? (
                  <Check className="size-3.5" />
                ) : (
                  <Save className="size-3.5" />
                )}
                {saving
                  ? "Saving..."
                  : section === "profile"
                    ? "Save profile"
                    : "Save preferences"}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
