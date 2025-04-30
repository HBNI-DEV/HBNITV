import { UserData } from "@models/user-data";

export interface NewsData {
    id: string;
    userData: UserData;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}
