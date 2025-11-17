"use client";

import { db } from "@/lib/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function WorkspaceSettings({ slug }: { slug: string }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const wsRef = doc(db, "workspaces", slug);
        const snap = await getDoc(wsRef);
        if (snap.exists()) {
          const data = snap.data() as any;
          setName(data.name ?? "");
        } else {
          setName("");
        }
      } catch (err) {
        console.error("Failed to load workspace:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [slug]);

  const handleSave = async () => {
    if (!slug) return;
    setSaving(true);
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

      setSuccess("Workspace name updated");
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      console.error("Failed to save workspace name:", err);
      alert("Failed to save. See console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="w-full p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Workspace settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage workspace details and configuration.</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-6 w-full">
          <div className="w-full max-w-full">
            <label className="block text-sm font-medium mb-1">Workspace name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="w-full" />
            <p className="text-xs text-muted-foreground mt-1">This is the display name shown across the app.</p>
          </div>

          {success && <div className="text-sm text-green-600">{success}</div>}

          <div className="flex justify-start gap-2">
            <Button onClick={handleSave} disabled={saving || !name.trim()}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </div>
      )}
    </main>
  );
}
