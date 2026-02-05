import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

/**
 * API Route: Delete user completely from Firebase Auth and Firestore
 * POST /api/delete-user
 */
export async function POST(request) {
    try {
        const { uid, adminUid } = await request.json();

        // Validate required fields
        if (!uid || !adminUid) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Prevent admin from deleting themselves
        if (uid === adminUid) {
            return NextResponse.json({ error: "You cannot delete your own account" }, { status: 403 });
        }

        // Verify the requesting user is a superadmin
        const adminDoc = await adminDb.collection("users").doc(adminUid).get();
        if (!adminDoc.exists || adminDoc.data().role !== "superadmin") {
            return NextResponse.json({ error: "Unauthorized: Superadmin access required" }, { status: 403 });
        }

        // Delete from Firestore first
        await adminDb.collection("users").doc(uid).delete();
        console.log(`Deleted user ${uid} from Firestore`);

        // Delete from Firebase Auth
        try {
            await adminAuth.deleteUser(uid);
            console.log(`Deleted user ${uid} from Firebase Auth`);
        } catch (authError) {
            // If user doesn't exist in Auth, that's okay
            if (authError.code === "auth/user-not-found") {
                console.log(`User ${uid} not found in Firebase Auth (already deleted or never existed)`);
            } else {
                throw authError;
            }
        }

        return NextResponse.json({
            success: true,
            message: "User deleted successfully from both Firestore and Firebase Auth",
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
    }
}
