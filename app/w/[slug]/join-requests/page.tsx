"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/useAuth";
import { isWorkspaceAdmin } from "@/lib/members";
import { getJoinRequests, approveJoinRequest, rejectJoinRequest } from "@/lib/join-requests";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type JoinRequest = {
  id: string;
  uid?: string;
  name?: string;
  email?: string;
  message?: string;
  createdAt?: any;
};

export default function JoinRequestsPage() {
  const { user } = useAuth();
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) ?? [];
  // Path looks like: /w/[slug]/join-requests — find slug after 'w'
  const wIndex = segments.indexOf("w");
  const slug = wIndex >= 0 ? segments[wIndex + 1] : segments[0];

  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const findWorkspace = async () => {
      setLoading(true);
      try {
        const wsSnap = await getDocs(collection(db, "workspaces"));
        let foundId: string | null = null;
        for (const wsDoc of wsSnap.docs) {
          const data = wsDoc.data() as any;
          if (data?.slug === slug) {
            foundId = wsDoc.id;
            break;
          }
        }
        setWorkspaceId(foundId);
      } catch (err) {
        console.error("Error finding workspace:", err);
      } finally {
        setLoading(false);
      }
    };

    findWorkspace();
  }, [slug]);

  useEffect(() => {
    if (!workspaceId) return;

    const load = async () => {
      setLoading(true);
      try {
        // check if current user is admin/owner
        if (user) {
          const admin = await isWorkspaceAdmin(workspaceId, user.uid);
          setIsAdmin(admin);
        }

        const list = await getJoinRequests(workspaceId);
        setRequests(list);
      } catch (err) {
        console.error("Error loading join requests:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [workspaceId, user]);

  const approve = async (r: JoinRequest) => {
    if (!workspaceId || !r.uid) return;
    try {
      await approveJoinRequest(workspaceId, { id: r.id, uid: r.uid });
      setRequests((prev) => prev.filter((x) => x.id !== r.id));
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const reject = async (r: JoinRequest) => {
    if (!workspaceId) return;
    try {
      await rejectJoinRequest(workspaceId, r.id);
      setRequests((prev) => prev.filter((x) => x.id !== r.id));
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl w-full">
      <h2 className="text-lg font-semibold mb-4">Join Requests</h2>

      {!isAdmin && (
        <div className="mb-4 text-sm text-muted-foreground">You must be a workspace admin to approve requests.</div>
      )}

      {requests.length === 0 ? (
        <div className="rounded-md border p-4">No pending requests.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.name || "—"}</TableCell>
                <TableCell>{r.email || "—"}</TableCell>
                <TableCell className="max-w-sm truncate">{r.message || "—"}</TableCell>
                <TableCell>{r.createdAt ? new Date(r.createdAt.seconds * 1000).toLocaleString() : "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" onClick={() => approve(r)} disabled={!isAdmin}>
                      Approve
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => reject(r)} disabled={!isAdmin}>
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
