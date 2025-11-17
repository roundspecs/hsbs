"use client";

import AppSidebar from '@/components/sidebar/app-sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/useAuth";
import { Separator } from "@radix-ui/react-separator";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from "react";
import WorkspaceLoading from "./workspace-loading";
import WorkspaceNoAccess from "./workspace-no-access";

type Workspace = { name: string; slug: string };

const WorkspaceClientLayout = ({ children, slug }: { children: React.ReactNode, slug: string }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const activeWorkspace: Workspace | undefined = workspaces.find(workspace => workspace.slug === slug);

  const pathname = usePathname();
  const segments = pathname?.split('/').filter(Boolean) ?? [];
  const slugIndex = segments.indexOf(slug);
  const pageSegment = slugIndex >= 0 ? segments[slugIndex + 1] : undefined;
  const humanize = (s: string) => s.replace(/-/g, ' ').replace(/(^|\s)\S/g, (t) => t.toUpperCase());
  const pageTitle = pageSegment ? humanize(pageSegment) : undefined;

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

  // Listen for rename events so we can update local workspace list (sidebar, breadcrumb)
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ slug: string; name: string }>;
      const { slug: renamedSlug, name } = ev.detail || {};
      if (!renamedSlug) return;
      setWorkspaces((prev) => prev.map((ws) => (ws.slug === renamedSlug ? { ...ws, name } : ws)));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('workspace:renamed', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('workspace:renamed', handler as EventListener);
      }
    };
  }, []);

  if (loading) {
    return <WorkspaceLoading />;
  } else if (!activeWorkspace) {
    return <WorkspaceNoAccess />;
  }


  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-background w-full">
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
                    <BreadcrumbLink href="/">Workspaces</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />

                  {activeWorkspace && (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink href={`/w/${activeWorkspace.slug}`}>{activeWorkspace.name}</BreadcrumbLink>
                      </BreadcrumbItem>
                      {pageTitle && (
                        <>
                          <BreadcrumbSeparator className="hidden md:block" />
                          <BreadcrumbItem>
                            <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                          </BreadcrumbItem>
                        </>
                      )}
                    </>
                  )}
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