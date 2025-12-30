"use client";

import React, { useEffect, useState } from "react";
import "./ThemeToggle.scss";

const ThemeToggle = () => {
    const [theme, setTheme] = useState("dark");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
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
