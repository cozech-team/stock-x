import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

/**
 * API Route: Send email notification to all admins about new user signup
 * POST /api/notify-admin
 */
export async function POST(request) {
    try {
        const { uid, email, displayName, phoneNumber, timestamp, adminEmails } = await request.json();

        // Validate required fields
        if (!uid || !email || !displayName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate admin emails (received from client)
        if (!adminEmails || adminEmails.length === 0) {
            console.warn("No admins found to notify");
            return NextResponse.json({ message: "No admins to notify" }, { status: 200 });
        }

        // Configure nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // Format signup date
        const signupDate = new Date(timestamp).toLocaleString("en-US", {
            dateStyle: "full",
            timeStyle: "short",
        });

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: adminEmails.join(", "),
            subject: "🔔 New User Signup - Pending Approval",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .user-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #eee; }
                        .info-label { font-weight: bold; width: 120px; color: #667eea; }
                        .info-value { flex: 1; }
                        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 New User Signup</h1>
                            <p>A new user has registered and is awaiting approval</p>
                        </div>
                        <div class="content">
                            <div class="user-info">
                                <div class="info-row">
                                    <div class="info-label">Name:</div>
                                    <div class="info-value">${displayName}</div>
                                </div>
                                <div class="info-row">
                                    <div class="info-label">Email:</div>
                                    <div class="info-value">${email}</div>
                                </div>
                                <div class="info-row">
                                    <div class="info-label">Phone:</div>
                                    <div class="info-value">${phoneNumber || "Not provided"}</div>
                                </div>
                                <div class="info-row" style="border-bottom: none;">
                                    <div class="info-label">Signup Date:</div>
                                    <div class="info-value">${signupDate}</div>
                                </div>
                            </div>
                            <p>Please review this user and approve or reject their account.</p>
                            <center>
                                <a href="${
                                    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                                }/admin" class="button">
                                    Go to Admin Dashboard
                                </a>
                            </center>
                        </div>
                        <div class="footer">
                            <p>This is an automated notification from StockX</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
New User Signup - Pending Approval

A new user has signed up and is awaiting approval:

Name: ${displayName}
Email: ${email}
Phone: ${phoneNumber || "Not provided"}
Signup Date: ${signupDate}

Please review and approve/reject this user in the admin dashboard.

Admin Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin
            `.trim(),
        };

        // Send email
        await transporter.sendMail(mailOptions);

        return NextResponse.json({
            success: true,
            message: `Notification sent to ${adminEmails.length} admin(s)`,
        });
    } catch (error) {
        console.error("Error sending admin notification:", error);
        return NextResponse.json({ error: error.message || "Failed to send notification" }, { status: 500 });
    }
}
