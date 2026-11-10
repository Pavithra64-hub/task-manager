
import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

// Authentication pages
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";

// Layouts
import AdminLayout from "./components/layouts/AdminLayout";

// Route protection
import PrivateRoute from "./routes/PrivateRoute";

// Admin pages
import Dashboard from "./pages/Admin/Dashboard";
import ManageTasks from "./pages/Admin/ManageTasks";
import CreateTask from "./pages/Admin/CreateTask";
import ManageUsers from "./pages/Admin/ManageUsers";

// User pages
import UserDashboard from "./pages/User/UserDashboard";
import MyTasks from "./pages/User/MyTasks";
import ViewTaskDetails from "./pages/User/ViewTaskDetails";

// User context
import UserProvider from "./context/UserContext";

const App = () => {
    return (
        <UserProvider>
            <Router>
                <Routes>

                    {/* Default route */}
                    <Route
                        path="/"
                        element={<Navigate to="/login" replace />}
                    />

                    {/* Authentication routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />

                    {/* Protected Admin routes */}
                    <Route
                        element={
                            <PrivateRoute allowedRoles={["admin"]} />
                        }
                    >
                        <Route path="/admin" element={<AdminLayout />}>

                            <Route
                                index
                                element={
                                    <Navigate to="dashboard" replace />
                                }
                            />

                            <Route
                                path="dashboard"
                                element={<Dashboard />}
                            />

                            <Route
                                path="tasks"
                                element={<ManageTasks />}
                            />

                            <Route
                                path="create-task"
                                element={<CreateTask />}
                            />

                            <Route
                                path="users"
                                element={<ManageUsers />}
                            />

                        </Route>
                    </Route>

                    {/* Protected Member routes */}
                    <Route
                        element={
                            <PrivateRoute allowedRoles={["member"]} />
                        }
                    >
                        <Route
                            path="/user/dashboard"
                            element={<UserDashboard />}
                        />

                        <Route
                            path="/user/tasks"
                            element={<MyTasks />}
                        />

                        <Route
                            path="/user/task-details/:id"
                            element={<ViewTaskDetails />}
                        />
                    </Route>

                    {/* Unknown routes */}
                    <Route
                        path="*"
                        element={<Navigate to="/login" replace />}
                    />

                </Routes>
            </Router>
        </UserProvider>
    );
};

export default App;
