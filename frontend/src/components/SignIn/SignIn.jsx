"use client";

import React, { useState } from "react";
import Link from "next/link";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import "./SignIn.scss";

const SignIn = () => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="sign-in" id="sign-in">
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
                                <h3>Sign in</h3>
                                <p>Access your personalized trading intelligence</p>
                            </div>
                            <div className="content-items flex flex-col gap-6 w-full">
                                <div className="item-1 flex flex-col gap-6">
                                    <div className="social-button-groups flex flex-col gap-3">
                                        <div className="google-btn flex justify-center items-center gap-3">
                                            <img src="/Svg/google.svg" alt="google" />
                                            <p>Continue with Google</p>
                                        </div>
                                        <div className="apple-btn flex justify-center items-center gap-3">
                                            <img src="/Svg/apple.svg" alt="apple" />
                                            <p>Continue with Apple</p>
                                        </div>
                                    </div>
                                    <div className="divider flex justify-center items-center gap-2">
                                        <div className="line-1"></div>
                                        <p>or</p>
                                        <div className="line-2"></div>
                                    </div>
                                </div>

                                {/* ------ item-1 end ------ */}
                                <div className="item-2 flex flex-col gap-5">
                                    <div className="form-group flex flex-col gap-2">
                                        <div className="label-wrapper flex justify-between">
                                            <label htmlFor="">
                                                Email <span>*</span>
                                            </label>
                                        </div>
                                        <div className="input-wrapper">
                                            <input type="text" name="email" placeholder="Enter your email" required />
                                        </div>
                                    </div>
                                    <div className="form-group flex flex-col gap-2">
                                        <div className="label-wrapper flex justify-between">
                                            <label htmlFor="">
                                                Password <span>*</span>
                                            </label>
                                            <Link href="/forgot-password">Forgot password</Link>
                                        </div>
                                        <div className="input-wrapper">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                placeholder="Enter your password"
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
                                    <button type="submit">
                                        <span data-text="Sign in">Sign in</span>
                                    </button>
                                    <h6>
                                        Don't have an account?{" "}
                                        <span>
                                            <Link href="/signup">Sign Up</Link>
                                        </span>
                                    </h6>
                                </div>
                                {/* ------ item-2 end ------ */}
                                <div className="item-3 flex flex-col gap-2">
                                    <div className="divider"></div>
                                    <p>By signing in, you accept our Terms of Use & Privacy Policy.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="image-section">
                    <img src="/Images/Authentication/Sign-In.webp" alt="" />
                </div>
            </div>
        </div>
    );
};

export default SignIn;
