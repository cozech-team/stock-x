"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { signUpWithEmail, signInWithGoogle, signInWithApple } from "@/services/authService";
import { validateEmail, isPasswordValid } from "@/utils/authHelpers";
import "./SignUp.scss";

const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const router = useRouter();

    // Password validation criteria
    const [passwordCriteria, setPasswordCriteria] = useState({
        minLength: false,
        hasSpecialChar: false,
        hasNumber: false,
        hasCapital: false,
    });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (error) setError("");
    };

    // Validate password on change
    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);

        setPasswordCriteria({
            minLength: value.length >= 8,
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
            hasNumber: /\d/.test(value),
            hasCapital: /[A-Z]/.test(value),
        });

        // Clear error when user starts typing
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        // Validation
        if (!formData.name || !formData.email || !formData.phone || !password) {
            setError("Please fill in all fields");
            return;
        }

        if (!validateEmail(formData.email)) {
            setError("Please enter a valid email address");
            return;
        }

        if (!isPasswordValid(password)) {
            setError("Password must meet all requirements");
            return;
        }

        setLoading(true);

        try {
            const result = await signUpWithEmail(formData.email, password, formData.name, formData.phone);

            if (result.success) {
                // Show success message
                setSuccess(true);
                setError("");
                // Clear form
                setFormData({ name: "", email: "", phone: "" });
                setPassword("");
                setPasswordCriteria({
                    minLength: false,
                    hasSpecialChar: false,
                    hasNumber: false,
                    hasCapital: false,
                });
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setError("");
        setSuccess(false);
        setLoading(true);

        try {
            const result = await signInWithGoogle();

            if (result.success) {
                router.push("/");
            } else {
                // This will be the pending approval message for new users
                setSuccess(true);
                setError("");
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAppleSignUp = async () => {
        setError("");
        setSuccess(false);
        setLoading(true);

        try {
            const result = await signInWithApple();

            if (result.success) {
                router.push("/");
            } else {
                // This will be the pending approval message for new users
                setSuccess(true);
                setError("");
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sign-up" id="sign-up">
            <div className="container grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full mx-auto">
                <div className="form-section flex justify-center items-center">
                    <div className="form-container flex flex-col items-center w-full h-full">
                        <div className="nav-section flex justify-between items-center w-full">
                            <div className="logo">
                                <img src="/Svg/logo.svg" alt="logo" />
                            </div>
                            <ThemeToggle />
                        </div>
                        <div className="content-wrapper flex flex-col justify-center items-start gap-8 flex-1 w-full ">
                            <div className="text-items flex flex-col justify-center items-start gap-3 w-full ">
                                <h3>Create your account</h3>
                                <p>Start your journey to smarter trading decisions</p>
                            </div>
                            <div className="content-items flex flex-col gap-6 w-full">
                                <div className="item-1 flex flex-col gap-6">
                                    <div className="social-button-groups flex flex-col gap-3">
                                        <div
                                            className="google-btn flex justify-center items-center gap-3"
                                            onClick={handleGoogleSignUp}
                                            style={{
                                                cursor: loading ? "not-allowed" : "pointer",
                                                opacity: loading ? 0.6 : 1,
                                            }}
                                        >
                                            <img src="/Svg/google.svg" alt="google" />
                                            <p className="btn-text">{loading ? "Signing up..." : "Continue with Google"}</p>
                                        </div>
                                        <div
                                            className="apple-btn flex justify-center items-center gap-3"
                                            onClick={handleAppleSignUp}
                                            style={{
                                                cursor: loading ? "not-allowed" : "pointer",
                                                opacity: loading ? 0.6 : 1,
                                            }}
                                        >
                                            <img src="/Svg/apple.svg" alt="apple" />
                                            <p className="btn-text">{loading ? "Signing up..." : "Continue with Apple"}</p>
                                        </div>
                                    </div>
                                    <div className="divider flex justify-center items-center gap-2">
                                        <div className="line-1"></div>
                                        <p>or</p>
                                        <div className="line-2"></div>
                                    </div>
                                </div>

                                {/* ------ item-1 end ------ */}
                                <form onSubmit={handleSubmit} className="item-2 flex flex-col gap-5">
                                    {error && <div className="error-msg">{error}</div>}

                                    {success && (
                                        <div className="success-msg">
                                            🎉 Account created successfully! Your account is pending admin approval. You'll
                                            be able to sign in once an admin approves your account.
                                        </div>
                                    )}

                                    <div className="form-group flex flex-col gap-2">
                                        <div className="label-wrapper flex justify-between">
                                            <label htmlFor="name">
                                                Name <span>*</span>
                                            </label>
                                        </div>
                                        <div className="input-wrapper">
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                placeholder="Enter your name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                disabled={loading}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group flex flex-col gap-2">
                                        <div className="label-wrapper flex justify-between">
                                            <label htmlFor="email">
                                                Email <span>*</span>
                                            </label>
                                        </div>
                                        <div className="input-wrapper">
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                placeholder="Enter your email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                disabled={loading}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group flex flex-col gap-2">
                                        <div className="label-wrapper flex justify-between">
                                            <label htmlFor="phone">
                                                Phone number <span>*</span>
                                            </label>
                                        </div>
                                        <div className="input-wrapper">
                                            <input
                                                type="tel"
                                                name="phone"
                                                id="phone"
                                                placeholder="Enter your phone number"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                disabled={loading}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group flex flex-col gap-2">
                                        <div className="label-wrapper flex justify-between">
                                            <label htmlFor="password">
                                                Password <span>*</span>
                                            </label>
                                        </div>
                                        <div className="input-wrapper">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                id="password"
                                                placeholder="Create a password"
                                                value={password}
                                                onChange={handlePasswordChange}
                                                disabled={loading}
                                                required
                                            />
                                            <svg
                                                className="toggle-icon"
                                                onClick={togglePasswordVisibility}
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                style={{ cursor: "pointer" }}
                                            >
                                                {showPassword ? (
                                                    // Eye icon (visible)
                                                    <>
                                                        <path
                                                            d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="3"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </>
                                                ) : (
                                                    // Eye-off icon (hidden)
                                                    <>
                                                        <path
                                                            d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12C1 12 2.24 9.68 4.24 7.68M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12C23 12 22.393 13.1 21.5 14.5M14.12 14.12A3 3 0 1 1 9.88 9.88"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                        <path
                                                            d="M1 1L23 23"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </>
                                                )}
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="password-requirements flex flex-col gap-1">
                                        <p className={`requirement ${passwordCriteria.minLength ? "met" : ""}`}>
                                            Must be at least 8 characters
                                        </p>
                                        <p className={`requirement ${passwordCriteria.hasSpecialChar ? "met" : ""}`}>
                                            Must contain one special character
                                        </p>
                                        <p className={`requirement ${passwordCriteria.hasNumber ? "met" : ""}`}>
                                            Must contain one number
                                        </p>
                                        <p className={`requirement ${passwordCriteria.hasCapital ? "met" : ""}`}>
                                            Must contain one capital letter
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{ cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
                                    >
                                        <span data-text={loading ? "Creating account..." : "Create account"}>
                                            {loading ? "Creating account..." : "Create account"}
                                        </span>
                                    </button>
                                    <h6>
                                        Already have an account?{" "}
                                        <span>
                                            <Link href="/signin">Sign in</Link>
                                        </span>
                                    </h6>
                                </form>
                                {/* ------ item-2 end ------ */}
                                <div className="item-3 flex flex-col gap-2">
                                    <div className="divider"></div>
                                    <p>By signing up, you accept our Terms of Use & Privacy Policy.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="image-section">
                    <img src="/Images/Authentication/Sign-Up.webp" alt="" />
                </div>
            </div>
        </div>
    );
};

export default SignUp;
