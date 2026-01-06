"use client";
import SmoothScroll from "@/components/SmoothScroll/SmoothScroll";
import { AuthProvider } from "@/contexts/AuthContext";

export default function ClientLayout({ children }) {
    return (
        <AuthProvider>
            <SmoothScroll>{children}</SmoothScroll>
        </AuthProvider>
    );
}
