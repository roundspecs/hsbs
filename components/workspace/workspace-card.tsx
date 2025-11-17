"use client";

import { db } from "@/lib/firebaseConfig";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type Props = {
  name: string;
  slug: string;
  onDeleted?: (slug: string) => void;
};

export default function WorkspaceCard({ name, slug, onDeleted }: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirmOpen) return;
    setDeleting(true);

    try {
      // delete roles subcollection
      const rolesSnap = await getDocs(collection(db, `workspaces/${slug}/roles`));
      for (const r of rolesSnap.docs) {
        await deleteDoc(doc(db, `workspaces/${slug}/roles/${r.id}`));
      }

      // delete members subcollection
      const membersSnap = await getDocs(collection(db, `workspaces/${slug}/members`));
      for (const m of membersSnap.docs) {
        await deleteDoc(doc(db, `workspaces/${slug}/members/${m.id}`));
      }

      // finally delete workspace doc
      await deleteDoc(doc(db, `workspaces`, slug));

      setConfirmOpen(false);

      if (onDeleted) {
        onDeleted(slug);
      } else {
        router.push(`/`);
      }
    } catch (err) {
      console.error("Error deleting workspace:", err);
      alert("Failed to delete workspace. Check console for details.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="block">
      <Card className="cursor-pointer hover:shadow-md transition">
        <CardContent className="flex items-center justify-between gap-4">
          <Link href={`/w/${slug}`} className="flex items-center gap-4 flex-1">
            <Avatar>
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{name}</CardTitle>
              <CardDescription>Slug: {slug}</CardDescription>
            </div>
          </Link>

          <div className="shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-md hover:bg-muted focus:outline-none" aria-label="Workspace actions">
                  <MoreHorizontal />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 rounded-lg">
                <DropdownMenuItem onClick={() => setConfirmOpen(true)}>
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete workspace</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete workspace</DialogTitle>
                  <DialogDescription>
                    This will permanently delete the workspace and its data. This cannot be undone.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-2 py-2">
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={deleting}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                      {deleting ? "Deleting…" : "Delete"}
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
