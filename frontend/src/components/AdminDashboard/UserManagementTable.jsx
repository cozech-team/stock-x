"use client";

import React, { useState, useEffect } from "react";
import {
    PACKAGE_OPTIONS,
    getPackageLabel,
    getRemainingTimeMs,
    isPackageExpired,
    formatRemainingTime,
} from "../../constants/packages";

const UserManagementTable = ({
    users,
    onApprove,
    onReject,
    onSuspend,
    onDelete,
    onEdit,
    currentPage,
    totalPages,
    onPageChange,
    isSuperAdmin,
}) => {
    if (users.length === 0) {
        return (
            <div className="no-users">
                <p>No users found matching the criteria.</p>
            </div>
        );
    }

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    // State to track selected packages for each user
    const [selectedPackages, setSelectedPackages] = useState({});
    // State to force re-render for live countdown
    const [, setTick] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setTick((t) => t + 1);
        }, 60000); // Update every minute for production
        return () => clearInterval(timer);
    }, []);

    const handlePackageChange = (userId, packageValue) => {
        setSelectedPackages((prev) => ({
            ...prev,
            [userId]: packageValue,
        }));
    };

    const handleApproveClick = (user) => {
        const isUserAdmin = user.role === "admin" || user.role === "superadmin";
        const packageType = selectedPackages[user.uid || user.id] || user.package;
        const isReactivating = user.status === "suspended";

        if (!isUserAdmin && !packageType) {
            alert(`Please select a package before ${isReactivating ? "re-activating" : "approving"}.`);
            return;
        }

        if (isUserAdmin) {
            onApprove(user.uid || user.id, null);
        } else {
            const packageData = PACKAGE_OPTIONS.find((p) => p.value === packageType);
            onApprove(user.uid || user.id, { type: packageData.value, days: packageData.days });
        }
    };

    return (
        <div className="user-table-wrapper">
            <table className="user-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Package</th>
                        <th>Status</th>
                        <th>Joined At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.uid || user.id}>
                            <td className="user-info">
                                <div className="avatar">
                                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : "?"}
                                </div>
                                <div className="user-name-wrapper">
                                    <span>{user.displayName || "Anonymous"}</span>
                                    {(user.role === "admin" || user.role === "superadmin") && (
                                        <span className="badge admin-badge">
                                            {user.role === "superadmin" ? "Superadmin" : "Admin"}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td>{user.email}</td>
                            <td>
                                {user.role !== "admin" && user.role !== "superadmin" ? (
                                    user.status === "pending" || user.status === "suspended" ? (
                                        <div className="package-edit-cell">
                                            <select
                                                className="package-select"
                                                value={selectedPackages[user.uid || user.id] || user.package || ""}
                                                onChange={(e) => handlePackageChange(user.uid || user.id, e.target.value)}
                                            >
                                                {!user.package && <option value="">Select Package</option>}
                                                {PACKAGE_OPTIONS.map((pkg) => (
                                                    <option key={pkg.value} value={pkg.value}>
                                                        {pkg.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {user.status === "suspended" && user.package && (
                                                <div className="current-pkg-note">
                                                    Current: {getPackageLabel(user.package)}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="package-info-display">
                                            <span className="badge package-badge">
                                                {user.package ? getPackageLabel(user.package) : "N/A"}
                                            </span>
                                            {user.package && (
                                                <div
                                                    className={`remaining-days ${isPackageExpired(user.packageEndDate) ? "expired" : getRemainingTimeMs(user.packageEndDate) <= 1000 * 60 * 60 * 24 * 2 ? "warning" : ""}`}
                                                >
                                                    {formatRemainingTime(user.packageEndDate)}
                                                </div>
                                            )}
                                        </div>
                                    )
                                ) : (
                                    <span className="text-muted">N/A</span>
                                )}
                            </td>
                            <td>
                                <span className={`badge status ${user.status}`}>{user.status}</span>
                            </td>
                            <td>{formatDate(user.createdAt)}</td>
                            <td className="actions">
                                <div className="actions-wrapper">
                                    {user.status === "pending" && (
                                        <>
                                            <button
                                                className="btn approve"
                                                onClick={() => handleApproveClick(user)}
                                                title="Approve User"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="btn reject"
                                                onClick={() => onReject(user.uid || user.id)}
                                                title="Reject User"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {user.status === "approved" && (
                                        <button
                                            className="btn suspend"
                                            onClick={() => onSuspend(user.uid || user.id)}
                                            title="Suspend User"
                                        >
                                            Suspend
                                        </button>
                                    )}
                                    {user.status === "suspended" && (
                                        <button
                                            className="btn approve"
                                            onClick={() => handleApproveClick(user)}
                                            title="Re-approve User"
                                        >
                                            Re-activate
                                        </button>
                                    )}
                                    <button className="btn edit" onClick={() => onEdit(user)} title="Edit User">
                                        Edit
                                    </button>
                                    {isSuperAdmin && (
                                        <button
                                            className="btn delete"
                                            onClick={() => onDelete(user)}
                                            title="Delete User Permanently"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="page-btn prev"
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(currentPage - 1)}
                    >
                        &laquo;
                    </button>

                    {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        return (
                            <button
                                key={pageNum}
                                className={`page-btn ${currentPage === pageNum ? "active" : ""}`}
                                onClick={() => onPageChange(pageNum)}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    <button
                        className="page-btn next"
                        disabled={currentPage === totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                    >
                        &raquo;
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserManagementTable;
