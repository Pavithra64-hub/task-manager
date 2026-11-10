
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    FiGrid,
    FiList,
    FiPlusSquare,
    FiUsers,
    FiLogOut,
} from "react-icons/fi";
import { useUser } from "../../context/UserContext";

const AdminLayout = () => {
    const { user, logout } = useUser();
    const navigate = useNavigate();

    const menuItems = [
        {
            name: "Dashboard",
            path: "/admin/dashboard",
            icon: FiGrid,
        },
        {
            name: "Manage Tasks",
            path: "/admin/tasks",
            icon: FiList,
        },
        {
            name: "Create Task",
            path: "/admin/create-task",
            icon: FiPlusSquare,
        },
        {
            name: "Manage Users",
            path: "/admin/users",
            icon: FiUsers,
        },
    ];

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">

                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-xl font-bold">
                        Task Manager
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Admin Panel
                    </p>
                </div>

                {/* Admin information */}
                <div className="p-5 border-b border-slate-700">
                    <p className="text-sm font-semibold">
                        {user?.name || "Administrator"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        Administrator
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/admin/dashboard"}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${
                                        isActive
                                            ? "bg-blue-600 text-white"
                                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                    }`
                                }
                            >
                                <Icon size={19} />
                                {item.name}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-slate-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-slate-300 hover:bg-red-600 hover:text-white transition"
                    >
                        <FiLogOut size={19} />
                        Logout
                    </button>
                </div>

            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0 overflow-x-hidden">
                <Outlet />
            </main>

        </div>
    );
};

export default AdminLayout;
