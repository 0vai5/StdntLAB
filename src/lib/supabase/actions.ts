"use server";

import { createClient } from "./server";
import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}

/**
 * Create admin client for operations requiring service role
 * This is used for deleting auth users when rollback is needed
 */
function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Delete an auth user by ID
 * Requires SUPABASE_SERVICE_ROLE_KEY environment variable
 */
async function deleteAuthUser(userId: string): Promise<boolean> {
  const adminClient = createAdminSupabaseClient();
  if (!adminClient) {
    console.error(
      "SUPABASE_SERVICE_ROLE_KEY not configured. Cannot delete auth user."
    );
    return false;
  }

  try {
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) {
      console.error("Error deleting auth user:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Exception deleting auth user:", error);
    return false;
  }
}

/**
 * Delete an auth user by ID (for rollback purposes)
 * Requires SUPABASE_SERVICE_ROLE_KEY environment variable
 * This is called when Users table insert fails after auth user creation
 */
export async function rollbackAuthUser(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const deleted = await deleteAuthUser(userId);

  if (!deleted) {
    return {
      success: false,
      error:
        "Failed to rollback auth user. SUPABASE_SERVICE_ROLE_KEY may not be configured.",
    };
  }

  return {
    success: true,
  };
}
