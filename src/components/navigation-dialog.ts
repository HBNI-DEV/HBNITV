import { User } from "@models/user";

export class NavigationDialog {
    navLarge: HTMLElement;
    navMedium: HTMLElement;
    navSmall: HTMLElement;
    tabs: Record<string, HTMLAnchorElement[]> = {};

    constructor() {
        const { navLarge, navMedium, navSmall } = this.createNavs();
        this.navLarge = navLarge;
        this.navMedium = navMedium;
        this.navSmall = navSmall;
        this.init();
    }

    private createNavs() {
        const navLarge = document.createElement("nav");
        navLarge.className = "left l drawer surface-container";
        navLarge.innerHTML = `
            <header class="surface-container">
                <a href="/" class="left-align">
                    <img src="/static/icons/icon-192.png" width="96px" height="96px" class="square" alt="HBNI Logo">
                    <h6 class="no-margin small-padding">HBNI ITV</h6>
                </a>
            </header>
            ${this.link("news", "news", "News")}
            ${this.link("calendar", "calendar_today", "Calendar")}
            ${this.link("recordings", "video_library", "Recordings")}
            ${this.link("settings", "settings", "Settings")}
            ${User.role === "admin" || User.role === "super_admin" ? this.link("admin/assignments", "folder_open", "Assignments") : ""}
        `;

        const navMedium = document.createElement("nav");
        navMedium.className = "left m l surface-container";
        navMedium.innerHTML = `
            <header class="surface-container">
                <a href="/">
                    <img src="/static/icons/icon-192.png" width="96px" height="96px" class="square" alt="HBNI Logo">
                </a>
            </header>
            ${this.link("news", "news", "News")}
            ${this.link("calendar", "calendar_today", "Calendar")}
            ${this.link("recordings", "video_library", "Recordings")}
            ${this.link("settings", "settings", "Settings")}
            ${User.role === "admin" || User.role === "super_admin" ? this.link("admin/assignments", "folder_open", "Assign...") : ""}
        `;

        const navSmall = document.createElement("nav");
        navSmall.className = "bottom s surface-container";
        navSmall.innerHTML = `
            ${this.link("news", "news", "News")}
            ${this.link("calendar", "calendar_today", "Calendar")}
            ${this.link("recordings", "video_library", "Recordings")}
        `;

        return { navLarge, navMedium, navSmall };
    }

    private createDialog(): HTMLDialogElement {
        const dialog = document.createElement("dialog");
        dialog.id = "navigation-dialog";
        dialog.className = "left medium-width no-padding s";
        dialog.innerHTML = `
            <nav class="row no-space small-margin">
                <button id="close-dialog-btn" class="circle transparent" type="button">
                    <i>close</i>
                </button>
                <a class="fill border tiny-padding tiny-margin small-round center-align middle-align" href="/">
                    <h6><span class="bold">HBNI</span> <span>ITV</span></h6>
                </a>
            </nav>
            <hr class="tiny-margin">
            <div class="padding">
                <nav class="drawer">
                    ${this.links()}
                </nav>
            </div>
            <hr class="tiny-margin">
        `;
        return dialog;
    }

    private links(): string {
        return `
            ${this.link("news", "news", "News")}
            ${this.link("calendar", "calendar_today", "Calendar")}
            ${this.link("recordings", "video_library", "Recordings")}
            ${this.link("settings", "settings", "Settings")}
            ${User.role === "admin" || User.role === "super_admin" ? this.link("admin/assignments", "folder_open", "Assign...") : ""}
            ${User.role === "admin" || User.role === "super_admin" ? this.link("admin/classes", "school", "Classes") : ""}
        `;
    }

    private link(href: string, icon: string, label: string): string {
        return `
            <a id="${href}" href="/${href}">
                <i>${icon}</i>
                <span>${label}</span>
            </a>
        `;
    }

    private init(): void {
        // document.body.appendChild(this.navLarge);
        document.body.appendChild(this.navMedium);
        document.body.appendChild(this.navSmall);

        this.cacheTabs();
        this.setCurrentTab();
    }

    private cacheTabs(): void {
        const anchors = [
            ...this.navLarge.querySelectorAll("a"),
            ...this.navMedium.querySelectorAll("a"),
            ...this.navSmall.querySelectorAll("a"),
        ];

        anchors.forEach((anchor) => {
            const href = anchor.getAttribute("href");
            if (href) {
                if (!this.tabs[href]) {
                    this.tabs[href] = [];
                }
                this.tabs[href].push(anchor as HTMLAnchorElement);
            }
        });
    }

    private setActiveTab(tabs: HTMLAnchorElement[]): void {
        // First, clear active on all tabs
        Object.values(this.tabs).flat().forEach((t) => t.classList.remove("active"));

        // Then activate all tabs matching the current href
        tabs.forEach((tab) => tab.classList.add("active"));
    }

    private setCurrentTab(): void {
        const header = document.querySelector("#header") as HTMLElement;
        // make first letter uppercase
        const pathParts = window.location.pathname.split("/").filter(Boolean);
        const lastSegment = pathParts[pathParts.length - 1] || "";

        header.innerText = lastSegment
            .replace(/-/g, " ")
            .replace(/\b\w/g, c => c.toUpperCase())
            .replace("Admin ", "");
        const path = window.location.pathname;
        const currentTabs = this.tabs[path];
        if (currentTabs) {
            this.setActiveTab(currentTabs);
        }
    }
}
