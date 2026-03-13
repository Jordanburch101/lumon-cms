"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useEditModeRequired } from "./use-edit-mode";

export function SaveControls() {
  const router = useRouter();
  const { state, actions } = useEditModeRequired();
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);

  const handleSave = useCallback(
    async (status: "draft" | "published") => {
      if (!state.pageId) {
        return;
      }

      setSaving(status === "draft" ? "draft" : "publish");
      actions.setSaving(true);

      try {
        const res = await fetch(`/api/pages/${state.pageId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            layout: state.blocks,
            _status: status,
          }),
        });

        if (!res.ok) {
          if (res.status === 401) {
            toast.error("Session expired. Please log in again.");
            return;
          }
          const data = await res.json().catch(() => null);
          toast.error(data?.errors?.[0]?.message || "Save failed");
          return;
        }

        if (status === "published") {
          toast.success("Published successfully");
          actions.exit();
          router.refresh();
        } else {
          toast.success("Draft saved");
          // Re-fetch to get server-normalized data
          const freshRes = await fetch(
            `/api/pages/${state.pageId}?draft=true&depth=2`,
            { credentials: "include" }
          );
          if (freshRes.ok) {
            const freshData = await freshRes.json();
            actions.resetDirty(freshData.layout ?? []);
          }
        }
      } catch {
        toast.error("Network error — changes preserved locally");
      } finally {
        setSaving(null);
        actions.setSaving(false);
      }
    },
    [state.pageId, state.blocks, actions, router]
  );

  const handleDiscard = useCallback(() => {
    if (state.dirtyCount > 0) {
      return; // AlertDialog handles confirmation
    }
    actions.exit();
  }, [state.dirtyCount, actions]);

  return (
    <div className="flex items-center gap-1">
      {state.dirtyCount > 0 ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="h-7 px-2.5 text-[11px]"
              disabled={!!saving}
              variant="ghost"
            >
              Discard
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard changes?</AlertDialogTitle>
              <AlertDialogDescription>
                You have {state.dirtyCount} unsaved{" "}
                {state.dirtyCount === 1 ? "change" : "changes"}. This cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep editing</AlertDialogCancel>
              <AlertDialogAction onClick={() => window.location.reload()}>
                Discard
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button
          className="h-7 px-2.5 text-[11px]"
          onClick={handleDiscard}
          variant="ghost"
        >
          Discard
        </Button>
      )}
      <Button
        className="h-7 px-2.5 text-[11px]"
        disabled={!!saving}
        onClick={() => handleSave("draft")}
        variant="outline"
      >
        {saving === "draft" ? <Spinner className="mr-1" /> : null}
        Save Draft
      </Button>
      <Button
        className="h-7 bg-green-600 px-2.5 text-[11px] text-white hover:bg-green-700"
        disabled={!!saving}
        onClick={() => handleSave("published")}
      >
        {saving === "publish" ? <Spinner className="mr-1" /> : null}
        Publish
      </Button>
    </div>
  );
}
