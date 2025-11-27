"use client";

import { useAuth } from "@/lib/useAuth";
import { createWorkspace } from "@/lib/workspaces";
import { createSystemRoles } from "@/lib/roles";
import { addWorkspaceMember } from "@/lib/members";
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
      await createWorkspace(name, slug, user.uid);

      // system roles
      await createSystemRoles(slug);

      // add creator as admin
      await addWorkspaceMember(slug, user.uid, ["admin"]);

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