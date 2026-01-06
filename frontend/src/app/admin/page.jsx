"use client";

import AdminDashboard from "@/components/AdminDashboard/AdminDashboard";
import AdminRoute from "@/components/AdminRoute/AdminRoute";

export default function AdminPage() {
    return (
        <AdminRoute>
            <AdminDashboard />
        </AdminRoute>
    );
}
