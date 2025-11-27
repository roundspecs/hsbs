"use client";

import { ChevronRight, Settings, Settings2, UserLock, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarRail } from '../ui/sidebar';
import { NavUser } from "./nav-user";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';


type Workspace = { name: string, slug: string }

const AppSidebar = ({ workspaces, activeWorkspace }: { workspaces: Workspace[], activeWorkspace: Workspace }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user || !activeWorkspace?.slug) {
      setIsAdmin(false);
      return;
    }

    const checkAdmin = async () => {
      try {
        const wsSnap = await getDoc(doc(db, 'workspaces', activeWorkspace.slug));
        if (!wsSnap.exists()) return;

        const memberRef = doc(db, `workspaces/${activeWorkspace.slug}/members/${user.uid}`);
        const memberSnap = await getDoc(memberRef);
        const roles = memberSnap.exists() ? (memberSnap.data() as any)?.roles : [];
        setIsAdmin(Array.isArray(roles) && roles.includes('admin'));
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user, activeWorkspace?.slug]);

  return (
    <Sidebar collapsible="icon" >
      <SidebarHeader>
        <WorkspaceSwitcher workspaces={workspaces} activeWorkspace={activeWorkspace} />
      </SidebarHeader>
      <SidebarContent>

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