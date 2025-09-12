import { SettingsManager } from "@managers/settings-manager";
import { initializeCoreUI } from "@utils/ui-core";
import { EditCalendarDialog } from "@components/edit-calendar-dialog";

class StudentCalendarElement {
    tagName: string;
    iFrame: HTMLIFrameElement;
    private padding = 16;
    private headerHeight = 96; // Footer height for mobile
    private footerHeight = 80; // Footer height for mobile
    private railBarExpandedWidth = 204;
    private railBarCollapsedWidth = 96;
    private appSettings = new SettingsManager();

    constructor() {
        const spinner = document.getElementById("loading-spinner") as HTMLProgressElement;
        this.iFrame = document.createElement("iframe");
        this.iFrame.className = "absolute center round border fade-in";
        this.iFrame.src = "https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FWinnipeg&mode=MONTH&title=HBN%20ITV%20Calendar&src=bWFuYWdlckBoYm5pLm5ldA&color=%239e69af";
        this.iFrame.width = "800";
        this.iFrame.height = "600";
        this.iFrame.setAttribute("frameborder", "1");
        this.iFrame.onload = () => {
            spinner.style.display = "none";
            requestAnimationFrame(() => {
                this.iFrame.classList.add('show');
            });
        };
        this.tagName = "calendar-html";
        this.init();
    }

    init() {
        window.addEventListener("resize", this.resize.bind(this));
        const menuButton = document.querySelector("#menu-button") as HTMLButtonElement;
        menuButton.addEventListener("click", async () => {
            this.resize();
        });

        const editCalendarButton = document.querySelector("#edit-calendar-button") as HTMLButtonElement;
        if (editCalendarButton) {
            editCalendarButton.addEventListener("click", async () => {
                ui("#edit-calendar-dialog");
            });
        }
        this.resize();
    }

    async resize() {
        const main = document.querySelector("main") as HTMLElement;
        const mainHeight = main.offsetHeight;
        const isMobile = window.innerWidth <= 600;
        const isRailBarCollapsed = localStorage.getItem("navigation-collapsed") === "true";

        if (isMobile) {
            this.iFrame.style.width = `calc(100vw - ${this.padding}px)`;
            // this.iFrame.style.height = `calc(100vh - ${this.footerHeight}px - ${this.headerHeight}px - ${this.padding}px)`;
        } else {
            if (isRailBarCollapsed) {
                this.iFrame.style.width = `calc(100vw - ${this.railBarCollapsedWidth}px - ${this.padding}px)`;
                // this.iFrame.style.height = `calc(100vh - ${this.footerHeight}px - ${this.headerHeight}px - ${this.padding}px)`;
            } else {
                this.iFrame.style.width = `calc(100vw - ${this.railBarExpandedWidth}px - ${this.padding}px)`;
                // this.iFrame.style.height = `calc(100vh - ${this.footerHeight}px - ${this.headerHeight}px - ${this.padding}px)`;
            }
        }
        this.iFrame.style.height = `calc(${mainHeight}px - ${this.padding}px)`;
        this.iFrame.style.maxWidth = `1200px`;
        this.iFrame.style.maxInlineSize = `75rem`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // document.body.classList.add("hidden");
    initializeCoreUI();

    const editCalendarDialog = new EditCalendarDialog();

    const calenderDiv = document.querySelector("#calendar-div") as HTMLDivElement;
    if (calenderDiv) {
        const calendarElement = new StudentCalendarElement();
        calenderDiv.appendChild(calendarElement.iFrame);
    } else {
        console.warn("⚠️ calendar.ts: #calendar container not found.");
    }
    // document.body.classList.add("hidden");
});
