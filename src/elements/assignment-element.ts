import { Assignment } from "@models/assignment";
import { AssignmentsAPI } from "@api/assignments-api";

export class AssignmentElement {
    assignment: Assignment;
    htmlElement: HTMLElement;
    btnOpenAssignment: HTMLButtonElement;
    btnDeleteAssignment: HTMLButtonElement;
    syncLastUpdatedElement: HTMLSpanElement;
    tagsElement: HTMLDivElement;

    constructor(assignment: Assignment) {
        this.assignment = assignment;
        this.htmlElement = this.createElement();
        this.tagsElement = this.htmlElement.querySelector("#tags") as HTMLDivElement;
        this.btnOpenAssignment = this.htmlElement.querySelector("#open-assignment") as HTMLButtonElement;
        this.btnDeleteAssignment = this.htmlElement.querySelector("#delete-assignment") as HTMLButtonElement;
        this.init();
        this.syncLastUpdatedElement = this.htmlElement.querySelector("#sync-last-updated") as HTMLSpanElement;
        this.bindEvents();
        this.startSyncStatusUpdater();
    }

    private init() {
        this.tagsElement.innerHTML = `
            <div class="chip small-round tiny-margin">
                <i>question_mark</i>
                <span>${this.assignment.questions.length} questions</span>
            </div>
            <div class="chip small-round tiny-margin">
                <i>star_rate</i>
                <span>${this.assignment.getPoints()} points</span>
            </div>
            <div class="chip small-round tiny-margin">
                <i>update</i>
                <span id="sync-last-updated">${this.assignment.getSmartTimeAgo()}</span>
            </div>
        `;
        this.assignment.tags.forEach(tag => {
            const tagElement = document.createElement("div");
            tagElement.classList.add("chip", "small-round");
            tagElement.innerText = tag;
            this.tagsElement.appendChild(tagElement);
        });
    }

    private createElement(): HTMLDetailsElement {
        const template = document.createElement("template");
        template.innerHTML = `
        <article class="assignment s12 m12 l6 fade-in border round">
            <h5 class="max">${this.assignment.title}</h5>
            <nav class="wrap no-space" id="tags"></nav>
            <nav class="right-align">
                <button id="open-assignment">
                    <span>Open</span>
                </button>
                <button class="no-border transparent link circle" id="delete-assignment">
                    <i>delete</i>
                </button>
            </nav>
        </article>
        `;
        return template.content.firstElementChild as HTMLDetailsElement;
    }

    bindEvents() {
        this.btnOpenAssignment.addEventListener("click", () => {
            window.location.href = `/admin/assignment?id=${this.assignment.id}`;
        });

        this.btnDeleteAssignment.addEventListener("click", async () => {
            if (!confirm("Are you sure you want to delete this assignment?")) return;
            await AssignmentsAPI.deleteAssignment(this.assignment.id);
            this.htmlElement.remove();
        });
    }

    private startSyncStatusUpdater() {
        const update = () => {
            if (this.assignment.lastSyncedAt) {
                this.syncLastUpdatedElement.innerText = this.assignment.getSmartTimeAgo();
            }

            requestAnimationFrame(update); // Reschedule the update
        };

        requestAnimationFrame(update); // Start the loop
    }
}
