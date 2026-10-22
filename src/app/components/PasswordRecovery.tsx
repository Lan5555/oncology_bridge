"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { AUTH_SERVICE } from "../services/auth-service/auth-service";

export default function PasswordRecovery({
  mode,
}: {
  mode: "request" | "reset";
}) {
  const token = useRef("");
  const tokenRead = useRef(false);
  const [ready, setReady] = useState(mode === "request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode !== "reset" || tokenRead.current) return;
    tokenRead.current = true;
    const url = new URL(window.location.href);
    token.current = url.searchParams.get("token") ?? "";
    url.searchParams.delete("token");
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
    setReady(true);
  }, [mode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || complete) return;
    setError("");
    if (
      mode === "reset" &&
      (!token.current || password.length < 8 || password !== confirmation)
    ) {
      setError("Enter matching passwords with at least eight characters.");
      return;
    }
    setBusy(true);
    try {
      const response =
        mode === "request"
          ? await AUTH_SERVICE.forgotPassword(email.trim())
          : await AUTH_SERVICE.resetPassword({
              token: token.current,
              password,
            });
      if (!response.success) {
        setError(
          mode === "reset" &&
            [400, 401, 403, 404, 410, 422].includes(response.status ?? 0)
            ? "This reset link is invalid, expired, or already used. Request a new link below."
            : "We couldn't complete your request. Please try again.",
        );
        return;
      }
      token.current = "";
      setPassword("");
      setConfirmation("");
      setComplete(true);
    } catch {
      setError("We couldn't complete your request. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-2 focus:outline-blue-700";
  const missingToken = mode === "reset" && ready && !token.current && !complete;

  return (
    <main className="flex min-h-svh items-center justify-center bg-slate-50 px-5 py-12 text-slate-900">
      <section
        aria-labelledby="recovery-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <p className="mb-6 text-lg font-bold text-blue-900">Oncosourz</p>
        <h1 id="recovery-title" className="text-2xl font-bold">
          {complete
            ? mode === "request"
              ? "Check your email"
              : "Password reset"
            : mode === "request"
              ? "Forgot password?"
              : "Choose a new password"}
        </h1>
        {complete ? (
          <output className="mt-4 block text-sm leading-6 text-slate-600">
            {mode === "request"
              ? "If an account exists for that email, a reset link may arrive shortly. Links expire after 15 minutes. Check your spam folder. Please wait at least one minute before requesting another link; a new link replaces any previous one."
              : "Your password has been changed and existing refresh sessions have been revoked. Sign in with your new password. A security confirmation has been queued for email."}
          </output>
        ) : !ready ? (
          <output className="mt-4 block">Preparing password reset…</output>
        ) : missingToken ? (
          <p role="alert" className="mt-4 text-sm text-red-700">
            This page needs a reset link from your email. Request a new link
            below.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-5" aria-busy={busy}>
            <p className="text-sm leading-6 text-slate-600">
              {mode === "request"
                ? "Enter your account email to request a password reset link."
                : "Use at least eight characters. Reset links expire after 15 minutes and can only be used once."}
            </p>
            {mode === "request" ? (
              <label
                className="block text-sm font-medium"
                htmlFor="recovery-email"
              >
                Email address
                <input
                  id="recovery-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClass}
                  disabled={busy}
                />
              </label>
            ) : (
              <>
                <label
                  className="block text-sm font-medium"
                  htmlFor="recovery-password"
                >
                  New password
                  <input
                    id="recovery-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={inputClass}
                    disabled={busy}
                  />
                </label>
                <label
                  className="block text-sm font-medium"
                  htmlFor="recovery-confirmation"
                >
                  Confirm new password
                  <input
                    id="recovery-confirmation"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    className={inputClass}
                    disabled={busy}
                  />
                </label>
              </>
            )}
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-blue-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy
                ? "Please wait…"
                : mode === "request"
                  ? "Request reset link"
                  : "Reset password"}
            </button>
          </form>
        )}
        <nav
          aria-label="Password recovery"
          className="mt-6 flex flex-wrap gap-4 text-sm font-medium text-blue-900"
        >
          <a href="/login">Back to sign in</a>
          {((mode === "reset" && !complete) ||
            (mode === "request" && complete)) && (
            <a href="/forgot-password">Request a new link</a>
          )}
        </nav>
      </section>
    </main>
  );
}
