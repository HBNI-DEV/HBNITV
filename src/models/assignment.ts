import { AssignmentData } from "./assignment-data";
import { Question } from "./question";
import { UserData } from "./user-data";
import { defaultUser, User } from './user';
import { QuestionData } from "./question-data";

export class Assignment implements AssignmentData {
    private _data: AssignmentData;
    synced?: boolean; // Optional synced flag
    private eventTarget = new EventTarget();

    constructor(data?: Partial<AssignmentData>) {
        const now = new Date().toISOString();
        this._data = {
            id: data?.id ?? "",
            userInfo: data?.userInfo ?? defaultUser,
            title: data?.title ?? "",
            description: data?.description ?? "",
            dueDate: data?.dueDate ?? now.slice(0, 10),
            createdAt: data?.createdAt ?? now,
            updatedAt: data?.updatedAt ?? "",
            tags: data?.tags ?? [],
            questions: data?.questions?.map(q => new Question(q)) ?? [],
            lastSyncedAt: data?.lastSyncedAt ? new Date(data.lastSyncedAt) : null,
        };
        console.log("Raw data:", data);
        console.log("Raw questions:", data?.questions);
        console.log("Mapped questions:", data?.questions?.map(q => new Question(q)));

        this.synced = (data as any)?.synced ?? false;
    }

    onChange(listener: (assignment: Assignment) => void): void {
        this.eventTarget.addEventListener("change", () => listener(this));
    }

    private emitChange(): void {
        this._data.updatedAt = new Date().toISOString();
        this.eventTarget.dispatchEvent(new Event("change"));
    }

    get id() { return this._data.id; }
    set id(value: string) { this._data.id = value; this.emitChange(); }

    get userInfo() { return this._data.userInfo; }
    set userInfo(value: UserData) { this._data.userInfo = value; this.emitChange(); }

    get title() { return this._data.title; }
    set title(value: string) { this._data.title = value; this.emitChange(); }

    get description() { return this._data.description; }
    set description(value: string) { this._data.description = value; this.emitChange(); }

    get dueDate() { return this._data.dueDate; }
    set dueDate(value: string) { this._data.dueDate = value; this.emitChange(); }

    get createdAt() { return this._data.createdAt; }
    get updatedAt() { return this._data.updatedAt; }

    get tags() { return this._data.tags; }
    set tags(value: string[]) { this._data.tags = value; this.emitChange(); }

    get lastSyncedAt() { return this._data.lastSyncedAt; }
    set lastSyncedAt(value: Date | null) { this._data.lastSyncedAt = value; this.emitChange(); }

    get questions() { return this._data.questions }
    set questions(value: Question[]) { this._data.questions = value; this.emitChange(); }

    addQuestion(question: Question): void {
        this._data.questions.push(question);
        this.emitChange();
    }

    removeQuestion(index: number): void {
        if (index >= 0 && index < this._data.questions.length) {
            this._data.questions.splice(index, 1);
            this.emitChange();
        }
    }

    getSmartTimeAgo(): string {
        if (!this.lastSyncedAt) return "Synced";

        const now = new Date();
        const seconds = Math.floor((now.getTime() - this.lastSyncedAt.getTime()) / 1000);

        if (seconds < 5) return "Synced just now";
        if (seconds < 60) return `Synced ${seconds} seconds ago`;

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `Synced ${minutes} minute${minutes > 1 ? "s" : ""} ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Synced ${hours} hour${hours > 1 ? "s" : ""} ago`;

        const days = Math.floor(hours / 24);
        if (days === 1) return `Synced yesterday`;
        if (days < 365) return `Synced ${days} day${days > 1 ? "s" : ""} ago`;

        return `Synced on ${this.lastSyncedAt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`;
    }

    getPoints(): number {
        return this.questions.reduce((total, question) => total + question.worth, 0);
    }

    toJSON(): Omit<AssignmentData, "questions"> & { questions: QuestionData[] } {
        return {
            ...this._data,
            questions: this._data.questions.map(q => q.toJSON()),
        };
    }
}
