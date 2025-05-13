import { initializeCoreUI } from "@utils/ui-core";

class StudentCalendarElement {
    htmlElement: HTMLElement;
    tagName: string;
    private padding = 16;
    private headerHeight = 80; // Footer height for mobile
    private footerHeight = 80; // Footer height for mobile
    private navWidth = 80;     // Side nav width for desktop

    constructor() {
        const template = document.createElement("template");
        template.innerHTML = `
        <iframe
            class="absolute center round fade-in"
            src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FWinnipeg&mode=MONTH&title=ITV%20Classes&showCalendars=0&src=Y180ZThmMTI2Yzc5ZTNmOWY5YWQ1YmVjNjY5OGI4YTI5ZGE0ZDhhNTRiOGNiZjZhZTJiZTM0YjU3MTQ0MjI1ZDQxQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=ZW4uY2FuYWRpYW4jaG9saWRheUBncm91cC52LmNhbGVuZGFyLmdvb2dsZS5jb20"
            style="border: 0"
            width="800"
            height="600"
            frameborder="1"
            scrolling="yes"
        ></iframe>
        `;
        this.tagName = "calendar-html";
        this.htmlElement = template.content.firstElementChild as HTMLElement;
        this.init();
    }

    init() {
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
    }

    resize() {
        const isMobile = window.innerWidth <= 600;

        if (isMobile) {
            this.htmlElement.style.width = `calc(100vw - ${this.padding}px)`;
            this.htmlElement.style.height = `calc(100vh - ${this.footerHeight}px - ${this.headerHeight}px)`;
        } else {
            this.htmlElement.style.width = `calc(100vw - ${this.navWidth}px - ${this.padding}px)`;
            this.htmlElement.style.height = `calc(100vh - ${this.footerHeight}px)`;
        }

        this.htmlElement.style.maxWidth = `1200px`;
        this.htmlElement.style.maxInlineSize = `75rem`;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await initializeCoreUI();

    const calenderDiv = document.querySelector("#calendar") as HTMLDivElement;
    if (calenderDiv) {
        const calendarElement = new StudentCalendarElement();
        calenderDiv.appendChild(calendarElement.htmlElement);
        requestAnimationFrame(() => calendarElement.htmlElement.classList.add('show'));
    } else {
        console.warn("⚠️ calendar.ts: #calendar container not found.");
    }
});