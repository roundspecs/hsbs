"use client";

import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/useAuth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";

export default function NewWorkspaceDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // 🧠 convert workspace name → slug (URL‑friendly)
  const slug = useMemo(() => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }, [name]);

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user || !name) return;
    setLoading(true);

    try {
      // create workspace doc
      const wsRef = doc(db, "workspaces", slug);

      // 🚦 1️⃣ Check if this slug already exists
      const existing = await getDoc(wsRef);
      if (existing.exists()) {
        alert("That workspace slug already exists. Please choose another name.");
        setLoading(false);
        return; // stop creation
      }

      await setDoc(wsRef, {
        name,
        slug,
        ownerUid: user.uid,
        createdAt: serverTimestamp(),
      });

      // system roles
      await setDoc(doc(db, `workspaces/${slug}/roles/default`), {
        name: "default",
        isSystemRole: true,
        permissions: ["viewProducts", "viewReports"],
      });
      await setDoc(doc(db, `workspaces/${slug}/roles/admin`), {
        name: "admin",
        isSystemRole: true,
        permissions: ["*"],
      });

      // add creator as admin
      await setDoc(doc(db, `workspaces/${slug}/members/${user.uid}`), {
        userUid: user.uid,
        roles: ["admin"],
        joinedAt: serverTimestamp(),
      });

      setOpen(false);
      setName("");
      router.push(`/w/${slug}`);
    } catch (err) {
      console.error("Error creating workspace:", err);
      alert("Something went wrong while creating workspace.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Create</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new workspace</DialogTitle>
          <DialogDescription>
            Enter a friendly name. A slug will be generated automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="grid gap-3 py-2">
          <div className="space-y-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Zimmer Biomet"
              disabled={loading}
            />

            {/* 👇 Live preview of slug */}
            {name && (
              <p className="text-sm text-muted-foreground">
                Workspace slug:&nbsp;
                <span className="font-mono text-primary">
                  {slug || "…"}
                </span>
              </p>
            )}
          </div>

          <DialogFooter className="mt-2">
            <Button type="submit" disabled={!name || loading}>
              {loading ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}