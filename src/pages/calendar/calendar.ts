import { SettingsManager } from "@managers/settings-manager";
import { initializeCoreUI } from "@utils/ui-core";

class StudentCalendarElement {
    tagName: string;
    iFrame: HTMLIFrameElement;
    private padding = 16;
    private headerHeight = 112; // Footer height for mobile
    private footerHeight = 80; // Footer height for mobile
    private railBarExpandedWidth = 204;
    private railBarCollapsedWidth = 96;
    private appSettings = new SettingsManager();

    constructor() {
        const spinner = document.getElementById("loading-spinner") as HTMLProgressElement;
        this.iFrame = document.createElement("iframe");
        this.iFrame.className = "absolute center round fade-in";
        this.iFrame.src = "https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FWinnipeg&mode=MONTH&title=HBNITV&src=Y180ZThmMTI2Yzc5ZTNmOWY5YWQ1YmVjNjY5OGI4YTI5ZGE0ZDhhNTRiOGNiZjZhZTJiZTM0YjU3MTQ0MjI1ZDQxQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y184MjYzNjA1ZjY2YjBhNzcxMDhjMWNiODA0ODhhMDE5YzYyYWY5ZTA4ZDRkNmI1OGRkNjhiMWIyYmU4NDViOWU4QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=ZW4uY2FuYWRpYW4jaG9saWRheUBncm91cC52LmNhbGVuZGFyLmdvb2dsZS5jb20&color=%23039be5&color=%239e69af&color=%230b8043";
        this.iFrame.style.border = "0";
        this.iFrame.width = "800";
        this.iFrame.height = "600";
        this.iFrame.setAttribute("frameborder", "0");
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
        this.resize();
    }

    async resize() {
        const isMobile = window.innerWidth <= 600;
        const isRailBarCollapsed = await this.appSettings.getSetting("navigation-collapsed", false);

        if (isMobile) {
            this.iFrame.style.width = `calc(100vw - ${this.padding}px)`;
            this.iFrame.style.height = `calc(100vh - ${this.footerHeight}px - ${this.headerHeight}px - ${this.padding}px)`;
        }else{
            if (isRailBarCollapsed) {
                this.iFrame.style.width = `calc(100vw - ${this.railBarCollapsedWidth}px - ${this.padding}px)`;
                this.iFrame.style.height = `calc(100vh - ${this.headerHeight}px - ${this.padding}px)`;
            }else{
                this.iFrame.style.width = `calc(100vw - ${this.railBarExpandedWidth}px - ${this.padding}px)`;
                this.iFrame.style.height = `calc(100vh - ${this.headerHeight}px - ${this.padding}px)`;
            }
        }

        this.iFrame.style.maxWidth = `1200px`;
        this.iFrame.style.maxInlineSize = `75rem`;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    document.body.classList.add("hidden");
    await initializeCoreUI();

    const calenderDiv = document.querySelector("#calendar-div") as HTMLDivElement;
    if (calenderDiv) {
        const calendarElement = new StudentCalendarElement();
        calenderDiv.appendChild(calendarElement.iFrame);
    } else {
        console.warn("⚠️ calendar.ts: #calendar container not found.");
    }
    document.body.classList.remove("hidden");
});