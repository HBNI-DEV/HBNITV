export class Tabs {
    htmlElement: HTMLElement;
    tagName: string;
    newsTab: HTMLAnchorElement;
    calendarTab: HTMLAnchorElement;
    classesTab: HTMLAnchorElement;
    constructor() {
        const template = document.createElement("template");
        template.innerHTML = `
        <div class="tabs left-align scroll no-border">
            <a class="small-round" href="/news" id="news-tab">
                <i>news</i>
                <span>News</span>
            </a>
            <a class="small-round" href="/calendar" id="calendar-tab">
                <i>calendar_today</i>
                <span>Calendar</span>
            </a>
            <a class="small-round" href="/classes" id="classes-tab">
                <i>video_library</i>
                <span>Classes</span>
            </a>
        </div>
        `;
        this.tagName = "tabs-html";
        this.htmlElement = template.content.firstElementChild as HTMLElement;
        this.newsTab = template.content.querySelector("#news-tab") as HTMLAnchorElement;
        this.calendarTab = template.content.querySelector("#calendar-tab") as HTMLAnchorElement;
        this.classesTab = template.content.querySelector("#classes-tab") as HTMLAnchorElement;
        this.init();
    }

    init() {
        this.setCurrentTab();
        window.addEventListener("resize", this.resizeTabs.bind(this));
        this.resizeTabs();
    }

    resizeTabs() {
        if (window.innerWidth < 800) {
            this.htmlElement.classList.add("small-width");
            this.htmlElement.classList.add("left-align");
            this.htmlElement.classList.add("scroll");
        } else {
            this.htmlElement.classList.remove("left-align");
            this.htmlElement.classList.remove("small-width");
            this.htmlElement.classList.remove("scroll");
        }
    }

    private setActiveTab(tab: HTMLAnchorElement) {
        this.newsTab.classList.remove("active");
        this.calendarTab.classList.remove("active");
        this.classesTab.classList.remove("active");

        tab.classList.add("active");
    }

    private setActiveTabByPath(path: string) {
        if (path === "/news") {
            this.setActiveTab(this.newsTab);
        } else if (path === "/calendar") {
            this.setActiveTab(this.calendarTab);
        } else if (path === "/classes") {
            this.setActiveTab(this.classesTab);
        }
    }

    setCurrentTab(){
        const currentPath = window.location.pathname;

        if (currentPath === "/news") {
            this.setActiveTab(this.newsTab);
        } else if (currentPath === "/calendar") {
            this.setActiveTab(this.calendarTab);
        } else if (currentPath === "/classes") {
            this.setActiveTab(this.classesTab);
        }
    }
}