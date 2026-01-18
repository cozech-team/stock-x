/**
 * Email Service
 * Handles sending email notifications to admins
 */

/**
 * Send notification email to all admins about new user signup
 * Admin emails are fetched server-side using Firebase Admin SDK
 * @param {Object} userData - New user's information
 * @param {string} userData.uid - User ID
 * @param {string} userData.email - User email
 * @param {string} userData.displayName - User display name
 * @param {string} userData.phoneNumber - User phone number
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendAdminNotificationEmail = async (userData) => {
    try {
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
