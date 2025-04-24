declare global {
    interface Window {
        USER?: {
            profile_picture: string;
            username: string;
            email: string;
            role: string;
            email_verified: boolean;
            hd: string;
            given_name: string;
            family_name: string;
            is_logged_in: boolean;
        };
    }
}

interface UserData {
    profile_picture: string;
    username: string;
    email: string;
    role: string;
    email_verified: boolean;
    hd: string;
    given_name: string;
    family_name: string;
    is_logged_in: boolean;
}

// Safe fallback default user
const defaultUser: UserData = {
    profile_picture: "/static/icons/default-profile.png",
    username: "Guest",
    email: "",
    role: "guest",
    email_verified: false,
    hd: "",
    given_name: "",
    family_name: "",
    is_logged_in: false,
};

// Merge default with actual USER (if it exists)
export const UserData: UserData = {
    ...defaultUser,
    ...(window.USER || {}),
};
