import { UserData } from "@models/user-data";

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
            user_id: string;
        };
    }
}


// Safe fallback default user
export const defaultUser: UserData = {
    profile_picture: "/static/profiles/default-profile.jpg",
    username: "Guest",
    email: "",
    role: "guest",
    email_verified: false,
    hd: "",
    given_name: "",
    family_name: "",
    is_logged_in: false,
    user_id: "default-profile",
};

// Merge default with actual USER (if it exists)
export const User: UserData = {
    ...defaultUser,
    ...(window.USER || {}),
};
