"use client";

import Link from "next/link";
import { useActionState } from "react";
import { setOpportunitySaved, type SavedOpportunityState } from "@/app/actions";

export function SaveOpportunityButton({
  slug,
  initialSaved,
  signedIn,
}: {
  slug: string;
  initialSaved: boolean;
  signedIn: boolean;
}) {
  const [state, action, pending] = useActionState<SavedOpportunityState, FormData>(setOpportunitySaved, null);
  const isSaved = state?.saved ?? initialSaved;

  if (!signedIn) {
    return (
      <div className="save-opportunity-prompt">
        <p>Keep this advert handy by saving it to your list.</p>
        <Link className="button button-outline" href={{ pathname: "/login", query: { next: `/opportunities/${slug}` } }}>
          Log in to save
        </Link>
      </div>
    );
  }

  return (
    <div className="save-opportunity-control">
      <form action={action}>
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="save" value={String(!isSaved)} />
        <button className="button button-outline" type="submit" disabled={pending}>
          {pending ? "Updating…" : isSaved ? "Remove from saved" : "Save this opportunity"}
        </button>
      </form>
      {state && <p className={state.error ? "save-feedback error-feedback" : "save-feedback"} role={state.error ? "alert" : "status"}>{state.message}</p>}
    </div>
  );
}
