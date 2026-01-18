"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import Spinner from "../Spinner/Spinner";

/**
 * AdminRoute Component
 * High-order component to protect admin-only routes
 */
const AdminRoute = ({ children }) => {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If loading is finished and user is not authenticated or not an admin
        if (!loading) {
            if (!user) {
                router.replace("/signin");
            } else if (userProfile && userProfile.role !== "admin") {
                // If user is authenticated but not an admin, redirect to home
                router.replace("/");
            }
        }
    }, [user, userProfile, loading, router]);

    // Show loading state while checking authentication
    if (loading || !user || (userProfile && userProfile.role !== "admin")) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" color="gold" className="full-page" />
            </div>
        );
    }

    // If authenticated and is admin, render children
    return <>{children}</>;
};

export default AdminRoute;
