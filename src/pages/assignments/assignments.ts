import { initializeCoreUI } from "@utils/ui-core";
import { AssignmentsAPI } from "@api/assignments-api";
import { Assignment } from "@models/assignment";
import { AssignmentElement } from "@elements/assignment-element";
import { User } from "@models/user";

class AssignmentsPage {
    createAssignmentButton: HTMLButtonElement;
    assignmentsList: HTMLDivElement;
    private assignments: Assignment[] = [];

    constructor() {
        this.createAssignmentButton = document.getElementById("create-assignment") as HTMLButtonElement;
        this.assignmentsList = document.getElementById("assignments-list") as HTMLDivElement;

        this.init();
        this.bindEvents();
    }

    async init() {
        await this.loadAssignments();
    }

    async loadAssignments() {
        this.assignments = await AssignmentsAPI.getAllAssignments();
        this.renderAssignments();
    }

    renderAssignments() {
        this.assignmentsList.innerHTML = "";
        this.assignments.forEach(assignment => {
            const assignmentElement = new AssignmentElement(assignment);
            this.assignmentsList.appendChild(assignmentElement.htmlElement);
            requestAnimationFrame(() => assignmentElement.htmlElement.classList.add('show'));
        });
    }

    private bindEvents() {
        this.createAssignmentButton.addEventListener("click", async () => {
            const assignmentId = new Date().getTime().toString();
            const assignment = new Assignment({id: assignmentId});
            assignment.title = "New Assignment";
            assignment.userInfo = User;
            await AssignmentsAPI.saveAssignment(assignment);
            await this.loadAssignments();
        });
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    document.body.classList.add("hidden");
    await initializeCoreUI();
    const assignmentPage = new AssignmentsPage();
    document.body.classList.remove("hidden");
});
