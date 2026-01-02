"use client";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import SmoothScroll from "@/components/SmoothScroll/SmoothScroll";

export default function ClientLayout({ children }) {
    const pathname = usePathname();

    return (
        <SmoothScroll>
            <AnimatePresence mode="sync" initial={false}>
                <div key={pathname}>{children}</div>
            </AnimatePresence>
        </SmoothScroll>
    );
}
