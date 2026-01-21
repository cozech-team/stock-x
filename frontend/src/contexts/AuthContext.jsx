"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserProfile, checkAndHandlePackageExpiry } from "../services/userService";

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);

            if (user) {
                // Fetch user profile from Firestore
                const profileResult = await getUserProfile(user.uid);

                if (profileResult.success) {
                    let profileData = profileResult.data;

                    // Check for package expiry and handle auto-suspension
                    const expiryCheck = await checkAndHandlePackageExpiry(profileData);

                    if (expiryCheck.expired) {
                        // Refresh profile data if it was updated (auto-suspended)
                        profileData = {
                            ...profileData,
                            status: "suspended",
                            packageStatus: "expired",
                        };
                    }

                    setUserProfile(profileData);
                } else {
                    setUserProfile(null);
                }
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        user,
        userProfile,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
