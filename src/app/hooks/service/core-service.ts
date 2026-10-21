import { Routes } from "@/app/services/api-routes";
import { NetResponse } from "./net-response";

export const ADMIN_SESSION_INVALIDATED = "admin-session-invalidated";
export const DASHBOARD_DATA_CHANGED = "dashboard-data-changed";

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  admin?: boolean;
  facilityOnly?: boolean;
  headers?: Record<string, string>;
};

/** Shared REST client for the backend API documented in the project contract. */
export class CoreService {
  private BASE_URL = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "";

  public setBaseUrl(url: string): void {
    this.BASE_URL = url.replace(/\/$/, "");
  }

  private getSession(
    admin = false,
    facilityOnly = false,
  ): Record<string, any> | null {
    if (typeof window === "undefined") return null;
    try {
      const preferredKey = admin ? "adminSession" : "userSession";
      const preferred = localStorage.getItem(preferredKey);
      if (preferred) return JSON.parse(preferred);
      // Admin pages reuse shared user and facility views. Those views should
      // continue to send the authenticated admin bearer token when opened in
      // the admin console.
      if (!admin && !facilityOnly) {
        const adminSession = localStorage.getItem("adminSession");
        return adminSession ? JSON.parse(adminSession) : null;
      }
      return null;
    } catch {
      return null;
    }
  }

  private async refreshSession(): Promise<boolean> {
    if (typeof window === "undefined" || !localStorage.getItem("userSession"))
      return false;
    const session = this.getSession();
    if (!session?.refreshToken || !this.BASE_URL) return false;
    try {
      const response = await fetch(`${this.BASE_URL}${Routes.REFRESH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });
      const result = await response.json();
      if (!response.ok || result?.success === false) return false;
      const tokens = result?.data ?? result;
      const updated = { ...session, ...tokens, user: session.user };
      localStorage.setItem("userSession", JSON.stringify(updated));
      return Boolean(updated.token);
    } catch {
      return false;
    }
  }

  private async request(
    endpoint: string,
    options: RequestOptions = {},
    retried = false,
  ): Promise<NetResponse> {
    if (!this.BASE_URL) {
      return new NetResponse({
        success: false,
        message: "Set NEXT_PUBLIC_BASE_URL to your backend API origin.",
        data: null,
        status: 0,
      });
    }
    const session = this.getSession(options.admin, options.facilityOnly);
    const token = session?.token;
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...options.headers,
    };
    if (options.body !== undefined && !(options.body instanceof FormData))
      headers["Content-Type"] = "application/json";
    if (options.auth !== false && token)
      headers.Authorization = `Bearer ${token}`;
    const body =
      options.body === undefined
        ? undefined
        : options.body instanceof FormData
          ? options.body
          : JSON.stringify(options.body);

    try {
      const response = await fetch(
        `${this.BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`,
        {
          method: options.method ?? "GET",
          headers,
          body,
          cache: "no-store",
        },
      );
      if (
        response.status === 401 &&
        token &&
        !retried &&
        !options.admin &&
        !endpoint.includes("/auth/api/refresh")
      ) {
        if (await this.refreshSession())
          return this.request(endpoint, options, true);
      }
      const text = await response.text();
      let parsed: any = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = text;
      }
      const isEnvelope =
        parsed && typeof parsed === "object" && "success" in parsed;
      // Expire only the admin session that made this request. A delayed
      // response from an old token must not log out a newly signed-in admin.
      const authenticationFailed =
        response.status === 401 ||
        (response.status === 403 &&
          (/^(?:INVALID_TOKEN|TOKEN_EXPIRED|TOKEN_INVALID|UNAUTHENTICATED)$/i.test(
            String(parsed?.code ?? parsed?.error?.code ?? ""),
          ) ||
            /\b(?:invalid|expired)\s+(?:access\s+)?token\b|\btoken\s+(?:is\s+)?(?:invalid|expired)\b/i.test(
              String(parsed?.message ?? ""),
            )));
      if (
        options.auth !== false &&
        token &&
        authenticationFailed &&
        typeof window !== "undefined" &&
        this.getSession(true)?.token === token &&
        (options.admin || !localStorage.getItem("userSession"))
      ) {
        localStorage.removeItem("adminSession");
        window.dispatchEvent(new Event(ADMIN_SESSION_INVALIDATED));
      }
      const success = isEnvelope
        ? Boolean(parsed.success) && response.ok
        : response.ok;
      if (
        success &&
        options.auth !== false &&
        ["POST", "PUT", "PATCH", "DELETE"].includes(options.method ?? "GET") &&
        typeof window !== "undefined"
      ) {
        window.dispatchEvent(new Event(DASHBOARD_DATA_CHANGED));
      }
      return new NetResponse({
        success,
        message: isEnvelope
          ? (parsed.message ?? "")
          : response.ok
            ? ""
            : (parsed?.message ?? response.statusText),
        data: isEnvelope ? (parsed.data ?? null) : parsed,
        status: response.status,
        code:
          typeof parsed?.code === "string"
            ? parsed.code
            : typeof parsed?.error?.code === "string"
              ? parsed.error.code
              : undefined,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Network request failed.";
      return new NetResponse({
        success: false,
        message,
        data: null,
        status: 0,
      });
    }
  }

  public async send(
    endpoint: string,
    payload: unknown,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ) {
    return await this.request(endpoint, {
      ...options,
      method: "POST",
      body: payload,
    });
  }
  public async update(
    endpoint: string,
    payload: unknown,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ) {
    return await this.request(endpoint, {
      ...options,
      method: "PATCH",
      body: payload,
    });
  }
  public async put(
    endpoint: string,
    payload: unknown,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ) {
    return await this.request(endpoint, {
      ...options,
      method: "PUT",
      body: payload,
    });
  }
  public async delete(
    endpoint: string,
    payload?: unknown,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ) {
    return await this.request(endpoint, {
      ...options,
      method: "DELETE",
      body: payload,
    });
  }
  public async get(
    endpoint: string,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ) {
    return await this.request(endpoint, options);
  }
}
