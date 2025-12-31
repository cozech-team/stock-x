"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import SmoothScroll from "@/components/SmoothScroll/SmoothScroll";

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export default function RootLayout({ children }) {
    const pathname = usePathname();

    return (
        <html lang="en" data-theme="dark">
            <body className={inter.className}>
                <SmoothScroll>
                    <AnimatePresence mode="wait">
                        <div key={pathname}>{children}</div>
                    </AnimatePresence>
                </SmoothScroll>
            </body>
        </html>
    );
}
