export interface QuestionData {
    questionNumber: number;
    worth: number;
    answer: string;
    question: string;
    questionSpace: number; // 0.5 = half a page, 1 = full page
    open: boolean;
    options?: string[];
}