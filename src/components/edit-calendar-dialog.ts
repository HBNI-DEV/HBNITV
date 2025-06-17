import { User } from "@models/user";
import { CalendarAPI } from "@api/calendar-api";
import { Snackbar } from "@components/snackbar";


export class EditCalendarDialog {
    htmlElement: HTMLDialogElement;
    tagName = "edit-calendar-dialog-html";

    constructor() {
        this.htmlElement = this.createElement();
        this.init();
    }

    private createElement(): HTMLDialogElement {
        const dialog = document.createElement("dialog");
        dialog.id = "edit-calendar-dialog";
        dialog.innerHTML = `
            <div>
                <h5>Edit Calendar</h5>
                <div class="grid">
                    <div class="s12 m6 l6 field label prefix border small-round">
                        <i>today</i>
                        <input type="date" id="start-date">
                        <label>Start Date</label>
                    </div>
                    <div class="s12 m6 l6 field label prefix border small-round">
                        <i>today</i>
                        <input type="date" id="end-date">
                        <label>End Date</label>
                    </div>
                </div>
                <p>PD's, Extra Holidays, and other dates to ignore</p>
                <ul class="list border" id="dates-to-ignore-list">
                </ul>
                <button class="small-round border" id="add-date-button">
                    <i>add</i>
                    <span>Add Date</span>
                </button>
                <nav class="right-align">
                    <button id="apply-calendar-button">
                        <i>check</i>
                        <span>Apply</span>
                    </button>
                </nav>
            </div>
        `;
        return dialog;
    }

    createDateToIgnoreItem(date: string, name: unknown): HTMLLIElement {
        const dateToIgnoreItem = document.createElement("li");
        dateToIgnoreItem.classList.add("date-to-ignore-item");
        dateToIgnoreItem.innerHTML = `
            <div class="s12 m6 l6 field label prefix border small-round">
                <i>today</i>
                <input type="date" id="date-to-ignore" value="${date}">
                <label>Date</label>
            </div>
            <div class="s12 m6 l6 field label border small-round">
                <input type="text" id="name-of-date" value="${name}">
                <label>Name</label>
            </div>
        `;
        return dateToIgnoreItem;
    }

    private async init() {
        if (!User.is_logged_in && User.role !== "super_admin") return;
        document.body.appendChild(this.htmlElement);
        const datesToIgnoreList = this.htmlElement.querySelector("#dates-to-ignore-list") as HTMLUListElement;

        const applyButton = this.htmlElement.querySelector("#apply-calendar-button") as HTMLButtonElement;
        applyButton.addEventListener("click", async () => {
            const startDateInput = this.htmlElement.querySelector("#start-date") as HTMLInputElement;
            const endDateInput = this.htmlElement.querySelector("#end-date") as HTMLInputElement;
            const dateIgnoreItems = datesToIgnoreList.querySelectorAll(".date-to-ignore-item");
            const datesToIgnore: Record<string, string> = {};
            for (const dateIgnoreItem of dateIgnoreItems) {
                const nameOfDate = dateIgnoreItem.querySelector("#name-of-date") as HTMLInputElement;
                const dateToIgnore = dateIgnoreItem.querySelector("#date-to-ignore") as HTMLInputElement;
                datesToIgnore[dateToIgnore.value] = nameOfDate.value;
            }

            const startDate = startDateInput.value;
            const endDate = endDateInput.value;

            if (!startDate || !endDate) {
                alert("Please select both a start and end date.");
                return;
            }

            try {
                await CalendarAPI.applyCalendarChanges(startDate, endDate, datesToIgnore);
                const snackbar = new Snackbar("change-success", "Calendar changes applied successfully.");
                snackbar.show();
            } catch (error) {
                console.error("Error applying calendar changes:", error);
                alert("An error occurred while applying calendar changes.");
            }
        });

        const addDateButton = this.htmlElement.querySelector("#add-date-button") as HTMLButtonElement;
        addDateButton.addEventListener("click", async () => {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const dd = String(today.getDate()).padStart(2, '0');

            const formattedDate = `${yyyy}-${mm}-${dd}`;

            const dateToIgnore = this.createDateToIgnoreItem(formattedDate, "Holiday / No School");
            datesToIgnoreList.appendChild(dateToIgnore);
        });

        await CalendarAPI.fetchCalendarData().then((data) => {
            const startDateInput = this.htmlElement.querySelector("#start-date") as HTMLInputElement;
            const endDateInput = this.htmlElement.querySelector("#end-date") as HTMLInputElement;
            startDateInput.value = data.calendar.start_date || "";
            endDateInput.value = data.calendar.end_date || "";
            Object.entries(data.calendar.dates_to_ignore).forEach(([date, name]) => {
                const dateToIgnoreItem = this.createDateToIgnoreItem(date, name);
                datesToIgnoreList.appendChild(dateToIgnoreItem);
            });
        });

    }
}
