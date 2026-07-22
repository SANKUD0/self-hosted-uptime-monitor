"use client";
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
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar"
import { ChevronRight, LayoutGrid, Mail, PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react"
import Link from "next/link"
import { Icon } from "@iconify/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

<Icon icon="material-symbols:space-dashboard-2-outline" />

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <CustomSidebarTrigger />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <NavLink href="/" label="Dashboard"
                                icon={<Icon icon="material-symbols:space-dashboard-2-outline" height="1em" />} />
                            <NavLink href="/services" label="Services"
                                icon={<Icon icon="mdi:server-outline" height="1em" />} />
                            <NavLink href="/incidents" label="Incidents"
                                icon={<Icon icon="mdi:alert-circle-outline" height="1em" />} />
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <Separator />
            <SidebarFooter>
                <SidebarMenu>
                    <SettingsMenu />
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

function SettingsMenu() {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    if (isCollapsed) {
        return (
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton>
                            <Settings size={16} />
                            <span>Settings</span>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="end">
                        <DropdownMenuItem asChild>
                            <Link href="/settings">General</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings#email">Email</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings#discord">Discord</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuItem>
            <Collapsible className="group/collapsible">
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                        <Settings size={16} />
                        <span>Settings</span>
                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        <SubNavLink href="settings#email" icon={<Mail size={16} />} label="Email" />
                        <SubNavLink href="/settings#discord" icon={<Icon icon="mdi:discord" height="1em" />} label="Discord" />
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    );
}


function CustomSidebarTrigger() {
    const { toggleSidebar, state } = useSidebar();
    const isOpen = state === "expanded";

    return (
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 transition-all hover:bg-sidebar-accent">
            <PanelLeftClose className={`absolute transition-all duration-300 
            ${isOpen ? "rotate-0 scale-100 opacity-100" : "rotate-180 scale-0 opacity-0"}`}
                size={16} />
            <PanelLeftOpen className={`absolute transition-all duration-300 
            ${isOpen ? "rotate-180 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
                size={16} />
        </Button>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    const { isMobile, setOpenMobile } = useSidebar();

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild>
                <Link href={href} onClick={() => isMobile && setOpenMobile(false)}>
                    {icon}
                    <span>{label}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

function SubNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    const { isMobile, setOpenMobile } = useSidebar();

    return (
        <SidebarMenuSubItem>
            <SidebarMenuSubButton asChild>
                <Link href={href} onClick={() => isMobile && setOpenMobile(false)}>
                    {icon}
                    <span>{label}</span>
                </Link>
            </SidebarMenuSubButton>
        </SidebarMenuSubItem>
    );
}