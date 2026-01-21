"use client";

import React, { useState, useEffect } from "react";
import {
    getAllUsers,
    approveUser,
    rejectUser,
    suspendUser,
    deleteUser,
    updateFirestoreUser,
} from "../../services/userService";
import { useAuth } from "../../contexts/AuthContext";
import UserManagementTable from "./UserManagementTable";
import UserEditModal from "./UserEditModal";
import Spinner from "../Spinner/Spinner";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { signOut } from "../../services/authService";
import { useRouter } from "next/navigation";
import "./AdminDashboard.scss";

const AdminDashboard = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Refresh loading state
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const router = useRouter();

    const fetchUsers = async () => {
        setIsRefreshing(true);
        const result = await getAllUsers();
        if (result.success) {
            // Sort users by createdAt timestamp (newest first)
            const sortedUsers = result.data.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
                const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
                return dateB - dateA; // Descending order (newest first)
            });
            setUsers(sortedUsers);
            setError("");
        } else {
            setError(result.error);
        }
        setLoading(false);
        setIsRefreshing(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        // Reset to first page when filtering or searching
        setCurrentPage(1);
    }, [filterStatus, searchTerm]);

    const handleApprove = async (uid) => {
        const result = await approveUser(uid, user.uid);
        if (result.success) {
            fetchUsers(); // Refresh list
        } else {
            alert("Error approving user: " + result.error);
        }
    };

    const handleReject = async (uid) => {
        if (window.confirm("Are you sure you want to reject this user?")) {
            const result = await rejectUser(uid, user.uid);
            if (result.success) {
                fetchUsers();
            } else {
                alert("Error rejecting user: " + result.error);
            }
        }
    };

    const handleSuspend = async (uid) => {
        if (window.confirm("Are you sure you want to suspend this user?")) {
            const result = await suspendUser(uid, user.uid);
            if (result.success) {
                fetchUsers();
            } else {
                alert("Error suspending user: " + result.error);
            }
        }
    };

    const handleDelete = async (userToDelete) => {
        if (window.confirm(`Are you sure you want to PERMANENTLY delete ${userToDelete.email}?`)) {
            const result = await deleteUser(userToDelete, user.uid);
            if (result.success) {
                fetchUsers();
            } else {
                alert("Error deleting user: " + result.error);
            }
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleSaveUser = async (uid, updatedData) => {
        const result = await updateFirestoreUser(uid, updatedData);
        if (result.success) {
            fetchUsers();
        } else {
            throw new Error(result.error);
        }
    };

    const handleLogout = async () => {
        const result = await signOut();
        if (result.success) {
            router.replace("/signin");
        } else {
            alert("Error signing out: " + result.error);
        }
    };

    // Calculate stats
    const stats = {
        total: users.length,
        pending: users.filter((u) => u.status === "pending").length,
        approved: users.filter((u) => u.status === "approved").length,
        suspended: users.filter((u) => u.status === "suspended").length,
    };

    const filteredUsers = users.filter((u) => {
        const matchesStatus = filterStatus === "all" || u.status === filterStatus;
        const matchesSearch =
            u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    if (loading && users.length === 0) {
        return (
            <div className="admin-loading">
                <Spinner size="lg" color="gold" />
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-container">
                <header className="admin-header">
                    <div className="header-top">
                        <div className="title-content">
                            <h1>Admin Dashboard</h1>
                            <p>Manage users and account approvals</p>
                        </div>
                        <div className="header-actions">
                            <ThemeToggle />
                            <button className="logout-btn" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card total">
                        <div className="stat-info">
                            <h3>Total Users</h3>
                            <span className="count">{stats.total}</span>
                        </div>
                        <div className="stat-icon">👥</div>
                    </div>
                    <div className="stat-card pending">
                        <div className="stat-info">
                            <h3>Pending</h3>
                            <span className="count">{stats.pending}</span>
                        </div>
                        <div className="stat-icon">⏳</div>
                    </div>
                    <div className="stat-card approved">
                        <div className="stat-info">
                            <h3>Approved</h3>
                            <span className="count">{stats.approved}</span>
                        </div>
                        <div className="stat-icon">✅</div>
                    </div>
                    <div className="stat-card suspended">
                        <div className="stat-info">
                            <h3>Suspended</h3>
                            <span className="count">{stats.suspended}</span>
                        </div>
                        <div className="stat-icon">🚫</div>
                    </div>
                </div>

                <div className="controls">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-box">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                    <button
                        className={`refresh-btn ${isRefreshing ? "spinning" : ""}`}
                        onClick={fetchUsers}
                        disabled={isRefreshing}
                    >
                        {isRefreshing ? <Spinner size="sm" /> : "Refresh Data"}
                    </button>
                </div>

                {error && <div className="error-banner">{error}</div>}

                <div className="table-container">
                    <UserManagementTable
                        users={paginatedUsers}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onSuspend={handleSuspend}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>

                <UserEditModal
                    user={selectedUser}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSaveUser}
                />
            </div>
        </div>
    );
};

export default AdminDashboard;
