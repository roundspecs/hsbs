"use client";

import { Frame, Map, PieChart, Settings2 } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '../ui/sidebar';
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { WorkspaceSwitcher } from "./workspace-switcher";

const data = {
  navMain: [
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

type Workspace = { name: string, slug: string }

const AppSidebar = ({ workspaces, activeWorkspace }: { workspaces: Workspace[], activeWorkspace: Workspace }) => {
  return (
    <Sidebar collapsible="icon" >
      <SidebarHeader>
        <WorkspaceSwitcher workspaces={workspaces} activeWorkspace={activeWorkspace} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar