"use client";

import React, { useEffect, useState } from "react";
import "./ThemeToggle.scss";

const ThemeToggle = () => {
    const [theme, setTheme] = useState(null);

    // Read theme once on mount
    useEffect(() => {
        const storedTheme = localStorage.getItem("theme") || document.documentElement.getAttribute("data-theme") || "dark";

        setTheme(storedTheme);
        document.documentElement.setAttribute("data-theme", storedTheme);
    }, []);

    // Apply theme changes
    useEffect(() => {
        if (!theme) return;

        document.documentElement.classList.add("theme-transitioning");
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);

        const timeout = setTimeout(() => {
            document.documentElement.classList.remove("theme-transitioning");
        }, 300);

        return () => clearTimeout(timeout);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    if (!theme) return null; // prevents hydration flicker

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
