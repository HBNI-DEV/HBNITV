import { initializeCoreUI } from "@utils/ui-core";
import { QuestionElement } from "@elements/question-element";
import { AssignmentsManager } from "@managers/assignments-manager";
import { AssignmentsAPI } from "@api/assignments-api";
import { Assignment } from "@models/assignment";
import { User } from "@models/user";
import { AssignmentSyncManager } from "@managers/assignment-sync-manager";
import { Question } from "@models/question";
import { SnackbarError } from "@components/snackbar-error";
import { Snackbar } from "@components/snackbar";
import { CookieManager } from "@managers/cookie-manager";
import { createSwapy } from 'swapy'

let assignmentPage: AssignmentPage | null = null;
let syncStatusInterval: number | null = null;


class AssignmentPage {
    private tagName = "assignment";
    private saveDelayTimer: number | undefined;
    private saveDelayMs = 5000;
    syncStatusInterval: number | null = null;
    private destroyed = false;
    private swapy: ReturnType<typeof createSwapy> | null = null;

    assignment!: Assignment;
    assignmentId: string;
    assignmentElement: HTMLElement;
    assignmentTitleElement: HTMLInputElement;
    questionElements: QuestionElement[] = [];
    questionElementDiv: HTMLElement;
    assignmentManager = new AssignmentsManager();
    syncButtonElement: HTMLButtonElement;
    syncProgressElement: HTMLProgressElement;
    syncStatusIconElement: HTMLElement;
    syncStatusTextElement: HTMLSpanElement;
    syncLastUpdatedElement: HTMLSpanElement;
    addQuestionButtonElement: HTMLButtonElement;

    constructor(assignmentId: string) {
        this.assignmentId = assignmentId;
        this.assignmentTitleElement = document.querySelector("#assignment-title") as HTMLInputElement;
        this.assignmentElement = document.querySelector("#assignment") as HTMLElement;
        this.questionElementDiv = document.querySelector("#question-elements") as HTMLElement;
        this.syncButtonElement = document.querySelector("#sync-status-button") as HTMLButtonElement;
        this.syncProgressElement = document.querySelector("#sync-progress") as HTMLProgressElement;
        this.syncStatusIconElement = document.querySelector("#sync-status-icon") as HTMLElement;
        this.syncStatusTextElement = document.querySelector("#sync-status-text") as HTMLSpanElement;
        this.syncLastUpdatedElement = document.querySelector("#sync-last-updated") as HTMLSpanElement;
        this.addQuestionButtonElement = document.querySelector("#add-question-button") as HTMLButtonElement;
        this.init();
        this.bindEvents();
    }

    async init() {
        this.assignment = await this.fetchAssignment() as Assignment;
        if (this.assignment) {
            this.loadAssignment();
            this.startSyncStatusUpdater();
            const successSnackBar = new Snackbar("success-assignment-loaded", "Assignment loaded");
            successSnackBar.show(1000);
        } else {
            console.error("Assignment could not be loaded (online or offline)");
            const errorSnackBar = new SnackbarError("error-not-available", "Assignment not available");
            errorSnackBar.show();
        }
    }

    private bindEvents() {
        this.syncButtonElement.addEventListener("click", async () => {
            this.scheduleSave(0);
            // const successSnackBar = new Snackbar("success-assignment-synced", "Assignment synced");
            // successSnackBar.show(1000);
        });
        this.assignmentTitleElement.addEventListener("input", () => {
            this.assignment.title = this.assignmentTitleElement.value;
            this.scheduleSave();
        });
        this.addQuestionButtonElement.addEventListener("click", () => {
            this.createQuestionElement();
        });
    }

    private async fetchAssignment(): Promise<Assignment | undefined> {
        try {
            // Try fetching from the API first
            const assignment = await AssignmentsAPI.getAssignment(this.assignmentId);
            if (assignment) {
                // Optionally update local IndexedDB cache
                await this.assignmentManager.saveAssignment(assignment);
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
                    const localAssignment = await this.assignmentManager.getAssignment(this.assignmentId);
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

    private loadAssignment() {
        this.questionElementDiv.innerHTML = "";
        this.assignmentTitleElement.value = this.assignment.title;
        this.assignment.questions.forEach(question => this.addQuestionElement(question));

        this.swapy = createSwapy(this.questionElementDiv, {
            animation: 'spring',
            dragAxis: 'y',
            autoScrollOnDrag: true,
            swapMode: 'drop',
        })
        this.swapy.enable(true)

        this.swapy.onSwap((event) => {
            const slotToItem = event.newSlotItemMap.asMap;

            console.log(slotToItem);

            let newQuestionOrder: Question[] = [];

            let index = 0;
            slotToItem.forEach((slot, newSlot) => {
                const slotNumber = parseInt(slot);
                const newSlotNumber = parseInt(newSlot);
                const questionElement = this.questionElements[index];
                questionElement.updateQuestionNumber(newSlotNumber);
                newQuestionOrder.push(this.assignment.questions[slotNumber-1]);
                index++;
            });

            this.assignment.questions = newQuestionOrder;

            this.saveOpenDetailsState();
            this.scheduleSave();
        });
    }

    private addQuestionElement(question: Question) {
        const questionElement = new QuestionElement(this.questionElements.length + 1, question);
        this.questionElements.push(questionElement);
        this.questionElementDiv.appendChild(questionElement.htmlElement);
        requestAnimationFrame(() => questionElement.htmlElement.classList.add('show'));

        questionElement.toggleQuestionButton.addEventListener("click", () => {
            this.saveOpenDetailsState();
        });

        questionElement.htmlElement.addEventListener("questionChanged", (event: Event) => {
            const customEvent = event as CustomEvent;
            this.scheduleSave();
        });

        questionElement.htmlElement.addEventListener("delete", () => {
            this.assignment.removeQuestion(questionElement.questionNumber-1);
            this.removeQuestionElement(questionElement);
            this.scheduleSave();
        });

        this.restoreDetailsState(questionElement);
    }

    private removeQuestionElement(questionElement: QuestionElement) {
        const index = this.questionElements.indexOf(questionElement);
        if (index !== -1) {
            this.questionElements.splice(index, 1); // remove it from the array
        }
        questionElement.htmlElement.classList.remove('show');

        setTimeout(() => {
            if (questionElement.htmlElement.parentElement === this.questionElementDiv) {
                this.questionElementDiv.removeChild(questionElement.htmlElement);
                this.saveOpenDetailsState();
                this.swapy?.update();
            }
        }, 300);
    }

    private createQuestionElement() {
        const newQuestion = new Question();
        this.assignment.addQuestion(newQuestion);
        this.addQuestionElement(newQuestion);
        this.swapy?.update();
    }

    private saveOpenDetailsState() {
        const openIndexes = this.assignment.questions
            .map((q, index) => q.open ? index + 1 : -1)
            .filter(index => index !== -1);

        console.log(openIndexes);

        CookieManager.setCookie(`openDetails-${this.assignmentId}`, JSON.stringify(openIndexes), 365);
    }

    private startSyncStatusUpdater() {
        const update = () => {
            if (this.destroyed) return;

            if (this.assignment.lastSyncedAt) {
                this.syncLastUpdatedElement.innerText = this.assignment.getSmartTimeAgo();
            }

            requestAnimationFrame(update); // Reschedule the update
        };

        requestAnimationFrame(update); // Start the loop
    }

    private restoreDetailsState(questionElement: QuestionElement) {
        const cookieValue = CookieManager.getCookie(`openDetails-${this.assignmentId}`);
        if (!cookieValue) return;

        try {
            const openNumbers: number[] = JSON.parse(cookieValue);
            const isOpen = openNumbers.includes(questionElement.questionNumber);
            const wrapper = questionElement.htmlElement.querySelector(".question-content-wrapper") as HTMLElement;

            if (isOpen) {
                questionElement.questionItem.classList.add("open");
                questionElement.question.open = true;

                // Ensure styles are applied after layout is ready
                wrapper.style.maxHeight = "0px";
                wrapper.style.opacity = "0";
                requestAnimationFrame(() => {
                    wrapper.style.maxHeight = wrapper.scrollHeight + "px";
                    wrapper.style.opacity = "1";
                });
            } else {
                wrapper.style.maxHeight = "0px";
                wrapper.style.opacity = "0";
                questionElement.questionItem.classList.remove("open");
                questionElement.question.open = false;
            }
        } catch (e) {
            console.warn("Failed to parse openDetails cookie:", e);
        }
    }

    private scheduleSave(overrideDelayMs?: number) {
        const delayMs = overrideDelayMs ?? this.saveDelayMs;

        if (this.saveDelayTimer !== undefined) {
            clearTimeout(this.saveDelayTimer);
        }

        this.saveDelayTimer = window.setTimeout(() => {
            this.saveAssignment().then(() => {
                this.syncProgressElement.classList.add("hidden");
                this.syncStatusIconElement.classList.remove("hidden");
                this.syncStatusTextElement.innerText = "Save";

                if (!this.syncStatusInterval) {
                    this.startSyncStatusUpdater();
                }
            });
        }, delayMs);
    }

    private async saveAssignment(): Promise<void> {
        if (this.destroyed) return;

        this.syncProgressElement.classList.remove("hidden");
        this.syncStatusIconElement.classList.add("hidden");
        this.syncStatusTextElement.innerText = "Syncing...";
        this.assignment.lastSyncedAt = new Date();

        await Promise.all([
            this.saveOpenDetailsState(),
            this.assignmentManager.saveAssignment(this.assignment),
            AssignmentsAPI.saveAssignment(this.assignment),
        ])
    }

    public destroy() {
        this.destroyed = true;
        if (this.saveDelayTimer) clearTimeout(this.saveDelayTimer);
    }
}

function loadAssignmentFromID() {
    const searchParams = new URLSearchParams(window.location.search);
    const assignmentId = searchParams.get("id");

    if (!assignmentId) return;

    if (assignmentPage) {
        assignmentPage.destroy(); // cleanly stop the animation loop
    }

    // Rebuild the page
    assignmentPage = new AssignmentPage(assignmentId);
}

document.addEventListener("DOMContentLoaded", async () => {
    await initializeCoreUI();
    loadAssignmentFromID();
    new AssignmentSyncManager();
});

window.addEventListener("hashchange", () => {
    loadAssignmentFromID();
});