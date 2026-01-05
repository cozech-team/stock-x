# Firebase Authentication with Admin Approval - Step-by-Step Implementation Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 1: Firebase Project Setup](#phase-1-firebase-project-setup)
3. [Phase 2: Project Configuration](#phase-2-project-configuration)
4. [Phase 3: Core Authentication Setup](#phase-3-core-authentication-setup)
5. [Phase 4: Firestore & User Management](#phase-4-firestore--user-management)
6. [Phase 5: Component Integration](#phase-5-component-integration)
7. [Phase 6: Admin Dashboard](#phase-6-admin-dashboard)
8. [Phase 7: Testing & Verification](#phase-7-testing--verification)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

-   ✅ A Google account (for Firebase Console access)
-   ✅ Node.js and npm installed
-   ✅ Stock-X frontend project set up and running
-   ✅ Basic understanding of React and Next.js
-   ✅ (Optional) Apple Developer account for Apple OAuth

---

## Phase 1: Firebase Project Setup

### Step 1.1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `stock-x` (or your preferred name)
4. Click **Continue**
5. (Optional) Enable Google Analytics - recommended for tracking
6. Click **Continue** and select or create Analytics account
7. Click **Create project**
8. Wait for project creation to complete
9. Click **Continue** to enter your project dashboard

### Step 1.2: Register Web App

1. In Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: `Stock-X Web App`
3. ✅ Check **"Also set up Firebase Hosting"** (optional, for future deployment)
4. Click **Register app**
5. **IMPORTANT**: Copy the Firebase configuration object - you'll need this later
    ```javascript
    const firebaseConfig = {
        apiKey: "AIza...",
        authDomain: "stock-x.firebaseapp.com",
        projectId: "stock-x",
        storageBucket: "stock-x.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef",
    };
    ```
6. Click **Continue to console**

### Step 1.3: Enable Authentication Methods

1. In Firebase Console sidebar, click **Authentication**
2. Click **Get started** (if first time)
3. Go to **Sign-in method** tab
4. Enable **Email/Password**:
    - Click on **Email/Password**
    - Toggle **Enable** switch to ON
    - Click **Save**
5. Enable **Google**:
    - Click on **Google**
    - Toggle **Enable** switch to ON
    - Enter project support email
    - Click **Save**
6. (Optional) Enable **Apple**:
    - Click on **Apple**
    - Toggle **Enable** switch to ON
    - Follow Apple-specific setup instructions
    - You'll need Apple Developer account credentials
    - Click **Save**

### Step 1.4: Enable Firestore Database

1. In Firebase Console sidebar, click **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode** (we'll add security rules later)
4. Click **Next**
5. Choose a Cloud Firestore location (select closest to your users)
6. Click **Enable**
7. Wait for database creation to complete

### Step 1.5: Configure Authorized Domains

1. Go back to **Authentication** → **Settings** tab
2. Scroll to **Authorized domains**
3. Verify `localhost` is listed (should be by default)
4. Add your production domain when ready to deploy
5. Click **Add domain** if needed

---

## Phase 2: Project Configuration

### Step 2.1: Install Firebase SDK

1. Open terminal in your frontend project directory:

    ```bash
    cd c:\Users\hp\OneDrive\Desktop\stock-x\frontend
    ```

2. Install Firebase package:

    ```bash
    npm install firebase
    ```

3. Verify installation in `package.json`:
    ```json
    "dependencies": {
      "firebase": "^10.x.x",
      ...
    }
    ```

### Step 2.2: Create Environment Variables File

1. In the `frontend` directory, create a new file named `.env.local`

2. Add your Firebase configuration (use values from Step 1.2):

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=stock-x.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=stock-x
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=stock-x.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
    NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
    ```

3. **IMPORTANT**: Verify `.env.local` is in your `.gitignore`:

    ```bash
    # Check if .gitignore exists
    cat .gitignore | grep .env.local
    ```

    If not found, add it:

    ```
    # Local env files
    .env*.local
    ```

4. Restart your development server to load new environment variables:
    ```bash
    npm run dev
    ```

### Step 2.3: Create Firebase Configuration File

1. Create directory for Firebase config:

    ```bash
    mkdir src/lib
    ```

2. Create file `src/lib/firebase.js` with the following content:

```javascript
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
```

---

## Phase 3: Core Authentication Setup

### Step 3.1: Create User Management Service

1. Create services directory:

    ```bash
    mkdir src/services
    ```

2. Create file `src/services/userService.js`:

```javascript
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
import { deleteUser as deleteAuthUser } from "firebase/auth";
import { db } from "../lib/firebase";

const USERS_COLLECTION = "users";

/**
 * Create user profile in Firestore
 */
export const createUserProfile = async (uid, userData) => {
    try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        await setDoc(userRef, {
            uid,
            email: userData.email,
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
 * Approve user account
 */
export const approveUser = async (uid, adminUid) => {
    try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        await updateDoc(userRef, {
            status: "approved",
            approvedAt: serverTimestamp(),
            approvedBy: adminUid,
            updatedAt: serverTimestamp(),
        });
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
```

### Step 3.2: Create Authentication Service

Create file `src/services/authService.js`:

```javascript
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    OAuthProvider,
    sendPasswordResetEmail,
    confirmPasswordReset,
    signOut as firebaseSignOut,
    updateProfile,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { createUserProfile, getUserProfile, updateLastLogin } from "./userService";

// Initialize providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider("apple.com");

/**
 * Check user approval status
 */
export const checkUserApprovalStatus = async (uid) => {
    const result = await getUserProfile(uid);
    if (!result.success) {
        return { approved: false, status: "error", message: "Failed to check approval status" };
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
        return { approved: false, status: "rejected", message: "Your account has been rejected. Please contact support." };
    } else if (status === "suspended") {
        return {
            approved: false,
            status: "suspended",
            message: "Your account has been suspended. Please contact support.",
        };
    }

    return { approved: false, status: "unknown", message: "Unknown account status" };
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

        // Update last login
        await updateLastLogin(userCredential.user.uid);

        return {
            success: true,
            user: userCredential.user,
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
        };
    } catch (error) {
        return {
            success: false,
            error: formatAuthError(error),
        };
    }
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
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
 * Confirm password reset with code
 */
export const resetPassword = async (code, newPassword) => {
    try {
        await confirmPasswordReset(auth, code, newPassword);
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

    return errorMessages[error.code] || "An error occurred. Please try again.";
};
```

### Step 3.3: Create Authentication Context

1. Create contexts directory:

    ```bash
    mkdir src/contexts
    ```

2. Create file `src/contexts/AuthContext.jsx`:

```javascript
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserProfile } from "../services/userService";

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
                    setUserProfile(profileResult.data);
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
```

### Step 3.4: Create Utility Helpers

1. Create utils directory:

    ```bash
    mkdir src/utils
    ```

2. Create file `src/utils/authHelpers.js`:

```javascript
/**
 * Validate email format
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
    return {
        minLength: password.length >= 8,
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        hasNumber: /\d/.test(password),
        hasCapital: /[A-Z]/.test(password),
    };
};

/**
 * Check if password is valid (all criteria met)
 */
export const isPasswordValid = (password) => {
    const criteria = validatePassword(password);
    return Object.values(criteria).every(Boolean);
};

/**
 * Extract reset code from URL
 */
export const extractResetCode = (url) => {
    const urlParams = new URLSearchParams(url.split("?")[1]);
    return urlParams.get("oobCode");
};
```

### Step 3.5: Integrate AuthProvider into App

1. Open `src/app/layout.js`

2. Import AuthProvider:

    ```javascript
    import { AuthProvider } from "../contexts/AuthContext";
    ```

3. Wrap children with AuthProvider (inside ClientLayout or body):
    ```javascript
    <AuthProvider>{children}</AuthProvider>
    ```

---

## Phase 4: Firestore & User Management

### Step 4.1: Configure Firestore Security Rules

1. Go to Firebase Console → Firestore Database
2. Click on **Rules** tab
3. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Helper function to check if user is approved
    function isApproved() {
      return request.auth != null &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.status == 'approved';
    }

    // Users collection rules
    match /users/{userId} {
      // Anyone can create their own user document (for sign-up)
      allow create: if request.auth != null && request.auth.uid == userId;

      // Users can read their own document
      allow read: if request.auth != null && request.auth.uid == userId;

      // Admins can read all user documents
      allow read: if isAdmin();

      // Users can update their own profile (except role and status)
      allow update: if request.auth != null &&
                       request.auth.uid == userId &&
                       !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'status']);

      // Admins can update any user (including role and status)
      allow update: if isAdmin();

      // Only admins can delete users
      allow delete: if isAdmin();
    }

    // List all users (admin only)
    match /users/{document=**} {
      allow list: if isAdmin();
    }
  }
}
```

4. Click **Publish**

---

## Phase 5: Component Integration

### Step 5.1: Update SignUp Component

Follow the same pattern as the original guide, but with these key changes:

1. After successful registration, show a success message instead of redirecting
2. User is automatically signed out
3. Display message: "Account created successfully! Please wait for admin approval."

### Step 5.2: Update SignIn Component

Key changes:

1. After authentication, check approval status
2. If not approved, show appropriate error message
3. Only redirect if user is approved

### Step 5.3: Update ForgotPassword and SetPassword Components

These remain the same as the original guide.

---

## Phase 6: Admin Dashboard

### Step 6.1: Create Admin Dashboard Component

1. Create admin dashboard directory:

    ```bash
    mkdir src/components/AdminDashboard
    ```

2. Create `src/components/AdminDashboard/AdminDashboard.jsx`:

```javascript
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getAllUsers, getPendingUsers } from "../../services/userService";
import UserManagementTable from "./UserManagementTable";
import "./AdminDashboard.scss";

const AdminDashboard = () => {
    const { userProfile } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [filter, users, searchTerm]);

    const loadUsers = async () => {
        setLoading(true);
        const result = await getAllUsers();
        if (result.success) {
            setUsers(result.data);
        }
        setLoading(false);
    };

    const filterUsers = () => {
        let filtered = users;

        // Filter by status
        if (filter !== "all") {
            filtered = filtered.filter((user) => user.status === filter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (user) =>
                    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    };

    const pendingCount = users.filter((u) => u.status === "pending").length;

    if (loading) {
        return <div className="admin-dashboard loading">Loading...</div>;
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>User Management</h1>
                {pendingCount > 0 && (
                    <div className="pending-badge">
                        {pendingCount} pending approval{pendingCount > 1 ? "s" : ""}
                    </div>
                )}
            </div>

            <div className="dashboard-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-buttons">
                    <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
                        All ({users.length})
                    </button>
                    <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>
                        Pending ({users.filter((u) => u.status === "pending").length})
                    </button>
                    <button className={filter === "approved" ? "active" : ""} onClick={() => setFilter("approved")}>
                        Approved ({users.filter((u) => u.status === "approved").length})
                    </button>
                    <button className={filter === "rejected" ? "active" : ""} onClick={() => setFilter("rejected")}>
                        Rejected ({users.filter((u) => u.status === "rejected").length})
                    </button>
                    <button className={filter === "suspended" ? "active" : ""} onClick={() => setFilter("suspended")}>
                        Suspended ({users.filter((u) => u.status === "suspended").length})
                    </button>
                </div>
            </div>

            <UserManagementTable users={filteredUsers} onUserUpdated={loadUsers} currentAdminUid={userProfile?.uid} />
        </div>
    );
};

export default AdminDashboard;
```

### Step 6.2: Create User Management Table

Create `src/components/AdminDashboard/UserManagementTable.jsx`:

```javascript
"use client";

import { useState } from "react";
import { approveUser, rejectUser, suspendUser, updateUserRole, updateUserProfile } from "../../services/userService";

const UserManagementTable = ({ users, onUserUpdated, currentAdminUid }) => {
    const [editingUser, setEditingUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleApprove = async (uid) => {
        if (!confirm("Approve this user?")) return;

        setLoading(true);
        const result = await approveUser(uid, currentAdminUid);
        setLoading(false);

        if (result.success) {
            alert("User approved successfully");
            onUserUpdated();
        } else {
            alert("Error approving user: " + result.error);
        }
    };

    const handleReject = async (uid) => {
        if (!confirm("Reject this user?")) return;

        setLoading(true);
        const result = await rejectUser(uid, currentAdminUid);
        setLoading(false);

        if (result.success) {
            alert("User rejected");
            onUserUpdated();
        } else {
            alert("Error rejecting user: " + result.error);
        }
    };

    const handleSuspend = async (uid) => {
        if (!confirm("Suspend this user?")) return;

        setLoading(true);
        const result = await suspendUser(uid, currentAdminUid);
        setLoading(false);

        if (result.success) {
            alert("User suspended");
            onUserUpdated();
        } else {
            alert("Error suspending user: " + result.error);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: "🟡 Pending",
            approved: "🟢 Approved",
            rejected: "🔴 Rejected",
            suspended: "⚫ Suspended",
        };
        return badges[status] || status;
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
    };

    return (
        <div className="user-management-table">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.uid}>
                            <td>{user.displayName || "N/A"}</td>
                            <td>{user.email}</td>
                            <td>{user.phoneNumber || "N/A"}</td>
                            <td>{user.role}</td>
                            <td>{getStatusBadge(user.status)}</td>
                            <td>{formatDate(user.createdAt)}</td>
                            <td className="actions">
                                {user.status === "pending" && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(user.uid)}
                                            disabled={loading}
                                            className="btn-approve"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(user.uid)}
                                            disabled={loading}
                                            className="btn-reject"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {user.status === "approved" && (
                                    <button
                                        onClick={() => handleSuspend(user.uid)}
                                        disabled={loading}
                                        className="btn-suspend"
                                    >
                                        Suspend
                                    </button>
                                )}
                                {user.status === "suspended" && (
                                    <button
                                        onClick={() => handleApprove(user.uid)}
                                        disabled={loading}
                                        className="btn-approve"
                                    >
                                        Reactivate
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagementTable;
```

### Step 6.3: Create Admin Page Route

1. Create admin directory in app:

    ```bash
    mkdir src/app/admin
    ```

2. Create `src/app/admin/page.jsx`:

```javascript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import AdminDashboard from "../../components/AdminDashboard/AdminDashboard";

export default function AdminPage() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/signin");
            } else if (userProfile?.role !== "admin") {
                router.push("/");
            }
        }
    }, [user, userProfile, loading, router]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user || userProfile?.role !== "admin") {
        return null;
    }

    return <AdminDashboard />;
}
```

### Step 6.4: Create Initial Admin User

**IMPORTANT**: You need at least one admin user to access the admin dashboard.

1. Create a user account through the sign-up flow
2. Go to Firebase Console → Firestore Database
3. Click on the `users` collection
4. Find the user document (it will have the user's UID as the document ID)
5. Click on the document to edit it
6. Manually set these fields:
    - `role`: Change from `"user"` to `"admin"`
    - `status`: Change from `"pending"` to `"approved"`
7. Click **Update**
8. Now you can sign in with this user and access `/admin`

---

## Phase 7: Testing & Verification

### Test 1: User Registration with Pending Status

1. Navigate to `/signup`
2. Fill in all fields and submit
3. ✅ Verify "pending approval" message displays
4. ✅ Verify you're automatically signed out
5. ✅ Check Firestore → users collection → verify status="pending"

### Test 2: Blocked Login for Pending User

1. Navigate to `/signin`
2. Try to sign in with pending user credentials
3. ✅ Verify error message: "Your account is pending admin approval"
4. ✅ Verify you remain on sign-in page

### Test 3: Admin Dashboard Access

1. Sign in with admin user (created in Step 6.4)
2. Navigate to `/admin`
3. ✅ Verify dashboard loads
4. ✅ Verify you can see all users
5. ✅ Verify pending users are highlighted

### Test 4: Approve User

1. In admin dashboard, find pending user
2. Click "Approve" button
3. ✅ Verify success message
4. ✅ Check Firestore → verify status changed to "approved"

### Test 5: Approved User Login

1. Sign out
2. Sign in with approved user credentials
3. ✅ Verify successful login
4. ✅ Verify redirect to home/dashboard

### Test 6: Suspend User

1. Sign in as admin
2. Go to admin dashboard
3. Click "Suspend" on an approved user
4. ✅ Verify status changes to "suspended"
5. Sign out and try to sign in as suspended user
6. ✅ Verify error: "Your account has been suspended"

---

## Troubleshooting

### Issue: "Permission denied" in Firestore

**Solution**: Verify Firestore security rules are published correctly. Check that the admin user has `role: "admin"` in Firestore.

### Issue: Admin dashboard shows "Loading..." forever

**Solution**: Check browser console for errors. Verify Firestore rules allow admin to list users.

### Issue: User status not updating

**Solution**: Verify you're signed in as admin. Check Firestore rules. Ensure `updateDoc` is importing correctly from Firebase.

### Issue: Can't create first admin user

**Solution**: This must be done manually in Firestore Console. There's no way around this for the first admin.

---

## Next Steps

After successful implementation:

1. ✅ Style the admin dashboard with SCSS
2. ✅ Add pagination for large user lists
3. ✅ Add user edit functionality
4. ✅ Add user delete functionality
5. ✅ Add email notifications for approval/rejection
6. ✅ Add activity logs
7. ✅ Deploy to production
8. ✅ Set up monitoring and analytics

**Congratulations!** You've successfully implemented Firebase Authentication with Admin Approval System! 🎉
