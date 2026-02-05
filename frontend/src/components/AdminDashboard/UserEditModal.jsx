"use client";

import React, { useState, useEffect } from "react";
import Spinner from "../Spinner/Spinner";
import { PACKAGE_OPTIONS } from "../../constants/packages";
import "./UserEditModal.scss";

const UserEditModal = ({ user, isOpen, onClose, onSave, isSuperAdmin }) => {
    const [formData, setFormData] = useState({
        displayName: "",
        email: "",
        phoneNumber: "",
        role: "user",
        status: "pending",
        package: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
                role: user.role || "user",
                status: user.status || "pending",
                package: user.package || "",
            });
        }
    }, [user]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await onSave(user.uid || user.id, formData);
            onClose();
        } catch (err) {
            setError(err.message || "Failed to update user");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container" onWheel={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit User</h2>
                    <button className="close-btn" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="error-banner">{error}</div>}

                    <div className="form-group">
                        <label>Display Name</label>
                        <input
                            type="text"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Role</label>
                            <select name="role" value={formData.role} onChange={handleInputChange} disabled={!isSuperAdmin}>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                {isSuperAdmin && <option value="superadmin">Superadmin</option>}
                                {!isSuperAdmin && formData.role === "superadmin" && (
                                    <option value="superadmin">Superadmin</option>
                                )}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <select name="status" value={formData.status} onChange={handleInputChange}>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                    </div>

                    {formData.role === "user" && (
                        <div className="form-group">
                            <label>Subscription Package</label>
                            <select name="package" value={formData.package} onChange={handleInputChange}>
                                {PACKAGE_OPTIONS.map((pkg) => (
                                    <option key={pkg.value} value={pkg.value}>
                                        {pkg.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? <Spinner size="sm" /> : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserEditModal;
