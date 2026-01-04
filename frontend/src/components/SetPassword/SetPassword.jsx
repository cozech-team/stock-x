"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./SetPassword.scss";

const SetPassword = () => {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [requirements, setRequirements] = useState({
        minLength: false,
        specialChar: false,
        hasNumber: false,
        hasCapital: false,
    });

    const validatePassword = (value) => {
        setRequirements({
            minLength: value.length >= 8,
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
            hasNumber: /\d/.test(value),
            hasCapital: /[A-Z]/.test(value),
        });
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        validatePassword(value);
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        // Add password reset logic here
        router.push("/signin");
    };

    return (
        <div id="set-password" className="set-password">
            <div className="container min-h-screen w-full mx-auto flex justify-center items-center ">
                <div className="grid-style">
                    <img src="/Svg/grid-style.svg" alt="Grid Style" />
                </div>
                <div className="content flex flex-col items-center justify-center gap-8">
                    <div className="item-1 flex flex-col items-center justify-center gap-6 w-full">
                        <div className="icon flex items-center justify-center">
                            <img src="/Svg/lock-icon.svg" alt="Lock Icon" />
                        </div>
                        <div className="header-text-content flex flex-col items-center justify-center gap-3">
                            <h2>Set new password</h2>
                            <p>Your new password must be different to previously used passwords.</p>
                        </div>
                    </div>
                    <div className="item-2 flex flex-col items-center justify-center gap-6 w-full">
                        <form className="form w-full" onSubmit={handleResetPassword}>
                            <div className="form-group flex flex-col items-start justify-center gap-2">
                                <label htmlFor="password">
                                    Password <span>*</span>
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                    <svg
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="eye-icon"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        {showPassword ? (
                                            <>
                                                <path
                                                    d="M8.82 8.82C8.50022 9.14009 8.31982 9.57423 8.31982 10.0275C8.31982 10.4808 8.50022 10.9149 8.82 11.235C9.14009 11.5548 9.57423 11.7352 10.0275 11.7352C10.4808 11.7352 10.9149 11.5548 11.235 11.235M8.82 8.82C9.14009 8.50022 9.57423 8.31982 10.0275 8.31982C10.4808 8.31982 10.9149 8.50022 11.235 8.82M8.82 8.82L11.235 11.235M15.8333 10C14.1667 13.3333 12.5 15 10 15C7.5 15 5.83333 13.3333 4.16667 10C5.83333 6.66667 7.5 5 10 5C12.5 5 14.1667 6.66667 15.8333 10Z"
                                                    stroke="#79869F"
                                                    strokeWidth="1.66667"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <line
                                                    x1="3"
                                                    y1="3"
                                                    x2="17"
                                                    y2="17"
                                                    stroke="#79869F"
                                                    strokeWidth="1.66667"
                                                    strokeLinecap="round"
                                                />
                                            </>
                                        ) : (
                                            <path
                                                d="M2.5 10C2.5 10 5 4.16667 10 4.16667C15 4.16667 17.5 10 17.5 10C17.5 10 15 15.8333 10 15.8333C5 15.8333 2.5 10 2.5 10Z"
                                                stroke="#79869F"
                                                strokeWidth="1.66667"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        )}
                                        <path
                                            d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                                            stroke="#79869F"
                                            strokeWidth="1.66667"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="form-group flex flex-col items-start justify-center gap-2">
                                <label htmlFor="confirm-password">
                                    Confirm password <span>*</span>
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirm-password"
                                        name="confirm-password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <svg
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="eye-icon"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        {showConfirmPassword ? (
                                            <>
                                                <path
                                                    d="M8.82 8.82C8.50022 9.14009 8.31982 9.57423 8.31982 10.0275C8.31982 10.4808 8.50022 10.9149 8.82 11.235C9.14009 11.5548 9.57423 11.7352 10.0275 11.7352C10.4808 11.7352 10.9149 11.5548 11.235 11.235M8.82 8.82C9.14009 8.50022 9.57423 8.31982 10.0275 8.31982C10.4808 8.31982 10.9149 8.50022 11.235 8.82M8.82 8.82L11.235 11.235M15.8333 10C14.1667 13.3333 12.5 15 10 15C7.5 15 5.83333 13.3333 4.16667 10C5.83333 6.66667 7.5 5 10 5C12.5 5 14.1667 6.66667 15.8333 10Z"
                                                    stroke="#79869F"
                                                    strokeWidth="1.66667"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <line
                                                    x1="3"
                                                    y1="3"
                                                    x2="17"
                                                    y2="17"
                                                    stroke="#79869F"
                                                    strokeWidth="1.66667"
                                                    strokeLinecap="round"
                                                />
                                            </>
                                        ) : (
                                            <path
                                                d="M2.5 10C2.5 10 5 4.16667 10 4.16667C15 4.16667 17.5 10 17.5 10C17.5 10 15 15.8333 10 15.8333C5 15.8333 2.5 10 2.5 10Z"
                                                stroke="#79869F"
                                                strokeWidth="1.66667"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        )}
                                        <path
                                            d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                                            stroke="#79869F"
                                            strokeWidth="1.66667"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="password-requirements">
                                <p className={`requirement ${requirements.minLength ? "met" : ""}`}>
                                    Must be at least 8 characters
                                </p>
                                <p className={`requirement ${requirements.specialChar ? "met" : ""}`}>
                                    Must contain one special character
                                </p>
                                <p className={`requirement ${requirements.hasNumber ? "met" : ""}`}>
                                    Must contain one number
                                </p>
                                <p className={`requirement ${requirements.hasCapital ? "met" : ""}`}>
                                    Must contain one capital letter
                                </p>
                            </div>
                            <div className="button w-full">
                                <button type="submit">
                                    <span data-text="Reset password">Reset password</span>
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="item-3">
                        <div className="back-nav flex items-center justify-center gap-2">
                            <div className="icon">
                                <img src="/Svg/left-arrow.svg" alt="Left Arrow" />
                            </div>
                            <Link href="/signin">Back to log in</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetPassword;
