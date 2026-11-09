
import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

// Authentication Context
import UserProvider from "./context/UserContext";

// Admin Pages
import Dashboard from "./pages/Admin/Dashboard";
import ManageTasks from "./pages/Admin/ManageTasks";
import CreateTask from "./pages/Admin/CreateTask";
import ManageUsers from "./pages/Admin/ManageUsers";

// Authentication Pages
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";

// User Pages
import UserDashboard from "./pages/User/UserDashboard";
import MyTasks from "./pages/User/MyTasks";
import ViewTaskDetails from "./pages/User/ViewTaskDetails";

// Protected Routes
import PrivateRoute from "./routes/PrivateRoute";

const App = () => {
    return (
        <UserProvider>
            <Router>
                <Routes>

                    {/* Default Route */}
                    <Route
                        path="/"
                        element={<Navigate to="/login" replace />}
                    />

                    {/* Authentication */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />

                    {/* Admin Routes */}
                    <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
                        <Route
                            path="/admin/dashboard"
                            element={<Dashboard />}
                        />
                        <Route
                            path="/admin/tasks"
                            element={<ManageTasks />}
                        />
                        <Route
                            path="/admin/create-task"
                            element={<CreateTask />}
                        />
                        <Route
                            path="/admin/users"
                            element={<ManageUsers />}
                        />
                    </Route>

                    {/* Member Routes */}
                    <Route element={<PrivateRoute allowedRoles={["member"]} />}>
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

                    {/* Unknown Routes */}
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
