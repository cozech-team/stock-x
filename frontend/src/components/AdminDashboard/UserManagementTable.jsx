"use client";

import React from "react";

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

    return (
        <div className="user-table-wrapper">
            <table className="user-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
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
                                    {user.role === "admin" && <span className="badge admin-badge">Admin</span>}
                                </div>
                            </td>
                            <td>{user.email}</td>
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
                                                onClick={() => onApprove(user.uid || user.id)}
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
                                            onClick={() => onApprove(user.uid || user.id)}
                                            title="Re-approve User"
                                        >
                                            Re-activate
                                        </button>
                                    )}
                                    <button className="btn edit" onClick={() => onEdit(user)} title="Edit User">
                                        Edit
                                    </button>
                                    <button
                                        className="btn delete"
                                        onClick={() => onDelete(user)}
                                        title="Delete User Permanently"
                                    >
                                        Delete
                                    </button>
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
