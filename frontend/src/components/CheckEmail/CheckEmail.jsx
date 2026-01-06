"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Spinner from "../Spinner/Spinner";
import "./CheckEmail.scss";

const CheckEmailContent = () => {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "user@stock-x.com";

    const handleOpenEmailApp = () => {
        // Open Gmail in a new tab
        window.open("https://mail.google.com/", "_blank");
    };

    return (
        <div id="check-email" className="check-email">
            <div className="container min-h-screen w-full mx-auto flex justify-center items-center ">
                <div className="grid-style">
                    <img src="/Svg/grid-style.svg" alt="Grid Style" />
                </div>
                <div className="content flex flex-col items-center justify-center gap-8">
                    <div className="item-1 flex flex-col items-center justify-center gap-6 w-full">
                        <div className="icon flex items-center justify-center">
                            <img src="/Svg/email-icon.svg" alt="Email Icon" />
                        </div>
                        <div className="header-text-content flex flex-col items-center justify-center gap-3">
                            <h2>Check your email</h2>
                            <p>
                                We sent a password reset link to <strong>{email}</strong>
                            </p>
                        </div>
                    </div>
                    <div className="item-2 flex flex-col items-center justify-center gap-6 w-full">
                        <div className="button w-full">
                            <button type="button" onClick={handleOpenEmailApp}>
                                <span data-text="Open email app">Open email app</span>
                            </button>
                        </div>
                        <div className="resend-text">
                            <p>
                                Didn't receive the email? <Link href="/forgot-password">Click to resend</Link>
                            </p>
                        </div>
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

const CheckEmail = () => {
    return (
        <Suspense fallback={<Spinner size="lg" color="gold" className="full-page" />}>
            <CheckEmailContent />
        </Suspense>
    );
};

export default CheckEmail;
