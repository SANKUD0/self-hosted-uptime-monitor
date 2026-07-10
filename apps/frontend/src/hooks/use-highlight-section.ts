"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function useHighlightSection() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const trigger = () => {
            const hash = window.location.hash.slice(1);
            if (!hash) return;

            const el = document.getElementById(hash);
            if (!el) return;

            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.classList.remove("section-highlight");
            void el.offsetWidth;
            el.classList.add("section-highlight");

            setTimeout(() => el.classList.remove("section-highlight"), 2000);
        };

        const timer = setTimeout(trigger, 50);

        window.addEventListener("hashchange", trigger);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("hashchange", trigger);
        };
    }, [pathname, searchParams]);
}