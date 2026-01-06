import React from "react";
import "./Spinner.scss";

const Spinner = ({ size = "md", color = "primary", className = "" }) => {
    return (
        <div className={`spinner-container ${size} ${color} ${className}`}>
            <div className="spinner"></div>
        </div>
    );
};

export default Spinner;
