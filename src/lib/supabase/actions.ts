"use server";

import { createClient } from "./server";
import { revalidatePath } from "next/cache";

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}

