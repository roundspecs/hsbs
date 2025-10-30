"use client";

import { Separator } from "@radix-ui/react-separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/sidebar/app-sidebar';
import { useAuth } from "@/lib/useAuth";
import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { getDocs, collection, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { assert } from "console";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

type Workspace = { name: string; slug: string };

const WorkspaceClientLayout = ({ children, slug }: { children: React.ReactNode, slug: string }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const activeWorkspace: Workspace | undefined = workspaces.find(workspace => workspace.slug === slug);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchWorkspaces = async () => {
      setLoading(true);
      try {
        const wsSnap = await getDocs(collection(db, 'workspaces'));
        const result: { name: string; slug: string }[] = [];

        // check each workspace’s members subcollection for current user
        for (const wsDoc of wsSnap.docs) {
          const memberRef = doc(db, `workspaces/${wsDoc.id}/members/${user.uid}`);
          const memberSnap = await getDoc(memberRef);
          if (memberSnap.exists()) {
            const { name, slug } = wsDoc.data() as any;
            result.push({ name, slug });
          }
        }

        setWorkspaces(result);
      } catch (err) {
        console.error('Error loading workspaces:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center text-muted-foreground">
        <Spinner />
        <p className="text-xl">Loading workspace...</p>
      </div>
    );
  } else if (!activeWorkspace) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center text-muted-foreground">
        <p>You don’t have access to this workspace.</p>
        <Button
          onClick={() => router.push("/")}
        >
          Go back home
        </Button>
      </div>
    );
  }


  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-background">
        <AppSidebar workspaces={workspaces} activeWorkspace={activeWorkspace!} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      Building Your Application
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default WorkspaceClientLayout