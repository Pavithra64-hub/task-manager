
const API_PATHS = {
    AUTH: {
        REGISTER: "/auth/register",
        LOGIN: "/auth/login",
        GET_PROFILE: "/auth/profile",
        UPDATE_PROFILE: "/auth/profile",
        UPLOAD_IMAGE: "/auth/upload-image",
    },

    USERS: {
        GET_ALL: "/users",
        GET_BY_ID: (id) => `/users/${id}`,
    },

    TASKS: {
        GET_ALL: "/tasks",
        GET_BY_ID: (id) => `/tasks/${id}`,
        CREATE: "/tasks",
        UPDATE: (id) => `/tasks/${id}`,
        DELETE: (id) => `/tasks/${id}`,
        UPDATE_STATUS: (id) => `/tasks/${id}/status`,
        UPDATE_TODO: (id) => `/tasks/${id}/todo`,
        DASHBOARD_DATA: "/tasks/dashboard-data",
        USER_DASHBOARD_DATA: "/tasks/user-dashboard-data",
    },

    REPORTS: {
        EXPORT_TASKS: "/reports/export/tasks",
        EXPORT_USERS: "/reports/export/users",
    },
};

export default API_PATHS;
