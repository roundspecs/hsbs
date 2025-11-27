"use client";

import AppSidebar from '@/components/sidebar/app-sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from "@/lib/useAuth";
import { getUserWorkspaces, getWorkspace } from "@/lib/workspaces";
import { Separator } from "@radix-ui/react-separator";
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from "react";
import WorkspaceLoading from "./workspace-loading";
import WorkspaceNoAccess from "./workspace-no-access";

type Workspace = { name: string; slug: string };

const WorkspaceClientLayout = ({ children, slug }: { children: React.ReactNode, slug: string }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedWorkspace, setRequestedWorkspace] = useState<{ id: string; name: string } | null>(null);
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
        const result = await getUserWorkspaces(user.uid);
        let foundRequestedWorkspace: { id: string; name: string } | null = null;

        // Check if the requested workspace is in the user's list
        // Note: getUserWorkspaces returns { name, slug }, but we need ID for WorkspaceNoAccess if not found?
        // Actually WorkspaceNoAccess takes workspaceId, but getUserWorkspaces returns slug.
        // The original code used wsDoc.id which is the slug.
        // So we can just check if slug is in the result.

        // Wait, the original code set foundRequestedWorkspace even if the user wasn't a member?
        // "Check if this is the workspace being requested... if (wsData.slug === slug) foundRequestedWorkspace..."
        // Yes, it scans ALL workspaces to find the name of the requested one even if access is denied.
        // getUserWorkspaces ONLY returns workspaces the user is a member of.
        // So we need a separate call to get the workspace details if it's not in the list.

        const active = result.find(w => w.slug === slug);
        if (active) {
          foundRequestedWorkspace = { id: active.slug, name: active.name };
        } else {
          // If not in user's list, try to fetch it directly to get the name for the "No Access" screen
          // We need a helper for this: getWorkspace(slug)
          const ws = await getWorkspace(slug);
          if (ws) {
            foundRequestedWorkspace = { id: ws.slug, name: ws.name };
          }
        }

        setWorkspaces(result);
        setRequestedWorkspace(foundRequestedWorkspace);
      } catch (err) {
        console.error('Error loading workspaces:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [user, slug]);

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
    return <WorkspaceNoAccess workspaceId={requestedWorkspace?.id || ''} workspaceName={requestedWorkspace?.name} />;
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
