import "server-only";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");
  return { supabase, user };
}
