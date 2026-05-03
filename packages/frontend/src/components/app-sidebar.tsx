import { Link, useMatchRoute } from '@tanstack/react-router';
import {
    ChevronsUpDown,
    LayoutDashboard,
    LogOut,
    Receipt,
    ShieldCheck,
    Tags,
    Users,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar.tsx';
import { useAuth } from '@/contexts/auth.context.tsx';

import type { Role } from '@/types/index.ts';

const NAV_ITEMS: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    path: string;
    roles: Role[];
}[] = [
    {
        icon: LayoutDashboard,
        label: 'Dashboard',
        path: '/dashboard',
        roles: ['ADMIN', 'EMPLOYEE', 'FINANCE', 'MANAGER'],
    },
    {
        icon: Receipt,
        label: 'My Reimbursements',
        path: '/reimbursements',
        roles: ['EMPLOYEE'],
    },
    {
        icon: Receipt,
        label: 'Pending Review',
        path: '/reimbursements',
        roles: ['MANAGER'],
    },
    {
        icon: Receipt,
        label: 'Pending Payment',
        path: '/reimbursements',
        roles: ['FINANCE'],
    },
    {
        icon: Receipt,
        label: 'All Reimbursements',
        path: '/reimbursements',
        roles: ['ADMIN'],
    },
    {
        icon: Users,
        label: 'Users',
        path: '/users',
        roles: ['ADMIN'],
    },
    {
        icon: Tags,
        label: 'Categories',
        path: '/categories',
        roles: ['ADMIN'],
    },
    {
        icon: ShieldCheck,
        label: 'Approvals',
        path: '/approvals',
        roles: ['MANAGER'],
    },
];

const ROLE_LABELS: Record<Role, string> = {
    ADMIN: 'Admin',
    EMPLOYEE: 'Employee',
    FINANCE: 'Finance',
    MANAGER: 'Manager',
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
    const { logout, user } = useAuth();
    const { isMobile } = useSidebar();
    const matchRoute = useMatchRoute();

    const role = user?.role;
    const filtered = NAV_ITEMS.filter((item) =>
        role ? item.roles.includes(role) : false,
    );

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            tooltip="Reimbursement Control"
                        >
                            <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                <Receipt className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    Reimbursement
                                </span>
                                <span className="truncate text-xs">
                                    Control
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {filtered.map((item) => (
                                <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={
                                            !!matchRoute({ to: item.path })
                                        }
                                        tooltip={item.label}
                                    >
                                        <Link to={item.path}>
                                            <item.icon />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                    size="lg"
                                    tooltip={user?.name ?? 'User'}
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg">
                                            {user?.name
                                                ?.charAt(0)
                                                .toUpperCase() ?? '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate">
                                            {user?.name}
                                        </span>
                                        <span className="truncate text-xs">
                                            {role ? ROLE_LABELS[role] : ''}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                side={isMobile ? 'bottom' : 'right'}
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarFallback className="rounded-lg">
                                                {user?.name
                                                    ?.charAt(0)
                                                    .toUpperCase() ?? '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-medium">
                                                {user?.name}
                                            </span>
                                            <span className="truncate text-xs">
                                                {user?.email}
                                            </span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout}>
                                    <LogOut />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
