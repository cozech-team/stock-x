"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./PasswordReset.scss";

const PasswordReset = () => {
    const router = useRouter();

    const handleContinue = () => {
        router.push("/signin");
    };

    return (
        <div id="password-reset" className="password-reset">
            <div className="container min-h-screen w-full mx-auto flex justify-center items-center ">
                <div className="grid-style">
                    <img src="/Svg/grid-style.svg" alt="Grid Style" />
                </div>
                <div className="content flex flex-col items-center justify-center gap-8">
                    <div className="item-1 flex flex-col items-center justify-center gap-6 w-full">
                        <div className="icon flex items-center justify-center">
                            <img src="/Svg/check-circle.svg" alt="Check Circle" />
                        </div>
                        <div className="header-text-content flex flex-col items-center justify-center gap-3">
                            <h2>Password reset</h2>
                            <p>Your password has been successfully reset. Click below to log in magically.</p>
                        </div>
                    </div>
                    <div className="item-2 flex flex-col items-center justify-center gap-6 w-full">
                        <div className="button w-full">
                            <button type="button" onClick={handleContinue}>
                                <span data-text="Continue">Continue</span>
                            </button>
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

export default PasswordReset;
