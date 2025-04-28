import { initializeCoreUI } from "@utils/ui-core";
import { QuestionElement } from "@elements/question-element";
import { AssignmentsManager } from "@managers/assignments-manager";
import { AssignmentsAPI } from "@api/assignments-api";
import { Assignment } from "@models/assignment";
import { User } from "@models/user";
import { AssignmentSyncManager } from "@managers/assignment-sync-manager";

class AssignmentPage {
    tagName = "assignment";
    assignment: Assignment;
    assignmentId: string;
    assignmentElement: HTMLElement;
    questionElements: QuestionElement[] = [];
    questionElementDiv: HTMLElement;

    constructor(hash: string) {
        this.assignment = new Assignment();
        this.assignmentId = hash.replace("#", "");
        this.assignmentElement = document.querySelector("#assignment") as HTMLElement;
        this.questionElementDiv = document.querySelector("#question-elements") as HTMLElement;

        this.init();
    }

    async init() {
        console.log("Assignment ID:", this.assignmentId);

        const fetchedAssignment = await this.fetchAssignment();

        if (fetchedAssignment) {
            this.loadAssignment(fetchedAssignment);
        } else {
            console.error("Assignment could not be loaded (online or offline)");
            // TODO: Maybe show a nice "Assignment not available" screen
        }
    }

    private async fetchAssignment(): Promise<Assignment | undefined> {
        try {
            // Try fetching from the API first
            const assignment = await AssignmentsAPI.getAssignment(this.assignmentId);
            if (assignment) {
                // Optionally update local IndexedDB cache
                const localManager = new AssignmentsManager();
                await localManager.saveAssignment(assignment);
            }
            return assignment;
        } catch (error: any) {
            console.warn("API fetch failed:", error);

            const isOffline = !navigator.onLine;

            // Optionally: if navigator says we're offline OR the error is a network error
            const isNetworkError =
                error instanceof TypeError || // Fetch fails with TypeError on network problems
                (error?.message && error.message.includes("NetworkError"));

            if (isOffline || isNetworkError) {
                console.warn("Detected offline mode or network error, falling back to IndexedDB...");

                try {
                    const localManager = new AssignmentsManager();
                    const localAssignment = await localManager.getAssignment(this.assignmentId);
                    return localAssignment;
                } catch (localError) {
                    console.error("Failed to fetch from local IndexedDB too.", localError);
                    return undefined;
                }
            } else {
                console.error("Server responded but other error occurred, not falling back.");
                return undefined;
            }
        }
    }

    private loadAssignment(assignment: Assignment) {
        console.log("Loaded Assignment:", assignment);
        // TODO: Use assignment data to create questions, set title, etc.
        this.createQuestionElement();
    }

    private createQuestionElement() {
        const questionElement = new QuestionElement(this.questionElements.length + 1);
        this.questionElements.push(questionElement);
        this.questionElementDiv.appendChild(questionElement.htmlElement);

        // Bind the event
        questionElement.htmlElement.addEventListener("questionChanged", (event: Event) => {
            const customEvent = event as CustomEvent;
            console.log("Question updated in assignment:", customEvent.detail.question);
        });
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await initializeCoreUI();
    // // Save locally
    // const localManager = new AssignmentsManager();
    // const assignment = new Assignment({ id: "math-quiz", author: UserData., title: "Math Quiz", description: "", dueDate: "2025-05-01", createdAt: new Date().toISOString(), updatedAt: "", tags: [], questions: [] });

    // await localManager.saveAssignment(assignment);

    // // Save to server
    // await AssignmentsAPI.saveAssignment(assignment);

    // Fetch from server
    const assignmentPage = new AssignmentPage(window.location.hash);

    new AssignmentSyncManager();
});