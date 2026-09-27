"use client";

import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { updateAvatarAction } from "@/actions/auth/account";
import { initials } from "@/lib/utils/initials";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { uploadImageFile } from "@/lib/utils/api-client";

export function AvatarUploader({ user }) {
  const [avatar, setAvatar] = useState(user.avatar);
  const [pending, setPending] = useState(false);
  const inputRef = useRef(null);
  const { notify } = useToast();
  const router = useRouter();

  async function save(url) {
    setPending(true);
    const result = await updateAvatarAction(url);
    setPending(false);
    notify(result.message, result.ok ? "success" : "error");
    if (result.ok) {
      setAvatar(url || null);
      router.refresh();
    }
  }

  async function upload(file) {
    if (!file) return;
    setPending(true);
    const result = await uploadImageFile(file, "avatars");
    setPending(false);
    if (!result.ok) return notify(result.message, "error");
    await save(result.url);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-brand-700 text-2xl font-semibold text-white">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element -- user-uploaded avatar from mixed hosts
          <img src={avatar} alt="Your profile photo" className="h-full w-full object-cover" />
        ) : (
          <span aria-hidden="true" className="flex h-full w-full items-center justify-center">
            {initials(user.fullName)}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" disabled={pending} onClick={() => inputRef.current?.click()}>
          <Camera aria-hidden="true" className="h-4 w-4" />
          {pending ? "Saving…" : avatar ? "Change photo" : "Add a photo"}
        </Button>
        {avatar ? (
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => save("")}>
            Remove
          </Button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          upload(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
