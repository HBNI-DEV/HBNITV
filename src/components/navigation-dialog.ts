import { User } from "@models/user";

export class NavigationDialog {
    dialog: HTMLDialogElement;
    navLarge: HTMLElement;
    navMedium: HTMLElement;
    navSmall: HTMLElement;
    tabs: Record<string, HTMLAnchorElement[]> = {};

    constructor() {
        const { navLargeElement, navMedium, navSmall } = this.createNavs();
        this.dialog = this.createDialog();
        this.navLarge = navLargeElement;
        this.navMedium = navMedium;
        this.navSmall = navSmall;
        this.init();
    }

    private createNavs() {
        const navLarge = document.createElement("template");
        navLarge.innerHTML = `
            <nav class="left l drawer no-padding">
                <nav class="primary small-padding">
                    <a href="/" class="left-align">
                        <img src="/static/icons/icon-192.png" width="96px" height="96px" class="square" alt="HBNI Logo">
                    </a>
                    <h6 class="no-margin small-padding" id="app-title"></h6>
                </nav>
                <nav class="drawer">
                    ${this.link("news", "news", "News")}
                    ${this.link("calendar", "calendar_today", "Calendar")}
                    ${this.link("recordings", "video_library", "Recordings")}
                    ${this.link("settings", "settings", "Settings")}
                    ${this.link("contact", "contact_mail", "Contact")}
                    ${User.role === "admin" || User.role === "super_admin" ? this.link("admin/assignments", "folder_open", "Assignments") : ""}
                    ${User.role === "admin" || User.role === "super_admin" ? this.link("admin/register", "person_add", "Register") : ""}
                </nav>
            </nav>
        `;
        const navLargeElement = navLarge.content.firstElementChild as HTMLElement;

        const navMedium = document.createElement("nav");
        navMedium.className = "left m";
        navMedium.innerHTML = `
            <header class="primary">
                <a href="/">
                    <img src="/static/icons/icon-192.png" width="96px" height="96px" class="square" alt="HBNI Logo">
                </a>
            </header>
            ${this.link("news", "news", "News")}
            ${this.link("calendar", "calendar_today", "Calendar")}
            ${this.link("recordings", "video_library", "Recordings")}
            ${this.link("settings", "settings", "Settings")}
            ${this.link("contact", "contact_mail", "Contact")}
            ${User.role === "admin" || User.role === "super_admin" ? this.link("admin/assignments", "folder_open", "Assign...") : ""}
            ${User.role === "admin" || User.role === "super_admin" ? this.link("admin/register", "person_add", "Register") : ""}
        `;

        const navSmall = document.createElement("nav");
        navSmall.className = "bottom s surface-container";
        navSmall.innerHTML = `
            ${this.link("news", "news", "News")}
            ${this.link("calendar", "calendar_today", "Calendar")}
            ${this.link("recordings", "video_library", "Recordings")}
            ${User.role === "admin" || User.role === "super_admin" ? this.link("admin/assignments", "folder_open", "Assign...") : ""}
        `;

        return { navLargeElement, navMedium, navSmall };
    }

    private createDialog(): HTMLDialogElement {
        const dialog = document.createElement("dialog");
        dialog.id = "navigation-dialog";
        dialog.className = "left s";
        dialog.innerHTML = `
            <header class="fixed">
                <nav>
                    <button id="close-dialog-btn" class="circle transparent" type="button" onclick="ui('#navigation-dialog')">
                        <i>close</i>
                    </button>
                    <button class="small-round large" onclick="window.location.href='/';">
                        <img class="responsive" src="/static/icons/icon-192.png" alt="HBNI Logo" />
                        <h5 class="no-margin">HBNITV</h5>
                    </button>
                </nav>
            </nav>
            <hr class="tiny-margin">
            <nav class="drawer no-padding no-margin">
                ${this.link("news", "news", "News")}
                ${this.link("calendar", "calendar_today", "Calendar")}
                ${this.link("recordings", "video_library", "Recordings")}
                ${this.link("settings", "settings", "Settings")}
                ${this.link("contact", "contact_mail", "Contact")}
                ${User.role === "admin" || User.role === "super_admin" ? this.link("admin/assignments", "folder_open", "Assignments") : ""}
                ${User.role === "admin" || User.role === "super_admin" ? this.link("admin/register", "person_add", "Register") : ""}
            </nav>
            <hr class="tiny-margin">
        `;
        return dialog;
    }

    private link(href: string, icon: string, label: string): string {
        return `
            <a id="${href}" href="/${href}" text="${label}">
                <i>${icon}</i>
                <span>${label}</span>
            </a>
        `;
    }

    private init(): void {
        document.body.appendChild(this.navLarge);
        document.body.appendChild(this.navMedium);
        document.body.appendChild(this.navSmall);
        document.body.appendChild(this.dialog);

        this.cacheTabs();
        this.setCurrentTab();
    }

    private cacheTabs(): void {
        const anchors = [
            ...this.navLarge.querySelectorAll("a"),
            ...this.navMedium.querySelectorAll("a"),
            ...this.navSmall.querySelectorAll("a"),
            ...this.dialog.querySelectorAll("a"),
        ];

        anchors.forEach((anchor) => {
            const href = anchor.getAttribute("href");
            if (href === "/") return;
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
        const appTitles = document.querySelectorAll("#app-title") as NodeListOf<HTMLElement>;
        const pathParts = window.location.pathname.split("/").filter(Boolean);
        const lastSegment = pathParts[pathParts.length - 1] || "";

        appTitles.forEach((appTitle) => {
            if (pathParts.length === 0) {
                appTitle.innerText = "";
            } else {
                appTitle.innerText = lastSegment
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, c => c.toUpperCase())
            }
        });

        const path = window.location.pathname;
        const currentTabs = this.tabs[path];
        if (currentTabs) {
            this.setActiveTab(currentTabs);
        }
    }
}
