import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import * as s from "./layout.css";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: ghostUser } = await supabase
    .from("ghostdev_users")
    .select("github_login, avatar_url")
    .eq("id", user!.id)
    .single();

  return (
    <div className={s.wrapper}>
      <TopNav
        userLogin={ghostUser?.github_login}
        userAvatar={ghostUser?.avatar_url ?? undefined}
      />
      <main className={s.main}>{children}</main>
    </div>
  );
}
