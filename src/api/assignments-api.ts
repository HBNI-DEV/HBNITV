import { Assignment } from "@models/assignment";

const API_ENDPOINT = "/api/assignment";

export class AssignmentsAPI {
    static async saveAssignment(assignment: Assignment): Promise<void> {
        const response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(assignment.toJSON()),
        });

        if (!response.ok) {
            throw new Error(`Failed to save assignment: ${response.statusText}`);
        }
    }

    static async getAssignment(id: string): Promise<Assignment | undefined> {
        const response = await fetch(`${API_ENDPOINT}?id=${encodeURIComponent(id)}`);

        if (!response.ok) {
            if (response.status === 404) return undefined;
            throw new Error(`Failed to fetch assignment: ${response.statusText}`);
        }

        const result = await response.json();
        const assignment = new Assignment(result.data);

        return assignment;
    }

    static async getAllAssignments(): Promise<Assignment[]> {
        const response = await fetch(API_ENDPOINT);

        if (!response.ok) {
            throw new Error(`Failed to fetch assignments: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data.map((item: any) => new Assignment(item.data));
    }

    static async deleteAssignment(id: string): Promise<void> {
        const response = await fetch(`${API_ENDPOINT}?id=${encodeURIComponent(id)}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error(`Failed to delete assignment: ${response.statusText}`);
        }
    }
}
