"use client";

import React, { useEffect, useState } from "react";
import "./ThemeToggle.scss";

const ThemeToggle = () => {
    const [theme, setTheme] = useState("dark");

    useEffect(() => {
        // Add transitioning class to document
        document.documentElement.classList.add("theme-transitioning");
        document.documentElement.setAttribute("data-theme", theme);

        // Remove transitioning class after transition completes
        const timeout = setTimeout(() => {
            document.documentElement.classList.remove("theme-transitioning");
        }, 500);

        return () => clearTimeout(timeout);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return (
        <div className="theme-toggle">
            <p className={theme === "light" ? "active" : ""}>Light</p>

            <div className="toggle-pill" onClick={toggleTheme}>
                <div className={`circle ${theme === "dark" ? "dark" : ""}`} />
            </div>

            <p className={theme === "dark" ? "active" : ""}>Dark</p>
        </div>
    );
};

export default ThemeToggle;
