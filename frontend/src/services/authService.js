import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    OAuthProvider,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail,
    confirmPasswordReset as firebaseConfirmPasswordReset,
    signOut as firebaseSignOut,
    updateProfile,
    fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { createUserProfile, getUserProfile, updateLastLogin, getUserByEmail } from "./userService";
import { sendAdminNotificationEmail } from "./emailService";

// Initialize providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider("apple.com");

/**
 * Check user approval status
 */
export const checkUserApprovalStatus = async (uid) => {
    const result = await getUserProfile(uid);
    if (!result.success) {
        return {
            approved: false,
            status: "error",
            message: "Failed to check approval status",
        };
    }

    const status = result.data.status;

    if (status === "approved") {
        return { approved: true, status: "approved" };
    } else if (status === "pending") {
        return {
            approved: false,
            status: "pending",
            message: "Your account is pending admin approval. Please wait for approval before signing in.",
        };
    } else if (status === "rejected") {
        return {
            approved: false,
            status: "rejected",
            message: "Your account has been rejected. Please contact support.",
        };
    } else if (status === "suspended") {
        return {
            approved: false,
            status: "suspended",
            message: "Your account has been suspended. Please contact support.",
        };
    }

    return {
        approved: false,
        status: "unknown",
        message: "Unknown account status",
    };
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email, password, name, phone) => {
    try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update user profile with name
        await updateProfile(userCredential.user, {
            displayName: name,
        });

        // Create user profile in Firestore with pending status
        await createUserProfile(userCredential.user.uid, {
            email,
            displayName: name,
            phoneNumber: phone,
        });

        // Send email notification to admins (non-blocking)
        sendAdminNotificationEmail({
            uid: userCredential.user.uid,
            email,
            displayName: name,
            phoneNumber: phone,
        }).catch((err) => console.error("Failed to send admin notification:", err));

        // Sign out user immediately (they need approval first)
        await firebaseSignOut(auth);

        return {
            success: true,
            user: userCredential.user,
            message: "Account created successfully! Please wait for admin approval before signing in.",
        };
    } catch (error) {
        return {
            success: false,
            error: formatAuthError(error),
        };
    }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Check approval status
        const approvalStatus = await checkUserApprovalStatus(userCredential.user.uid);

        if (!approvalStatus.approved) {
            // Sign out user if not approved
            await firebaseSignOut(auth);
            return {
                success: false,
                error: approvalStatus.message,
            };
        }

        // Get profile to return role
        const profileResult = await getUserProfile(userCredential.user.uid);

        // Update last login
        await updateLastLogin(userCredential.user.uid);

        return {
            success: true,
            user: userCredential.user,
            profile: profileResult.data,
        };
    } catch (error) {
        return {
            success: false,
            error: formatAuthError(error),
        };
    }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);

        // Check if user profile exists
        const profileResult = await getUserProfile(result.user.uid);

        // If user doesn't exist in Firestore, create profile
        if (!profileResult.success) {
            await createUserProfile(result.user.uid, {
                email: result.user.email,
                displayName: result.user.displayName,
                phoneNumber: result.user.phoneNumber || "",
            });

            // Send email notification to admins (non-blocking)
            sendAdminNotificationEmail({
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                phoneNumber: result.user.phoneNumber || "",
            }).catch((err) => console.error("Failed to send admin notification:", err));

            // Sign out new user (needs approval)
            await firebaseSignOut(auth);
            return {
                success: false,
                error: "Account created successfully! Please wait for admin approval before signing in.",
            };
        }

        // Check approval status for existing user
        const approvalStatus = await checkUserApprovalStatus(result.user.uid);

        if (!approvalStatus.approved) {
            await firebaseSignOut(auth);
            return {
                success: false,
                error: approvalStatus.message,
            };
        }

        // Update last login
        await updateLastLogin(result.user.uid);

        return {
            success: true,
            user: result.user,
            profile: profileResult.data,
        };
    } catch (error) {
        return {
            success: false,
            error: formatAuthError(error),
        };
    }
};

/**
 * Sign in with Apple
 */
export const signInWithApple = async () => {
    try {
        const result = await signInWithPopup(auth, appleProvider);

        // Check if user profile exists
        const profileResult = await getUserProfile(result.user.uid);

        // If user doesn't exist in Firestore, create profile
        if (!profileResult.success) {
            await createUserProfile(result.user.uid, {
                email: result.user.email,
                displayName: result.user.displayName,
                phoneNumber: result.user.phoneNumber || "",
            });

            // Send email notification to admins (non-blocking)
            sendAdminNotificationEmail({
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                phoneNumber: result.user.phoneNumber || "",
            }).catch((err) => console.error("Failed to send admin notification:", err));

            // Sign out new user (needs approval)
            await firebaseSignOut(auth);
            return {
                success: false,
                error: "Account created successfully! Please wait for admin approval before signing in.",
            };
        }

        // Check approval status for existing user
        const approvalStatus = await checkUserApprovalStatus(result.user.uid);

        if (!approvalStatus.approved) {
            await firebaseSignOut(auth);
            return {
                success: false,
                error: approvalStatus.message,
            };
        }

        // Update last login
        await updateLastLogin(result.user.uid);

        return {
            success: true,
            user: result.user,
            profile: profileResult.data,
        };
    } catch (error) {
        return {
            success: false,
            error: formatAuthError(error),
        };
    }
};

/**
 * Send password reset email with optional redirect settings
 */
export const sendPasswordReset = async (email, redirectUrl = null) => {
    try {
        const actionCodeSettings = redirectUrl
            ? {
                  url: redirectUrl,
                  handleCodeInApp: true,
              }
            : null;

        await firebaseSendPasswordResetEmail(auth, email, actionCodeSettings);
        return {
            success: true,
        };
    } catch (error) {
        console.error("Password reset error:", error);

        return {
            success: false,
            error: formatAuthError(error),
        };
    }
};

/**
 * Confirm password reset with code
 */
export const resetPassword = async (code, newPassword) => {
    try {
        await firebaseConfirmPasswordReset(auth, code, newPassword);
        return {
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            error: formatAuthError(error),
        };
    }
};

/**
 * Sign out current user
 */
export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
        return {
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            error: formatAuthError(error),
        };
    }
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
    return auth.currentUser;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (displayName, phoneNumber) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return {
                success: false,
                error: "No user is currently signed in",
            };
        }

        await updateProfile(user, {
            displayName,
        });

        return {
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            error: formatAuthError(error),
        };
    }
};

/**
 * Format Firebase auth errors to user-friendly messages
 */
const formatAuthError = (error) => {
    const errorMessages = {
        "auth/email-already-in-use": "This email is already registered. Please sign in instead.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/operation-not-allowed": "This sign-in method is not enabled. Please contact support.",
        "auth/weak-password": "Password is too weak. Please use a stronger password.",
        "auth/user-disabled": "This account has been disabled. Please contact support.",
        "auth/user-not-found": "No account found with this email. Please sign up first.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/invalid-credential": "Invalid email or password. Please try again.",
        "auth/too-many-requests": "Too many failed attempts. Please try again later.",
        "auth/network-request-failed": "Network error. Please check your connection and try again.",
        "auth/popup-closed-by-user": "Sign-in cancelled. Please try again.",
        "auth/cancelled-popup-request": "Sign-in cancelled. Please try again.",
        "auth/expired-action-code": "This password reset link has expired. Please request a new one.",
        "auth/invalid-action-code": "This password reset link is invalid. Please request a new one.",
    };

    return errorMessages[error.code] || error.message || "An error occurred. Please try again.";
};
