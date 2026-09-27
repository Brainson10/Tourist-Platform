"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/utils/api-client";

const ROLES = [
  { value: "TOURIST", label: "Tourist" },
  { value: "GUIDE", label: "Guide" },
  { value: "ADMIN", label: "Admin" },
];

export function UserAccessControls({ user, isSelf }) {
  const [pending, setPending] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const { notify } = useToast();
  const router = useRouter();

  async function update(body, message) {
    setPending(true);
    const result = await apiRequest(`/api/admin/users/${user.id}`, { method: "PATCH", body });
    setPending(false);
    setConfirm(null);
    notify(result.ok ? message : result.message, result.ok ? "success" : "error");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <label htmlFor={`role-${user.id}`} className="sr-only">
        Role for {user.fullName}
      </label>
      <Select
        id={`role-${user.id}`}
        value={user.role}
        disabled={pending || isSelf}
        className="w-28 py-1.5"
        onChange={(event) => {
          const role = event.target.value;
          if (role === "ADMIN") setConfirm({ kind: "promote", role });
          else update({ role }, `${user.fullName} is now a ${role.toLowerCase()}`);
        }}
      >
        {ROLES.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </Select>
      <Button
        size="sm"
        variant={user.isBlocked ? "secondary" : "danger-ghost"}
        disabled={pending || isSelf}
        onClick={() => (user.isBlocked ? update({ isBlocked: false }, `${user.fullName} can sign in again`) : setConfirm({ kind: "block" }))}
      >
        {user.isBlocked ? "Unblock" : "Block"}
        <span className="sr-only"> {user.fullName}</span>
      </Button>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        pending={pending}
        onConfirm={() =>
          confirm?.kind === "block" ? update({ isBlocked: true }, `${user.fullName} has been blocked and signed out`) : update({ role: "ADMIN" }, `${user.fullName} is now an admin`)
        }
        title={confirm?.kind === "block" ? `Block ${user.fullName}?` : `Make ${user.fullName} an admin?`}
        description={
          confirm?.kind === "block"
            ? "They'll be signed out everywhere and won't be able to sign in until unblocked."
            : "Admins can edit all content, moderate reviews and manage every account."
        }
        confirmLabel={confirm?.kind === "block" ? "Block user" : "Make admin"}
      />
    </div>
  );
}
