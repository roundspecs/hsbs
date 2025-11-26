"use client";

import { ChevronRight, Settings, Settings2, UserLock, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarRail } from '../ui/sidebar';
import { NavUser } from "./nav-user";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import Link from 'next/link';


type Workspace = { name: string, slug: string }

const AppSidebar = ({ workspaces, activeWorkspace }: { workspaces: Workspace[], activeWorkspace: Workspace }) => {
  const router = useRouter();

  return (
    <Sidebar collapsible="icon" >
      <SidebarHeader>
        <WorkspaceSwitcher workspaces={workspaces} activeWorkspace={activeWorkspace} />
      </SidebarHeader>
      <SidebarContent>

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
                      <Link href={`/w/${activeWorkspace?.slug}/permissions-settings`}>
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