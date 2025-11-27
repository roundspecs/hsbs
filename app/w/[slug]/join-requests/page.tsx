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
import RequirePermission from "@/components/auth/RequirePermission";

import { JoinRequest as LibJoinRequest } from "@/lib/join-requests";

type JoinRequestWithProfile = LibJoinRequest & {
  id: string;
  photoUrl?: string | null;
};

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUsers, UserProfile } from "@/lib/users";
import { Check, X } from "lucide-react";



function JoinRequestsContent({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [requests, setRequests] = useState<JoinRequestWithProfile[]>([]);
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

        const list = await getJoinRequests(workspaceId) as (LibJoinRequest & { id: string })[];

        // Fetch profiles
        const uids = list.map(r => r.uid).filter(Boolean) as string[];
        const profiles = await getUsers(uids);

        const listWithProfiles: JoinRequestWithProfile[] = list.map(r => {
          const profile = profiles.find(p => p.uid === r.uid);
          return {
            ...r,
            id: r.id,
            photoUrl: profile?.photoUrl || null,
            // If the request doesn't have name/email (legacy?), fallback to profile
            name: r.name || profile?.name || "Unknown",
            email: r.email || profile?.email || "No email"
          };
        });

        setRequests(listWithProfiles);
      } catch (err) {
        console.error("Error loading join requests:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [workspaceId, user]);

  const approve = async (r: JoinRequestWithProfile) => {
    if (!workspaceId || !r.uid) return;
    try {
      await approveJoinRequest(workspaceId, { id: r.id, uid: r.uid });
      setRequests((prev) => prev.filter((x) => x.id !== r.id));
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const reject = async (r: JoinRequestWithProfile) => {
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
    <div className="max-w-6xl w-full">
      <h2 className="text-lg font-semibold mb-4">Join Requests</h2>

      {!isAdmin && (
        <div className="mb-4 text-sm text-muted-foreground">You must be a workspace admin to approve requests.</div>
      )}

      {requests.length === 0 ? (
        <div className="rounded-md border p-4">No pending requests.</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={r.photoUrl || ""} />
                        <AvatarFallback>{r.name?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{r.name}</span>
                        <span className="text-sm text-muted-foreground">{r.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-sm truncate">{r.message || "—"}</TableCell>
                  <TableCell>{r.createdAt ? new Date(r.createdAt.seconds * 1000).toLocaleString() : "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => approve(r)} disabled={!isAdmin} title="Approve">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => reject(r)} disabled={!isAdmin} title="Reject">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default function JoinRequestsPage() {
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) ?? [];
  const wIndex = segments.indexOf("w");
  const slug = wIndex >= 0 ? segments[wIndex + 1] : segments[0];

  if (!slug) return null;

  return (
    <RequirePermission workspaceSlug={slug} permission="manageInvites">
      <JoinRequestsContent slug={slug} />
    </RequirePermission>
  );
}
