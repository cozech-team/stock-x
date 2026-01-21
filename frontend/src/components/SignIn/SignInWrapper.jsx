"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import SignIn from "./SignIn";
import Spinner from "../Spinner/Spinner";

/**
 * SignInWrapper Component
 * Prevents authenticated users from accessing the login page.
 * Redirects authenticated users to their appropriate dashboard.
 */
const SignInWrapper = () => {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If user is authenticated AND approved, redirect to appropriate dashboard
        if (!loading && user && userProfile) {
            // Check if user is approved
            if (userProfile.status === "approved") {
                if (userProfile.role === "admin") {
                    router.replace("/admin");
                } else {
                    router.replace("/");
                }
            } else {
                // If not approved (pending, rejected, suspended), don't redirect
                // This allows the error message to be displayed
            }
        }
    }, [user, userProfile, loading, router]);

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-(--primary-bg)">
                <Spinner size="lg" color="gold" />
            </div>
        );
    }

    // If user is authenticated AND approved, show loading while redirecting
    if (user && userProfile && userProfile.status === "approved") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-(--primary-bg)">
                <Spinner size="lg" color="gold" />
            </div>
        );
    }

    // Only render SignIn component for unauthenticated users
    return <SignIn />;
};

export default SignInWrapper;
