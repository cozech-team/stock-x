import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { isPackageExpired } from "../constants/packages";

const USERS_COLLECTION = "users";

/**
 * Check and handle package expiry for a user
 * If expired, updates status to suspended
 */
export const checkAndHandlePackageExpiry = async (user) => {
    if (!user || user.role === "admin" || user.status !== "approved") {
        return { expired: false };
    }

    if (user.packageEndDate && isPackageExpired(user.packageEndDate)) {
        try {
            const userRef = doc(db, USERS_COLLECTION, user.uid);
            await updateDoc(userRef, {
                status: "suspended",
                packageStatus: "expired",
                updatedAt: serverTimestamp(),
            });
            return { expired: true };
        } catch (error) {
            console.error("Error auto-suspending expired user:", error);
            return { expired: true }; // Still treat as expired even if Firestore update fails
        }
    }

    return { expired: false };
};

/**
 * Create user profile in Firestore
 */
export const createUserProfile = async (uid, userData) => {
    try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        await setDoc(userRef, {
            uid,
            email: userData.email.toLowerCase(), // Store email in lowercase for consistent querying
            displayName: userData.displayName || "",
            phoneNumber: userData.phoneNumber || "",
            role: "user", // Default role
            status: "pending", // Requires admin approval
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            approvedAt: null,
            approvedBy: null,
            metadata: {
                lastLoginAt: null,
                loginCount: 0,
            },
        });
        return { success: true };
    } catch (error) {
        console.error("Error creating user profile:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (uid) => {
    try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return { success: true, data: userSnap.data() };
        } else {
            return { success: false, error: "User profile not found" };
        }
    } catch (error) {
        console.error("Error getting user profile:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Get user by email from Firestore
 */
export const getUserByEmail = async (email) => {
    try {
        // Normalize email: trim whitespace and convert to lowercase
        const normalizedEmail = email.trim().toLowerCase();

        const usersRef = collection(db, USERS_COLLECTION);
        const q = query(usersRef, where("email", "==", normalizedEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            return { success: true, data: userDoc.data() };
        } else {
            return { success: false, error: "User not found" };
        }
    } catch (error) {
        console.error("Error getting user by email:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (uid, updates) => {
    try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        await updateDoc(userRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating user profile:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Update Firestore user (alias for updateUserProfile)
 * Used by admin dashboard for editing user details
 */
export const updateFirestoreUser = async (uid, updates) => {
    return await updateUserProfile(uid, updates);
};

/**
 * Delete user profile from Firestore
 */
export const deleteUserProfile = async (uid) => {
    try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        await deleteDoc(userRef);
        return { success: true };
    } catch (error) {
        console.error("Error deleting user profile:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async () => {
    try {
        const usersRef = collection(db, USERS_COLLECTION);
        const querySnapshot = await getDocs(usersRef);
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: users };
    } catch (error) {
        console.error("Error getting all users:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Get pending users (admin only)
 */
export const getPendingUsers = async () => {
    try {
        const usersRef = collection(db, USERS_COLLECTION);
        const q = query(usersRef, where("status", "==", "pending"));
        const querySnapshot = await getDocs(q);
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: users };
    } catch (error) {
        console.error("Error getting pending users:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Approve user account with package
 */
export const approveUser = async (uid, adminUid, packageData = null) => {
    try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        const updateData = {
            status: "approved",
            approvedAt: serverTimestamp(),
            approvedBy: adminUid,
            updatedAt: serverTimestamp(),
        };

        // Add package data if provided
        if (packageData) {
            const now = new Date();
            const endDate = new Date(now);
            endDate.setDate(endDate.getDate() + packageData.days);

            updateData.package = packageData.type;
            updateData.packageStartDate = now;
            updateData.packageEndDate = endDate;
            updateData.packageStatus = "active";
        }

        await updateDoc(userRef, updateData);
        return { success: true };
    } catch (error) {
        console.error("Error approving user:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Reject user account
 */
export const rejectUser = async (uid, adminUid) => {
    try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        await updateDoc(userRef, {
            status: "rejected",
            updatedAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error rejecting user:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Suspend user account
 */
export const suspendUser = async (uid, adminUid) => {
    try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        await updateDoc(userRef, {
            status: "suspended",
            updatedAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error suspending user:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Update user role
 */
export const updateUserRole = async (uid, role) => {
    try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        await updateDoc(userRef, {
            role,
            updatedAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating user role:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Check if user is admin
 */
export const isAdmin = async (uid) => {
    try {
        const result = await getUserProfile(uid);
        if (result.success) {
            return result.data.role === "admin";
        }
        return false;
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
};

/**
 * Update last login timestamp
 */
export const updateLastLogin = async (uid) => {
    try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const currentLoginCount = userSnap.data().metadata?.loginCount || 0;
            await updateDoc(userRef, {
                "metadata.lastLoginAt": serverTimestamp(),
                "metadata.loginCount": currentLoginCount + 1,
                updatedAt: serverTimestamp(),
            });
        }
        return { success: true };
    } catch (error) {
        console.error("Error updating last login:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Delete user completely from Firestore and Firebase Auth
 * Uses Firebase Admin SDK via API route
 */
export const deleteUser = async (user, adminUid) => {
    try {
        const response = await fetch("/api/delete-user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uid: user.uid,
                adminUid: adminUid,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: result.error || "Failed to delete user",
            };
        }

        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: error.message };
    }
};
