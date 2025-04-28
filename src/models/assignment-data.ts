import { QuestionData } from "./question-data";
import { UserData } from "./user-data";

export interface AssignmentData {
    id: string;
    userInfo: UserData;
    title: string;
    description: string;
    dueDate: string;      // ISO format like '2025-04-30'
    createdAt: string;     // ISO format
    updatedAt: string;    // Optional, when assignment was last edited
    tags: string[];       // Optional, for categorization (e.g., ['math', 'grade-4'])
    questions: QuestionData[];
    synced?: boolean;
}
