import { Command, Frame, Map, PieChart } from 'lucide-react';
import * as React from 'react';
import { NavProjects } from 'src/components/nav-projects';
import { NavUser } from 'src/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from 'src/components/ui/sidebar';

const data = {
    projects: [
        {
            icon: Frame,
            name: 'Design Engineering',
            url: '#',
        },
        {
            icon: PieChart,
            name: 'Sales & Marketing',
            url: '#',
        },
        {
            icon: Map,
            name: 'Travel',
            url: '#',
        },
    ],
    user: {
        avatar: '/avatars/shadcn.jpg',
        email: 'm@example.com',
        name: 'shadcn',
    },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild size="lg">
                            <a href="#">
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        Acme Inc
                                    </span>
                                    <span className="truncate text-xs">
                                        Enterprise
                                    </span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavProjects projects={data.projects} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    );
}
