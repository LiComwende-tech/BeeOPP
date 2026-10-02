"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOpportunityBySlug } from "@/lib/opportunities";

export type LoginState = { error: string } | null;

export async function signIn(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const requestedDestination = String(formData.get("next") ?? "");
  const opportunityPrefix = "/opportunities/";
  const requestedSlug = requestedDestination.startsWith(opportunityPrefix)
    ? requestedDestination.slice(opportunityPrefix.length)
    : "";
  const destination = getOpportunityBySlug(requestedSlug) ? requestedDestination : "/dashboard";
  if (!email || !password) return { error: "Enter your email address and password." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const details = error as { code?: string; status?: number };
      if (details.code === "email_not_confirmed") {
        return { error: "Confirm your email using the link Supabase sent you, then try logging in again. Check your spam folder too." };
      }
      if (details.status === 429) return { error: "There have been too many attempts. Wait a little while, then try again." };
      if (details.status !== undefined && details.status >= 500) {
        return { error: "The account service is temporarily unavailable. Please try again later." };
      }
      if (details.code === "invalid_credentials" || details.code === "user_not_found") {
        return { error: "Email or password is incorrect. Check both, or use “Forgot your password?” to reset it." };
      }
      return { error: "We couldn’t complete that login. Please try again." };
    }
  } catch {
    return { error: "BeeOPP couldn’t reach the account service. Check your connection and try again." };
  }

  revalidatePath("/", "layout");
  redirect(destination);
}

export type SavedOpportunityState = { saved: boolean; message: string; error?: boolean } | null;

export async function setOpportunitySaved(
  _previousState: SavedOpportunityState,
  formData: FormData,
): Promise<SavedOpportunityState> {
  const slug = String(formData.get("slug") ?? "");
  const shouldSave = formData.get("save") === "true";
  const currentlySaved = !shouldSave;
  const opportunity = getOpportunityBySlug(slug);

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || (shouldSave && !opportunity)) {
    return { saved: currentlySaved, error: true, message: "This advert is no longer available to save." };
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { saved: currentlySaved, error: true, message: "Log in again to manage your saved opportunities." };
    }

    const result = shouldSave
      ? await supabase.from("saved_opportunities").upsert(
        { user_id: user.id, opportunity_slug: slug },
        { onConflict: "user_id,opportunity_slug", ignoreDuplicates: true },
      )
      : await supabase.from("saved_opportunities").delete()
        .eq("user_id", user.id)
        .eq("opportunity_slug", slug);

    if (result.error) {
      return { saved: currentlySaved, error: true, message: "We couldn’t update your saved list. Please try again." };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/opportunities/${slug}`);
    return {
      saved: shouldSave,
      message: shouldSave ? "Saved to your list." : "Removed from your list.",
    };
  } catch {
    return { saved: currentlySaved, error: true, message: "We couldn’t update your saved list. Please try again." };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
