import { NewsData } from "@models/news-data";
import { UserData } from "@models/user-data";
import { defaultUser } from "@models/user";

export class News implements NewsData {
    private _data: {
        id: string;
        userData: UserData;
        title: string;
        content: string;
        createdAt: string;
        updatedAt: string;
    };
    synced?: boolean;
    userData!: UserData;

    private eventTarget = new EventTarget();

    constructor(data?: Partial<NewsData>) {
        const now = new Date().toISOString();
        this._data = {
            id: data?.id ?? "",
            title: data?.title ?? "",
            userData: data?.userData ?? defaultUser,
            content: data?.content ?? "",
            createdAt: data?.createdAt ?? now,
            updatedAt: data?.updatedAt ?? now,
        };
        this.synced = (data as any)?.synced ?? false;
    }

    onChange(listener: (news: News) => void): void {
        this.eventTarget.addEventListener("change", () => listener(this));
    }

    private emitChange(): void {
        this._data.updatedAt = new Date().toISOString();
        this.eventTarget.dispatchEvent(new Event("change"));
    }

    get title() { return this._data.title; }
    set title(value: string) { this._data.title = value; this.emitChange(); }

    get id() { return this._data.id; }
    set id(value: string) { this._data.id = value; this.emitChange(); }

    get user_info() { return this._data.userData; }
    set user_info(value: UserData) { this._data.userData = value; this.emitChange(); }

    get content() { return this._data.content; }
    set content(value: string) { this._data.content = value; this.emitChange(); }

    get createdAt() { return this._data.createdAt; }
    get updatedAt() { return this._data.updatedAt; }

    toJSON(): NewsData {
        return { ...this._data };
    }
}
