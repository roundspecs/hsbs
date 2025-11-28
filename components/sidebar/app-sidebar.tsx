"use client";

import { ChevronRight, Settings, Settings2, UserLock, Users, Package, Stethoscope, ArrowDownLeft, ArrowUpRight, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarRail, SidebarMenuBadge } from '../ui/sidebar';
import { NavUser } from "./nav-user";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { useEffect, useState } from 'react';
import { isWorkspaceAdmin } from '@/lib/members';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';


type Workspace = { name: string, slug: string }

const AppSidebar = ({ workspaces, activeWorkspace }: { workspaces: Workspace[], activeWorkspace: Workspace }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [joinRequestCount, setJoinRequestCount] = useState(0);

  useEffect(() => {
    if (!user || !activeWorkspace?.slug) {
      setIsAdmin(false);
      return;
    }

    const checkAdmin = async () => {
      try {
        const admin = await isWorkspaceAdmin(activeWorkspace.slug, user.uid);
        setIsAdmin(admin);
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user, activeWorkspace?.slug]);

  useEffect(() => {
    if (!isAdmin || !activeWorkspace?.slug) {
      setJoinRequestCount(0);
      return;
    }

    const requestsRef = collection(db, "workspaces", activeWorkspace.slug, "joinRequests");
    const unsubscribe = onSnapshot(requestsRef, (snapshot) => {
      setJoinRequestCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [isAdmin, activeWorkspace?.slug]);

  return (
    <Sidebar collapsible="icon" >
      <SidebarHeader>
        <WorkspaceSwitcher workspaces={workspaces} activeWorkspace={activeWorkspace} />
      </SidebarHeader>
      <SidebarContent>

        <SidebarGroup>
          <SidebarGroupLabel>HOME</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard">
                <Link href={`/w/${activeWorkspace?.slug}`}>
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>INVENTORY</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Products">
                <Link href={`/w/${activeWorkspace?.slug}/products`}>
                  <Package />
                  <span>Products</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Surgeons">
                <Link href={`/w/${activeWorkspace?.slug}/surgeons`}>
                  <Stethoscope />
                  <span>Surgeons</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Stock In (LC)">
                <Link href={`/w/${activeWorkspace?.slug}/inventory/lc-history`}>
                  <ArrowDownLeft />
                  <span>Stock In (LC)</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Stock Out (OT)">
                <Link href={`/w/${activeWorkspace?.slug}/inventory/ot-history`}>
                  <ArrowUpRight />
                  <span>Stock Out (OT)</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>ADMIN</SidebarGroupLabel>
            <Collapsible
              key="Settings"
              asChild
              defaultOpen={false}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Settings">
                    <Settings />
                    <span>Settings</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem key="General">
                      <SidebarMenuSubButton asChild>
                        <Link href={`/w/${activeWorkspace?.slug}/general-settings`}>
                          <Settings2 />
                          <span>General</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem key="Permissions">
                      <SidebarMenuSubButton asChild>
                        <Link href={`/w/${activeWorkspace?.slug}/permissions`}>
                          <UserLock />
                          <span>Permissions</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem key="Members">
                      <SidebarMenuSubButton asChild>
                        <Link href={`/w/${activeWorkspace?.slug}/members`}>
                          <Users />
                          <span>Members</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            <SidebarMenu key="Join Requests">
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Join Requests">
                  <Link href={`/w/${activeWorkspace?.slug}/join-requests`}>
                    <Users />
                    <span>Join Requests</span>
                  </Link>
                </SidebarMenuButton>
                {joinRequestCount > 0 && (
                  <SidebarMenuBadge className="bg-destructive text-white">
                    {joinRequestCount}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />

      {/* settings page available at /w/{slug}/settings */}
    </Sidebar>
  )
}

export default AppSidebar