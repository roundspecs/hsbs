"use client";

import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getWorkspace, updateWorkspaceName, updateWorkspaceSettings } from "@/lib/workspaces";
import { isWorkspaceAdmin } from "@/lib/members";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { Spinner } from "../ui/spinner";
import { deleteWorkspace } from "@/lib/workspaces";

interface Workspace {
  name: string;
  lowStockThreshold?: number;
  [key: string]: any;
}

export default function GeneralSettings({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState(3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const ws = await getWorkspace(slug);
        if (ws) {
          setName(ws.name ?? "");
          setLowStockThreshold(ws.lowStockThreshold ?? 3);
        } else {
          setName("");
        }

        // check if user is admin
        if (user) {
          const admin = await isWorkspaceAdmin(slug, user.uid);
          setIsAdmin(admin);
        }
      } catch (err) {
        console.error("Failed to load workspace:", err);
        setError("Failed to load workspace details.");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [slug, user]);

  const handleSave = async () => {
    if (!slug) return;
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      await updateWorkspaceName(slug, name);
      await updateWorkspaceSettings(slug, { lowStockThreshold });

      // dispatch event to update other parts of the app
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("workspace:renamed", {
            detail: { slug, name: name.trim() },
          })
        );
      }

      setSuccess("Successfully updated settings");
      router.refresh();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!slug || !isAdmin) return;

    const confirmed = confirm(
      `Are you sure you want to delete the workspace "${name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      await deleteWorkspace(slug);

      router.push("/");
    } catch (err) {
      console.error("Failed to delete workspace:", err);
      setError("Failed to delete workspace. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl w-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">General Settings</h2>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="workspace-name"
              className="block text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Workspace Name
            </label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workspace name"
              className="max-w-md"
            />
            <p className="text-[0.8rem] text-muted-foreground">
              This is the display name shown across the app.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="low-stock-threshold"
              className="block text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Low Stock Threshold
            </label>
            <Input
              id="low-stock-threshold"
              type="number"
              min="0"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(Number(e.target.value))}
              placeholder="Enter threshold (e.g., 3)"
              className="max-w-md"
            />
            <p className="text-[0.8rem] text-muted-foreground">
              Products with stock at or below this number will be highlighted as "Low Stock".
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={handleSave} disabled={saving || !name.trim() || lowStockThreshold < 0}>
              {saving && <Spinner className="mr-2 h-4 w-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            {success && <span className="text-sm text-green-600">{success}</span>}
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>

          {isAdmin && (
            <div className="mt-12 pt-8 border-t border-destructive/20">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Irreversible actions that will permanently affect this workspace.
                  </p>
                </div>
                <div className="flex items-start gap-4 p-4 border border-destructive/20 rounded-md">
                  <div className="flex-1">
                    <h3 className="font-medium">Delete Workspace</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Once deleted, this workspace and all its data will be permanently removed. This action cannot be undone.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting && <Spinner className="mr-2 h-4 w-4" />}
                    {deleting ? "Deleting..." : "Delete Workspace"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
