/**
 * Email Service
 * Handles sending email notifications to admins
 */

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

/**
 * Get all admin email addresses from Firestore
 * @returns {Promise<string[]>} Array of admin email addresses
 */
const getAdminEmails = async () => {
    try {
        const adminsRef = collection(db, "users");
        const adminQuery = query(adminsRef, where("role", "==", "admin"));
        const adminSnapshot = await getDocs(adminQuery);

        if (adminSnapshot.empty) {
            console.warn("No admins found to notify");
            return [];
        }

        return adminSnapshot.docs.map((doc) => doc.data().email);
    } catch (error) {
        console.error("Error fetching admin emails:", error);
        return [];
    }
};

/**
 * Send notification email to all admins about new user signup
 * @param {Object} userData - New user's information
 * @param {string} userData.uid - User ID
 * @param {string} userData.email - User email
 * @param {string} userData.displayName - User display name
 * @param {string} userData.phoneNumber - User phone number
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendAdminNotificationEmail = async (userData) => {
    try {
        // Fetch admin emails client-side (avoids server-side Firestore permission issues)
        const adminEmails = await getAdminEmails();

        if (adminEmails.length === 0) {
            console.warn("No admin emails found, skipping notification");
            return {
                success: false,
                error: "No admins to notify",
            };
        }

        const response = await fetch("/api/notify-admin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uid: userData.uid,
                email: userData.email,
                displayName: userData.displayName,
                phoneNumber: userData.phoneNumber,
                timestamp: new Date().toISOString(),
                adminEmails, // Pass admin emails from client
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Failed to send admin notification:", result.error);
            return {
                success: false,
                error: result.error || "Failed to send notification",
            };
        }

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error sending admin notification:", error);
        // Don't throw error - we don't want to block user signup if email fails
        return {
            success: false,
            error: error.message,
        };
    }
};
