"use client";

import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/services/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";

export default function Home() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.push("/signin");
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-(--primary-bg) transition-colors duration-300">
                <header className="p-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-(--primary-color)">StockX</h1>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-lg border border-(--border-color) text-(--primary-color) hover:bg-(--accent-color-2) hover:text-white transition-all"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                href="/signin"
                                className="px-4 py-2 rounded-lg bg-(--accent-color-2) text-white hover:opacity-90 transition-all font-medium"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </header>

                <div className="h-[calc(100vh-100px)] w-full flex flex-col justify-center items-center">
                    <h1 className="text-6xl md:text-8xl font-black text-(--primary-color) mb-4">StockX</h1>
                    {userProfile && (
                        <p className="text-xl text-(--text-muted) font-medium">
                            Welcome back, <span className="text-(--primary-color)">{userProfile.displayName}</span>
                        </p>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
