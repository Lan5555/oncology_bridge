"use client";

import { useEffect, useState } from "react";
import { UsersRound } from "lucide-react";
import EmptyState from "@/app/components/EmptyState";
import type { ModalId, PageId } from "@/app/lib/types";
import { USER_SERVICE } from "@/app/services/user-service/user-service";
import { unwrapArray } from "@/app/services/response-utils";

interface Props {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
  adminMode?: boolean;
}
export default function UsersPage({ onOpenModal, adminMode = false }: Props) {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [notice, setNotice] = useState("");
  const load = async () => {
    const [userResponse, roleResponse] = await Promise.all([
      USER_SERVICE.list("take=50&skip=0", adminMode),
      USER_SERVICE.roles(adminMode),
    ]);
    if (userResponse.success) setUsers(unwrapArray(userResponse.data));
    else setNotice(userResponse.message || "Users could not be loaded.");
    if (roleResponse.success) setRoles(unwrapArray(roleResponse.data));
  };
  useEffect(() => {
    void load();
  }, [adminMode]);
  const deactivate = async (id: string) => {
    const response = await USER_SERVICE.deactivate(id, adminMode);
    setNotice(
      response.message ||
        (response.success
          ? "User deactivated."
          : "User could not be deactivated."),
    );
    if (response.success) await load();
  };
  const visibleUsers = users.filter(
    (user) =>
      !filter ||
      String(user.role?.id ?? user.roleId ?? user.role_id ?? user.role) ===
        filter,
  );
  return (
    <div className="block animate-fade-up">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-g200 bg-linear-to-br from-w via-w to-pll p-5 shadow-sm">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-g900">
            <UsersRound className="size-5 text-p" aria-hidden="true" />
            Users & Roles
          </h1>
          <p className="mt-1 text-[12.5px] text-g500">
            Manage access for network members
          </p>
        </div>
        <button
          className="rounded-lg bg-p px-4 py-2 text-sm font-semibold text-white"
          onClick={() => onOpenModal("modal-user")}
        >
          Invite user
        </button>
      </header>
      {notice ? (
        <p role="status" className="mb-4 text-sm text-g600">
          {notice}
        </p>
      ) : null}
      <section className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
        {roles.map((role) => (
          <article
            className="rounded-xl border border-g200 bg-w p-4"
            key={role.id}
          >
            <h2 className="text-sm font-semibold text-g800">{role.name}</h2>
            <p className="mt-1 text-xs text-g500">{role.description ?? ""}</p>
            <p className="mt-3 text-lg font-bold text-g900">
              {role.userCount ?? role.user_count ?? 0}
            </p>
          </article>
        ))}
      </section>
      <section className="rounded-xl border border-g200 bg-w p-5">
        <div className="mb-4 flex flex-wrap justify-between gap-3">
          <h2 className="text-[15px] font-bold text-g900">Network users</h2>
          <select
            aria-label="Filter users by role"
            className="rounded-lg border border-g200 px-3 py-2 text-xs"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="">All roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        {visibleUsers.map((user) => (
          <article
            className="flex flex-wrap items-center justify-between gap-3 border-t border-g100 py-3"
            key={user.id}
          >
            <div>
              <h3 className="text-sm font-semibold text-g800">
                {user.name ??
                  `${user.first_name ?? ""} ${user.last_name ?? ""}`}
              </h3>
              <p className="text-xs text-g500">
                {user.email} · {user.role?.name ?? user.role ?? "Member"} ·{" "}
                {user.facility?.name ?? user.hospital?.name ?? "—"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-g500">
                {user.active === false ? "Inactive" : "Active"}
              </span>
              {user.active !== false ? (
                <button
                  className="rounded-md border border-g200 px-3 py-1.5 text-xs text-g700"
                  onClick={() => void deactivate(user.id)}
                >
                  Deactivate
                </button>
              ) : null}
            </div>
          </article>
        ))}
        {!visibleUsers.length ? (
          <EmptyState
            icon={UsersRound}
            title="No users found"
            description="Try a different search, or add a user to get started."
          />
        ) : null}
      </section>
    </div>
  );
}
