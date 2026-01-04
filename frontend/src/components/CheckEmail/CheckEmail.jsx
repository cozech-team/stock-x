import React from "react";
import Link from "next/link";
import "./CheckEmail.scss";

const CheckEmail = () => {
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
                            <p>We sent a password reset link to user@stock-x.com</p>
                        </div>
                    </div>
                    <div className="item-2 flex flex-col items-center justify-center gap-6 w-full">
                        <div className="button w-full">
                            <button type="button">
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

export default CheckEmail;
