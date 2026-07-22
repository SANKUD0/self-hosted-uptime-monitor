"use client";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/sidebar";

export default function MobileHeader() {
    const { toggleSidebar } = useSidebar();
    return (
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-2 md:hidden">
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                aria-label="Ouvrir le menu"
                className="size-11"
            >
                <Menu size={20} />
            </Button>
            <span className="font-semibold">OpenNotify</span>
        </header>
    );
}