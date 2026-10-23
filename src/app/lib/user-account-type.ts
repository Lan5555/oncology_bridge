import { type AccountType, getAccountInfo } from "./accounts";

export function canReclassifyUser(
  actorId: string,
  targetId: string,
  role: unknown,
) {
  if (!actorId || !targetId || actorId === targetId) return false;
  if (typeof role !== "string" || !role.trim()) return false;
  const normalized = role.toUpperCase().replace(/[^A-Z]/g, "");
  return ![
    "ADMIN",
    "SUPERADMIN",
    "FACILITYADMIN",
    "FACILITYADMINISTRATOR",
    "NETWORKADMIN",
    "NETWORKADMINISTRATOR",
    "SUPERADMINISTRATOR",
  ].includes(normalized);
}

export function accountTypeChangePayload(
  current: string | null,
  next: string,
  reason: string,
  authorized: boolean,
) {
  if (next === (current ?? "")) return {};
  if (!authorized)
    throw new Error("You do not have permission to change account types.");
  if (!getAccountInfo(next as AccountType))
    throw new Error("Select a valid account type.");
  const trimmedReason = reason.trim();
  if (!trimmedReason || trimmedReason.length > 1000)
    throw new Error("Provide a reason of up to 1,000 characters.");
  return {
    account_type: next,
    expected_account_type: current,
    account_type_change_reason: trimmedReason,
  };
}

export function accountTypeChangeConfirmed(data: unknown, expected: string) {
  return Boolean(
    data &&
      typeof data === "object" &&
      "account_type" in data &&
      data.account_type === expected,
  );
}
