export class Tabs {
    htmlElement: HTMLElement;
    tagName = "tabs-html";
    private tabs: Record<string, HTMLAnchorElement> = {};

    constructor() {
        this.htmlElement = this.createElement();
        this.cacheTabs();
        this.init();
    }

    private createElement(): HTMLElement {
        const el = document.createElement("div");
        el.className = "tabs left-align scroll no-border";
        el.innerHTML = `
            <a class="small-round" href="/news" id="news-tab">
                <i>news</i><span>News</span>
            </a>
            <a class="small-round" href="/calendar" id="calendar-tab">
                <i>calendar_today</i><span>Calendar</span>
            </a>
            <a class="small-round" href="/classes" id="classes-tab">
                <i>video_library</i><span>Classes</span>
            </a>
        `;
        return el;
    }

    private cacheTabs(): void {
        this.tabs = {
            "/news": this.htmlElement.querySelector("#news-tab") as HTMLAnchorElement,
            "/calendar": this.htmlElement.querySelector("#calendar-tab") as HTMLAnchorElement,
            "/classes": this.htmlElement.querySelector("#classes-tab") as HTMLAnchorElement,
        };
    }

    private init(): void {
        this.setCurrentTab();
        window.addEventListener("resize", this.resizeTabs.bind(this));
        this.resizeTabs();
    }

    private resizeTabs(): void {
        const { classList } = this.htmlElement;
        if (window.innerWidth < 800) {
            classList.add("small-width", "left-align", "scroll");
        } else {
            classList.remove("small-width", "left-align", "scroll");
        }
    }

    private setActiveTab(tab: HTMLAnchorElement): void {
        Object.values(this.tabs).forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
    }

    private setCurrentTab(): void {
        const current = this.tabs[window.location.pathname];
        if (current) this.setActiveTab(current);
    }
}
