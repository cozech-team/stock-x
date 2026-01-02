"use client";

import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import SmoothScroll from "@/components/SmoothScroll/SmoothScroll";

export default function ClientWrapper({ children }) {
    const pathname = usePathname();

    return (
        <SmoothScroll>
            <AnimatePresence mode="wait">
                <div key={pathname}>{children}</div>
            </AnimatePresence>
        </SmoothScroll>
    );
}
