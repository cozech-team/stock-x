import React from "react";
import Link from "next/link";
import "./ForgotPassword.scss";

const ForgotPassword = () => {
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
                            <p>No worries, we’ll send you reset instructions.</p>
                        </div>
                    </div>
                    <div className="item-2 flex flex-col items-center justify-center gap-6 w-full">
                        <div className="form w-full">
                            <div className="form-group flex flex-col items-start justify-center gap-2">
                                <label htmlFor="email">
                                    Email <span>*</span>
                                </label>
                                <input type="email" id="email" name="email" placeholder="Enter your email" required />
                            </div>
                        </div>
                        <div className="button w-full">
                            <button type="submit">
                                <span data-text="Reset Password">Reset Password</span>
                            </button>
                        </div>
                    </div>
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
