"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import Spinner from "../Spinner/Spinner";

/**
 * ProtectedRoute Component
 * Wraps pages that require authentication.
 * Redirects to sign-in page if user is not authenticated.
 */
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/signin");
        }
    }, [user, loading, router]);

    // Show spinner while checking auth status
    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-(--primary-bg)">
                <Spinner size="lg" color="gold" />
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
