# Firebase Authentication Backend Implementation Plan

## Overview

This plan outlines the complete integration of Firebase Authentication with **Admin Approval System** into the Stock-X trading platform. The implementation includes:

-   Backend authentication capabilities for existing UI components
-   **Admin approval workflow** - New users require admin approval before login access
-   **User management system** - Admins can approve, update, and delete users
-   Firestore database for user data and approval status management

## User Review Required

> [!IMPORTANT] > **Firebase Project Setup**: You will need to create a Firebase project in the Firebase Console and obtain your Firebase configuration credentials before implementation begins. This includes:
>
> -   Firebase Project ID
> -   API Key
> -   Auth Domain
> -   Storage Bucket
> -   Messaging Sender ID
> -   App ID

> [!WARNING] > **Environment Variables**: Firebase credentials will be stored in environment variables (`.env.local`). This file should **NEVER** be committed to version control. Make sure `.env.local` is in your `.gitignore`.

> [!IMPORTANT] > **Authentication Methods**: This plan implements the following authentication methods:
>
> -   Email/Password authentication
> -   Google OAuth
> -   Apple OAuth (requires Apple Developer account)
> -   Password reset via email
>
> Please confirm which authentication methods you want to enable.

> [!IMPORTANT] > **Admin Approval Workflow**: New users will be created in Firebase Authentication but marked as "pending" in Firestore. They cannot log in until an admin approves their account. You will need to:
>
> -   Designate at least one initial admin user (can be done manually in Firestore)
> -   Create an admin dashboard for user management
> -   Decide on admin role assignment strategy

> [!CAUTION] > **Breaking Changes**: The authentication components will be modified to integrate with Firebase. Form submissions will now be asynchronous and include loading states and error handling.

## Proposed Changes

### Firestore Database Schema

#### Users Collection Structure

Firestore collection: `users`

Each user document will contain:

```javascript
{
  uid: "firebase-auth-uid",           // Firebase Auth UID
  email: "user@example.com",          // User email
  displayName: "John Doe",            // Full name
  phoneNumber: "+1234567890",         // Phone number
  role: "user" | "admin",             // User role
  status: "pending" | "approved" | "rejected" | "suspended",  // Account status
  createdAt: Timestamp,               // Account creation date
  updatedAt: Timestamp,               // Last update date
  approvedAt: Timestamp | null,       // Approval date
  approvedBy: "admin-uid" | null,     // Admin who approved
  metadata: {
    lastLoginAt: Timestamp | null,    // Last login timestamp
    loginCount: 0,                    // Total login count
    registrationIP: "xxx.xxx.xxx.xxx" // Optional: IP address
  }
}
```

**Status Flow**:

-   `pending` → New user registered, awaiting admin approval
-   `approved` → Admin approved, user can log in
-   `rejected` → Admin rejected, user cannot log in
-   `suspended` → Previously approved but now suspended by admin

---

### Firebase Configuration

#### [NEW] [.env.local](file:///c:/Users/hp/OneDrive/Desktop/stock-x/frontend/.env.local)

Environment variables file to store Firebase configuration securely:

-   Firebase API credentials
-   Project configuration
-   Authentication domain settings

#### [NEW] [firebase.js](file:///c:/Users/hp/OneDrive/Desktop/stock-x/frontend/src/lib/firebase.js)

Firebase initialization and configuration module:

-   Initialize Firebase app with credentials from environment variables
-   Export Firebase Auth instance
-   Export Firestore instance for database operations
-   Export Firebase app instance for other services

---

### Authentication Service Layer

#### [NEW] [authService.js](file:///c:/Users/hp/OneDrive/Desktop/stock-x/frontend/src/services/authService.js)

Centralized authentication service containing all Firebase auth operations:

-   `signUpWithEmail(email, password, name, phone)` - Create new user with email/password and Firestore profile
-   `signInWithEmail(email, password)` - Sign in existing user **with approval status check**
-   `signInWithGoogle()` - Google OAuth authentication **with approval status check**
-   `signInWithApple()` - Apple OAuth authentication **with approval status check**
-   `checkUserApprovalStatus(uid)` - Check if user is approved in Firestore
-   `sendPasswordResetEmail(email)` - Send password reset email
-   `confirmPasswordReset(code, newPassword)` - Confirm password reset with code
-   `signOut()` - Sign out current user
-   `getCurrentUser()` - Get current authenticated user
-   `updateUserProfile(displayName, phoneNumber)` - Update user profile information
-   Error handling and user-friendly error messages

---

### User Management Service

#### [NEW] [userService.js](file:///c:/Users/hp/OneDrive/Desktop/stock-x/frontend/src/services/userService.js)

Firestore operations for user management:

-   `createUserProfile(uid, userData)` - Create user document in Firestore
-   `getUserProfile(uid)` - Get user profile from Firestore
-   `updateUserProfile(uid, updates)` - Update user profile data
-   `deleteUserProfile(uid)` - Delete user profile from Firestore
-   `getAllUsers()` - Get all users (admin only)
-   `getPendingUsers()` - Get users with pending status (admin only)
-   `approveUser(uid, adminUid)` - Approve user account
-   `rejectUser(uid, adminUid)` - Reject user account
-   `suspendUser(uid, adminUid)` - Suspend user account
-   `deleteUser(uid)` - Delete user from Auth and Firestore (admin only)
-   `updateUserRole(uid, role)` - Update user role (admin only)
-   `isAdmin(uid)` - Check if user has admin role

---

### Authentication Context & State Management

#### [NEW] [AuthContext.jsx](file:///c:/Users/hp/OneDrive/Desktop/stock-x/frontend/src/contexts/AuthContext.jsx)

React Context for global authentication state:

-   Provides authentication state to all components
-   Manages current user state
-   Handles authentication state persistence
-   Provides loading states during auth operations
-   Exports `useAuth()` hook for easy access to auth state

#### [MODIFY] [layout.js](file:///c:/Users/hp/OneDrive/Desktop/stock-x/frontend/src/app/layout.js)

Wrap the application with AuthProvider:

-   Import and add `AuthProvider` wrapper
-   Ensures authentication state is available throughout the app

---

### Component Integration

#### [MODIFY] [SignIn.jsx](file:///c:/Users/hp/OneDrive/Desktop/stock-x/frontend/src/components/SignIn/SignIn.jsx)

Integrate Firebase authentication into SignIn component:

-   Add form submission handler with Firebase email/password sign-in
-   **Check user approval status after authentication**
-   **Block login if user status is "pending", "rejected", or "suspended"**
-   **Show appropriate error messages based on account status**
-   Implement Google OAuth button functionality
-   Implement Apple OAuth button functionality
-   Add loading states during authentication
-   Add error handling and display error messages
-   Redirect to dashboard/home on successful authentication (only if approved)
-   Form validation before submission

#### [MODIFY] [SignUp.jsx](file:///c:/Users/hp/OneDrive/Desktop/stock-x/frontend/src/components/SignUp/SignUp.jsx)

Integrate Firebase authentication into SignUp component:

-   Add form submission handler with Firebase user creation
-   **Create Firestore user profile with "pending" status**
-   Implement Google OAuth button functionality
-   Implement Apple OAuth button functionality
-   Validate password meets all criteria before submission
-   Add loading states during registration
-   Add error handling and display error messages
-   Store additional user data (name, phone) in Firestore user profile
-   **Show "pending approval" message instead of redirect after successful registration**
-   **Automatically sign out user after registration** (they must wait for approval)

#### [MODIFY] [ForgotPassword.jsx](file:///c:/Users/hp/OneDrive/Desktop/stock-x/frontend/src/components/ForgotPassword/ForgotPassword.jsx)

Integrate Firebase password reset email functionality:

-   Add form submission handler to send password reset email
-   Add email validation
-   Add loading states during email sending
-   Add error handling for invalid emails
-   Show success message and navigate to CheckEmail page

#### [MODIFY] [SetPassword.jsx](file:///c:/Users/hp/OneDrive/Desktop/stock-x/frontend/src/components/SetPassword/SetPassword.jsx)

Integrate Firebase password reset confirmation:

-   Extract reset code from URL query parameters
-   Add form submission handler to confirm password reset
-   Validate new password meets all criteria
-   Validate password and confirm password match
-   Add loading states during password reset
-   Add error handling for invalid/expired codes
-   Navigate to PasswordReset success page on completion

---

### Admin Dashboard Components

#### [NEW] [AdminDashboard.jsx](file:///c:/Users/hp/OneDrive/Desktop/stock-x/frontend/src/components/AdminDashboard/AdminDashboard.jsx)

Main admin dashboard component:

-   Display all users in a table/list
-   Show user status badges (pending, approved, rejected, suspended)
-   Filter users by status
-   Search users by name/email
-   Pagination for large user lists
-   Protected route - only accessible by admin users

#### [NEW] [UserManagementTable.jsx](file:///c:/Users/hp/OneDrive/Desktop/stock-x/frontend/src/components/AdminDashboard/UserManagementTable.jsx)

User management table component:

-   Display user information (name, email, phone, status, created date)
-   Action buttons for each user:
    -   **Approve** - Change status to "approved"
    -   **Reject** - Change status to "rejected"
    -   **Suspend** - Change status to "suspended"
    -   **Edit** - Update user information
    -   **Delete** - Remove user from system
-   Confirmation dialogs for destructive actions
-   Real-time updates when user data changes

#### [NEW] [UserEditModal.jsx](file:///c:/Users/hp/OneDrive/Desktop/stock-x/frontend/src/components/AdminDashboard/UserEditModal.jsx)

Modal for editing user information:

-   Form to update user name, email, phone
-   Role selector (user/admin)
-   Status selector (pending/approved/rejected/suspended)
-   Save and cancel buttons
-   Validation before submission

#### [NEW] [PendingApprovals.jsx](file:///c:/Users/hp/OneDrive/Desktop/stock-x/frontend/src/components/AdminDashboard/PendingApprovals.jsx)

Component to show pending user approvals:

-   List of users with "pending" status
-   Quick approve/reject buttons
-   User details preview
-   Notification badge showing count of pending approvals

---

### Admin Routes

#### [NEW] [admin/page.jsx](file:///c:/Users/hp/OneDrive/Desktop/stock-x/frontend/src/app/admin/page.jsx)

Admin dashboard page:

-   Render AdminDashboard component
-   Protected by admin role check
-   Redirect non-admin users to home page

#### [NEW] [admin/users/page.jsx](file:///c:/Users/hp/OneDrive/Desktop/stock-x/frontend/src/app/admin/users/page.jsx)

User management page:

-   Render UserManagementTable component
-   Protected by admin role check

---

### Utility & Helper Functions

#### [NEW] [authHelpers.js](file:///c:/Users/hp/OneDrive/Desktop/stock-x/frontend/src/utils/authHelpers.js)

Helper functions for authentication:

-   `validateEmail(email)` - Email format validation
-   `validatePassword(password)` - Password strength validation
-   `formatAuthError(error)` - Convert Firebase errors to user-friendly messages
-   `extractResetCode(url)` - Extract password reset code from URL

---

### Protected Routes

#### [NEW] [ProtectedRoute.jsx](file:///c:/Users/hp/OneDrive/Desktop/stock-x/frontend/src/components/ProtectedRoute/ProtectedRoute.jsx)

Component to protect routes that require authentication:

-   Check if user is authenticated
-   **Check if user is approved** (status === "approved")
-   Redirect to sign-in page if not authenticated
-   Show "pending approval" message if user is not approved
-   Show loading state while checking authentication
-   Allow access to protected content if authenticated and approved

#### [NEW] [AdminRoute.jsx](file:///c:/Users/hp/OneDrive/Desktop/stock-x/frontend/src/components/AdminRoute/AdminRoute.jsx)

Component to protect admin-only routes:

-   Check if user is authenticated
-   **Check if user has admin role**
-   Redirect to sign-in page if not authenticated
-   Redirect to home page if not admin
-   Show loading state while checking authentication
-   Allow access to admin content if user is admin

---

### Package Dependencies

#### [MODIFY] [package.json](file:///c:/Users/hp/OneDrive/Desktop/stock-x/frontend/package.json)

Add Firebase SDK to project dependencies:

-   Add `firebase` package (latest version)
-   This provides all Firebase services including Authentication

---

## Verification Plan

### Automated Tests

Due to the nature of Firebase authentication requiring actual Firebase project credentials and external service calls, automated unit tests are not included in this initial implementation. However, the following manual verification steps will thoroughly test all functionality.

### Manual Verification

#### 1. Firebase Project Setup Verification

-   Create a new Firebase project in Firebase Console
-   Enable Email/Password authentication in Firebase Console → Authentication → Sign-in method
-   Enable Google OAuth provider in Firebase Console
-   (Optional) Enable Apple OAuth provider if needed
-   **Enable Firestore Database** in Firebase Console → Firestore Database → Create database
-   **Set Firestore to production mode** (we'll add security rules later)
-   Copy Firebase configuration credentials
-   Verify `.env.local` file is created with correct credentials
-   Run `npm run dev` and verify no Firebase initialization errors in console

#### 2. Sign Up Flow Testing

-   Navigate to `/signup` page
-   **Test Email/Password Registration**:
    -   Fill in all form fields (name, email, phone, password)
    -   Verify password validation indicators update in real-time
    -   Submit form with valid data
    -   Verify loading state appears during registration
    -   **Verify "pending approval" message is displayed**
    -   **Verify user is automatically signed out**
    -   Check Firebase Console → Authentication → Users to confirm user was created
    -   **Check Firestore → users collection to confirm user document with status="pending"**
-   **Test Google OAuth**:
    -   Click "Continue with Google" button
    -   Complete Google sign-in flow in popup
    -   Verify successful authentication and redirect
    -   Check Firebase Console to confirm user was created
-   **Test Error Handling**:
    -   Try registering with an already-used email
    -   Verify error message displays correctly
    -   Try registering with weak password
    -   Verify validation prevents submission

#### 3. Sign In Flow Testing (Pending User)

-   Navigate to `/signin` page
-   **Test Sign In with Pending User**:
    -   Enter credentials for user created in step 2 (still pending)
    -   Submit form
    -   Verify loading state appears
    -   **Verify error message: "Your account is pending admin approval"**
    -   **Verify user is NOT redirected** (remains on sign-in page)
-   **Test Google OAuth**:
    -   Click "Continue with Google" button
    -   Verify successful authentication
-   **Test Error Handling**:
    -   Try signing in with incorrect password
    -   Verify error message displays
    -   Try signing in with non-existent email
    -   Verify error message displays

#### 4. Password Reset Flow Testing

-   Navigate to `/forgot-password` page
-   **Test Reset Email**:
    -   Enter valid email address
    -   Submit form
    -   Verify loading state appears
    -   Verify navigation to `/check-email` page
    -   Check email inbox for password reset email from Firebase
-   **Test Password Reset Completion**:
    -   Click the reset link in the email
    -   Verify navigation to `/set-password` with reset code in URL
    -   Enter new password meeting all criteria
    -   Verify password validation indicators work
    -   Submit form
    -   Verify navigation to `/password-reset` success page
    -   Navigate to `/signin` and verify can sign in with new password

#### 5. Authentication State Persistence

-   Sign in to the application
-   Refresh the page
-   Verify user remains signed in (authentication state persists)
-   Close browser and reopen
-   Navigate to the application
-   Verify user remains signed in

#### 6. Sign Out Testing

-   While signed in, trigger sign out functionality
-   Verify user is signed out
-   Verify redirect to sign-in page
-   Try accessing protected routes
-   Verify redirect to sign-in page

#### 7. Admin Dashboard Testing

-   **Manually create an admin user in Firestore**:
    -   Go to Firestore Console → users collection
    -   Find a user document or create a new one
    -   Set `role: "admin"` and `status: "approved"`
-   Sign in with admin credentials
-   Navigate to `/admin` page
-   **Verify admin dashboard loads successfully**
-   **Test User Management**:
    -   View list of all users
    -   Find the pending user from step 2
    -   Click "Approve" button
    -   Verify user status changes to "approved" in Firestore
    -   Verify success message displays

#### 8. Sign In Flow Testing (Approved User)

-   Sign out if signed in
-   Navigate to `/signin` page
-   **Test Sign In with Approved User**:
    -   Enter credentials for user approved in step 7
    -   Submit form
    -   Verify loading state appears
    -   **Verify successful redirect to home/dashboard**
    -   Verify user can access protected routes

#### 9. Admin User Management Testing

-   Sign in as admin
-   Navigate to admin dashboard
-   **Test Update User**:
    -   Click "Edit" on a user
    -   Update user information (name, email, phone)
    -   Save changes
    -   Verify changes are reflected in Firestore
-   **Test Suspend User**:
    -   Click "Suspend" on an approved user
    -   Verify status changes to "suspended"
    -   Sign out and try to sign in as suspended user
    -   Verify error message: "Your account has been suspended"
-   **Test Delete User**:
    -   Click "Delete" on a user
    -   Confirm deletion in dialog
    -   Verify user is removed from Firebase Auth
    -   Verify user document is deleted from Firestore

#### 10. Protected Routes Testing

-   Without signing in, try to access a protected route (e.g., dashboard)
-   Verify redirect to `/signin` page
-   Sign in successfully with approved user
-   Verify can now access protected routes
-   Try to access `/admin` as non-admin user
-   Verify redirect to home page or access denied message

#### 11. Cross-Browser Testing

-   Repeat key flows (sign up, sign in, password reset) in:
    -   Chrome
    -   Firefox
    -   Safari
    -   Edge
-   Verify all functionality works consistently

#### 12. Mobile Responsiveness Testing

-   Test all authentication flows on mobile devices or browser dev tools mobile view
-   Verify OAuth popups work correctly on mobile
-   Verify forms are usable and buttons are clickable

#### 13. Error Recovery Testing

-   Test with network disconnected
-   Verify appropriate error messages display
-   Reconnect network and retry
-   Verify operations complete successfully

---

## Implementation Notes

### Firestore Security Rules

After implementing the system, configure Firestore Security Rules to protect user data:

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

### Initial Admin Setup

To create the first admin user:

1.  **Option 1: Manual Creation in Firestore Console**

    -   Create a user account through the sign-up flow
    -   Go to Firestore Console → users collection
    -   Find the user document
    -   Manually set `role: "admin"` and `status: "approved"`

2.  **Option 2: Cloud Function** (recommended for production)
    -   Create a Firebase Cloud Function that can be called once to promote a user to admin
    -   Requires Firebase CLI and Cloud Functions setup

### Firebase Security Rules (Storage)

If you use Firebase Storage, configure security rules to ensure only authenticated and approved users can access files.

### User Profile Data

Additional user data (name, phone number) will be stored in the Firebase user profile using `updateProfile()`. For more complex user data, consider using Firestore to store user documents.

### Email Verification

This implementation does not include email verification. If you want to require users to verify their email before accessing the application, this can be added as a follow-up enhancement.

### Session Management

Firebase handles session management automatically. Sessions persist across browser refreshes and are stored securely.

### Rate Limiting

Firebase has built-in rate limiting for authentication attempts. No additional configuration needed for basic protection.

---

## Next Steps After Implementation

1. **Configure Email Templates**: Customize the password reset email template in Firebase Console → Authentication → Templates
2. **Set Up Custom Domain**: Configure a custom email sender domain in Firebase Console for branded emails
3. **Add Email Verification**: Implement email verification requirement if needed
4. **Set Up Analytics**: Integrate Firebase Analytics to track authentication events
5. **Implement Social Providers**: Add additional OAuth providers (Facebook, Twitter, etc.) if needed
6. **Add Two-Factor Authentication**: Implement 2FA for enhanced security
7. **Configure Security Rules**: Set up Firestore/Storage security rules based on authentication state
