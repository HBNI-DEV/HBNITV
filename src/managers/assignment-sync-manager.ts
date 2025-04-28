import { AssignmentsAPI } from "@api/assignments-api";
import { AssignmentsManager } from "@managers/assignments-manager";
import { Assignment } from "@models/assignment";

export class AssignmentSyncManager {
    private assignmentsManager = new AssignmentsManager();

    constructor() {
        this.setupListeners();
    }

    private setupListeners() {
        window.addEventListener("online", () => this.syncOfflineAssignments());
    }

    async syncOfflineAssignments() {
        console.log("🔄 Network online, trying to sync offline assignments...");

        try {
            const unsyncedAssignments = await this.assignmentsManager.getUnsyncedAssignments();

            for (const assignment of unsyncedAssignments) {
                try {
                    console.log(`Syncing assignment ${assignment.id}...`);
                    await AssignmentsAPI.saveAssignment(assignment);

                    // Mark as synced
                    await this.assignmentsManager.saveAssignment(assignment, true);

                    console.log(`✅ Synced and updated assignment ${assignment.id}`);
                } catch (apiError) {
                    console.error(`❌ Failed to sync assignment ${assignment.id}`, apiError);
                    // Optional: decide if you continue syncing others or stop
                }
            }

            console.log("✅ Finished syncing offline assignments.");
        } catch (error) {
            console.error("Failed to sync offline assignments:", error);
        }
    }

}
