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
        edited: boolean;
        lastEditedAt: string;
        revisons: string[]
    };
    synced?: boolean;
    userData!: UserData;

    private eventTarget = new EventTarget();
    createdAtReadable: string;
    createdAtRelative: string;
    updatedAtReadable: string;
    updatedAtRelative: string;

    constructor(data?: Partial<NewsData>) {
        const now = new Date().toISOString();
        this._data = {
            id: data?.id ?? "",
            title: data?.title ?? "",
            userData: data?.userData ?? defaultUser,
            content: data?.content ?? "",
            createdAt: data?.createdAt ?? now,
            updatedAt: data?.updatedAt ?? now,
            edited: data?.edited ?? false,
            lastEditedAt: data?.lastEditedAt ?? "",
            revisons: data?.revisons ?? [],
        };
        this.synced = (data as any)?.synced ?? false;
        this.createdAtReadable = this.formatDateTime(this._data.createdAt).readable;
        this.createdAtRelative = this.formatDateTime(this._data.createdAt).relative;
        this.updatedAtReadable = this.formatDateTime(this._data.updatedAt).readable;
        this.updatedAtRelative = this.formatDateTime(this._data.updatedAt).relative;
    }

    formatDateTime(isoString: string): { readable: string; relative: string } {
        const date = new Date(isoString);
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const readable = new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(date);

        const relative = daysAgo === 0 ? "Today" : `${daysAgo} day${daysAgo !== 1 ? "s" : ""} ago`;

        return { readable, relative };
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

    get edited() { return this._data.edited; }
    set edited(value: boolean) { this._data.edited = value; this.emitChange(); }

    get lastEditedAt() { return this._data.lastEditedAt; }
    set lastEditedAt(value: string) { this._data.lastEditedAt = value; this.emitChange(); }

    get revisons() { return this._data.revisons; }
    set revisons(value: string[]) { this._data.revisons = value; this.emitChange(); }

    toJSON(): NewsData {
        return { ...this._data };
    }
}
