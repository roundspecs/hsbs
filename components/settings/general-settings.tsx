"use client";

import { db } from "@/lib/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { Spinner } from "../ui/spinner";

interface Workspace {
  name: string;
  [key: string]: any;
}

export default function GeneralSettings({ slug }: { slug: string }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const wsRef = doc(db, "workspaces", slug);
        const snap = await getDoc(wsRef);
        if (snap.exists()) {
          const data = snap.data() as Workspace;
          setName(data.name ?? "");
        } else {
          setName("");
        }
      } catch (err) {
        console.error("Failed to load workspace:", err);
        setError("Failed to load workspace details.");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [slug]);

  const handleSave = async () => {
    if (!slug) return;
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const wsRef = doc(db, "workspaces", slug);
      await updateDoc(wsRef, { name: name.trim() });

      // dispatch event to update other parts of the app
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("workspace:renamed", {
            detail: { slug, name: name.trim() },
          })
        );
      }

      setSuccess("Successfully updated workspace name");
      router.refresh();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to save workspace name:", err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="w-full p-4 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">General Settings</h1>
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
          <div className="space-y-2">
            <label
              htmlFor="workspace-name"
              className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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

          <div className="flex items-center gap-4">
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving && <Spinner className="mr-2 h-4 w-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            {success && <span className="text-sm text-green-600">{success}</span>}
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
        </div>
      )}
    </main>
  );
}
