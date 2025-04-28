import { Assignment } from "@models/assignment";

export class AssignmentsManager {
    private readonly dbName = "AssignmentsDB";
    private readonly storeName = "assignments";
    private readonly version = 1;
    private db: IDBDatabase | null = null;
    private initPromise: Promise<void>;

    constructor() {
        this.initPromise = this.initDB();
    }

    private async initDB(): Promise<void> {
        if (this.db) return;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () =>
                reject(new Error("Failed to open Assignments database"));
            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve();
            };
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: "id" });
                }
            };
        });
    }

    private getStore(mode: IDBTransactionMode): IDBObjectStore {
        if (!this.db) {
            throw new Error("Database not initialized");
        }
        const transaction = this.db.transaction(this.storeName, mode);
        return transaction.objectStore(this.storeName);
    }

    async saveAssignment(assignment: Assignment, synced: boolean = false): Promise<void> {
        await this.initPromise;

        return new Promise((resolve, reject) => {
            try {
                const store = this.getStore("readwrite");
                const data = assignment.toJSON();
                data.synced = synced; // Force the value we pass

                const request = store.put(data);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(new Error(`Failed to save assignment: ${assignment.id}`));
            } catch (error) {
                reject(error);
            }
        });
    }

    async getAllAssignments(): Promise<Assignment[]> {
        await this.initPromise;

        return new Promise((resolve, reject) => {
            try {
                const store = this.getStore("readonly");
                const request = store.getAll();

                request.onsuccess = () => {
                    const results = request.result || [];
                    const assignments = results.map((item: any) => new Assignment(item));
                    resolve(assignments);
                };

                request.onerror = () =>
                    reject(new Error("Failed to fetch all assignments"));
            } catch (error) {
                reject(error);
            }
        });
    }

    async getAssignment(id: string): Promise<Assignment | undefined> {
        await this.initPromise;

        return new Promise((resolve, reject) => {
            try {
                const store = this.getStore("readonly");
                const request = store.get(id);

                request.onsuccess = () => {
                    const result = request.result;
                    resolve(result ? new Assignment(result) : undefined);
                };

                request.onerror = () =>
                    reject(new Error(`Failed to get assignment: ${id}`));
            } catch (error) {
                reject(error);
            }
        });
    }

    async deleteAssignment(id: string): Promise<void> {
        await this.initPromise;

        return new Promise((resolve, reject) => {
            try {
                const store = this.getStore("readwrite");
                const request = store.delete(id);

                request.onsuccess = () => resolve();
                request.onerror = () =>
                    reject(new Error(`Failed to delete assignment: ${id}`));
            } catch (error) {
                reject(error);
            }
        });
    }

    async getUnsyncedAssignments(): Promise<Assignment[]> {
        await this.initPromise;

        return new Promise((resolve, reject) => {
            try {
                const store = this.getStore("readonly");
                const request = store.getAll();

                request.onsuccess = () => {
                    const results = request.result || [];
                    const unsyncedAssignments = results
                        .filter((item: any) => item.synced === false)
                        .map((item: any) => new Assignment(item));
                    resolve(unsyncedAssignments);
                };

                request.onerror = () => reject(new Error("Failed to fetch unsynced assignments"));
            } catch (error) {
                reject(error);
            }
        });
    }

    async clearAllAssignments(): Promise<void> {
        await this.initPromise;

        return new Promise((resolve, reject) => {
            try {
                const store = this.getStore("readwrite");
                const request = store.clear();

                request.onsuccess = () => resolve();
                request.onerror = () =>
                    reject(new Error("Failed to clear all assignments"));
            } catch (error) {
                reject(error);
            }
        });
    }
}
