"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendPasswordReset } from "@/services/authService";
import { validateEmail } from "@/utils/authHelpers";
import "./ForgotPassword.scss";

const ForgotPassword = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!email) {
            setError("Please enter your email address");
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);

        try {
            // Get the base URL (e.g., http://localhost:3000)
            const baseUrl = window.location.origin;
            const redirectUrl = `${baseUrl}/set-password`;

            const result = await sendPasswordReset(email, redirectUrl);

            if (result.success) {
                // Navigate to check email page on success with email as query param
                router.push(`/check-email?email=${encodeURIComponent(email)}`);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setEmail(e.target.value);
        // Clear error when user starts typing
        if (error) setError("");
    };

    return (
        <div id="forgot-password" className="forgot-password">
            <div className="container min-h-screen w-full mx-auto flex justify-center items-center ">
                <div className="grid-style">
                    <img src="/Svg/grid-style.svg" alt="Grid Style" />
                </div>
                <div className="content flex flex-col items-center justify-center gap-8">
                    <div className="item-1 flex flex-col items-center justify-center gap-6 w-full">
                        <div className="icon flex items-center justify-center">
                            <img src="/Svg/forgot-key.svg" alt="Forgot Key" />
                        </div>
                        <div className="header-text-content flex flex-col items-center justify-center gap-3">
                            <h2>Forgot Password</h2>
                            <p>No worries, we'll send you reset instructions.</p>
                        </div>
                    </div>
                    <form
                        onSubmit={handleForgotPassword}
                        className="item-2 flex flex-col items-center justify-center gap-6 w-full"
                    >
                        {error && <div className="error-msg">{error}</div>}

                        <div className="form w-full">
                            <div className="form-group flex flex-col items-start justify-center gap-2">
                                <label htmlFor="email">
                                    Email <span>*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>
                        <div className="button w-full">
                            <button
                                type="submit"
                                disabled={loading}
                                style={{ cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
                            >
                                <span data-text={loading ? "Sending..." : "Reset Password"}>
                                    {loading ? "Sending..." : "Reset Password"}
                                </span>
                            </button>
                        </div>
                    </form>
                    <div className="item-3">
                        <div className="back-nav flex items-center justify-center gap-2">
                            <div className="icon">
                                <img src="/Svg/left-arrow.svg" alt="Left Arrow" />
                            </div>
                            <Link href="/signin">Back to Sign In</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
