"use client";

import { BadgeCheck, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useRef, useState } from "react";
import {
  ACCOUNT_TYPES,
  type AccountType,
  getAccountInfo,
} from "../lib/accounts";
import { AUTH_SERVICE } from "../services/auth-service/auth-service";
import formStyles from "./AccountForm.module.css";
import InputIcon from "./InputIcon";

export default function VerificationResubmission() {
  const [email, setEmail] = useState("");
  const password = useRef<HTMLInputElement>(null);
  const pending = useRef(false);
  const [accountType, setAccountType] = useState<AccountType | "">("");
  const [licence, setLicence] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const info = getAccountInfo(accountType || undefined);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || !info || !password.current?.value) return;
    if (!email.trim() || !licence.trim()) {
      setError("Enter your email address and new licence number.");
      return;
    }
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await AUTH_SERVICE.resubmitVerification({
        email: email.trim(),
        password: password.current.value,
        registry: info.registry,
        license_number: licence.trim(),
      });
      if (!response.success) {
        setError(
          response.status === 429
            ? "Too many attempts. Wait at least a minute before trying again."
            : response.message ||
                "We couldn't submit your licence. Check your credentials and whether your account is awaiting new evidence.",
        );
        return;
      }
      setComplete(true);
      setEmail("");
      setLicence("");
    } catch {
      setError("We couldn't reach the service. Please try again.");
    } finally {
      if (password.current) password.current.value = "";
      pending.current = false;
      setBusy(false);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-2 focus:outline-blue-700";
  return (
    <main
      className={`${formStyles.page} flex min-h-svh items-center justify-center px-5 py-12`}
    >
      <section
        aria-labelledby="verification-resubmit-title"
        className={`${formStyles.card} w-full max-w-lg p-6 sm:p-8`}
      >
        <p className="mb-6 text-lg font-bold text-blue-900">Oncosourz</p>
        <h1 id="verification-resubmit-title" className="text-2xl font-bold">
          {complete
            ? "Licence submitted for review"
            : "Submit your new licence"}
        </h1>
        {complete ? (
          <output className="mt-3 block text-sm leading-6 text-slate-600">
            Your new evidence has been submitted. Your account remains inactive
            during review. Access will be restored only after approval and the
            required facility and membership checks.
          </output>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Use this form after an administrator changes your professional
              account type and asks for new licence evidence. Your account must
              be inactive and awaiting new evidence in manual review.
            </p>
            <form method="post" onSubmit={submit} className="mt-6">
              <fieldset
                disabled={busy}
                className="space-y-4 disabled:opacity-60"
              >
                <fieldset className={formStyles.group}>
                  <legend>Account access</legend>
                  <label className="block text-sm font-medium">
                    Account email
                    <InputIcon icon={Mail}>
                      <input
                        required
                        type="email"
                        name="email"
                        autoComplete="username"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className={inputClass}
                      />
                    </InputIcon>
                  </label>
                  <label className="block text-sm font-medium">
                    Current password
                    <InputIcon icon={LockKeyhole}>
                      <input
                        required
                        ref={password}
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        className={inputClass}
                      />
                    </InputIcon>
                  </label>
                </fieldset>
                <fieldset className={formStyles.group}>
                  <legend>Professional details</legend>
                  <label className="block text-sm font-medium">
                    New account type
                    <InputIcon icon={UserRound}>
                      <select
                        required
                        value={accountType}
                        onChange={(event) =>
                          setAccountType(event.target.value as AccountType)
                        }
                        className={inputClass}
                        aria-describedby="registry-note"
                      >
                        <option value="" disabled>
                          Select your updated account type
                        </option>
                        {ACCOUNT_TYPES.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </InputIcon>
                  </label>
                  <p
                    id="registry-note"
                    className="text-xs leading-5 text-slate-600"
                  >
                    {info
                      ? `Registry: ${info.registry}. This must match the account type assigned by your administrator.`
                      : "Choose the account type assigned by your administrator to identify the required registry."}
                  </p>
                  <label className="block text-sm font-medium">
                    New licence number
                    <InputIcon icon={BadgeCheck}>
                      <input
                        required
                        name="license_number"
                        autoComplete="off"
                        value={licence}
                        onChange={(event) => setLicence(event.target.value)}
                        className={inputClass}
                      />
                    </InputIcon>
                  </label>
                </fieldset>
                <button
                  type="submit"
                  disabled={busy || !info}
                  className="w-full rounded-lg bg-blue-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {busy ? "Submitting…" : "Submit for review"}
                </button>
              </fieldset>
              {error && (
                <p role="alert" className="mt-4 text-sm text-red-700">
                  {error}
                </p>
              )}
            </form>
          </>
        )}
        <nav
          aria-label="Account access"
          className="mt-6 flex flex-wrap gap-4 text-sm font-medium text-blue-900"
        >
          <Link href="/login">Back to sign in</Link>
          {!complete && <Link href="/forgot-password">Forgot password?</Link>}
        </nav>
      </section>
    </main>
  );
}
