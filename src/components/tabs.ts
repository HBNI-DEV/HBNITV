export class Tabs {
    htmlElement: HTMLElement;
    tagName = "tabs-html";
    private tabs: Record<string, HTMLAnchorElement> = {};
    private tabDefinitions: Record<
        string,
        { href: string; icon: string; label: string }[]
    > = {
        normal: [
            { href: "/news", icon: "news", label: "News" },
            { href: "/calendar", icon: "calendar_today", label: "Calendar" },
            { href: "/classes", icon: "video_library", label: "Classes" },
        ],
        admin: [
            { href: "/admin/assignments", icon: "folder_open", label: "Assignments" },
            { href: "/admin/register", icon: "person_add", label: "Register" },
        ],
    };

    constructor() {
        this.htmlElement = this.createElement();
        this.cacheTabs();
        this.init();
    }

    private getCurrentMode(): "normal" | "admin" {
        return window.location.pathname.includes("/admin/")
            ? "admin"
            : "normal";
    }

    private createElement(): HTMLElement {
        const el = document.createElement("div");
        el.className = "tabs left-align scroll no-border";

        const mode = this.getCurrentMode();
        const tabs = this.tabDefinitions[mode];

        el.innerHTML = tabs
            .map(
                (tab) => `
            <a class="small-round" href="${tab.href}" id="${this.getTabId(tab.href)}">
                <i>${tab.icon}</i><span>${tab.label}</span>
            </a>
        `,
            )
            .join("");

        return el;
    }

    private getTabId(href: string): string {
        return href.replace(/[\/]/g, "-") + "-tab";
    }

    private cacheTabs(): void {
        const anchors = this.htmlElement.querySelectorAll("a");
        anchors.forEach((anchor) => {
            const href = anchor.getAttribute("href")!;
            this.tabs[href] = anchor as HTMLAnchorElement;
        });
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
        Object.values(this.tabs).forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
    }

    private setCurrentTab(): void {
        const current = this.tabs[window.location.pathname];
        if (current) this.setActiveTab(current);
    }
}
