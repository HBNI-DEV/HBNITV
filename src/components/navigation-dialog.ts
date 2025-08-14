import { User } from "@models/user";
import { SettingsManager } from "@managers/settings-manager";
import Prefetcher from "@utils/prefetcher";
// import { installSoftNav } from "@utils/soft-nav";

// installSoftNav();


export class NavigationDialog {
    dialog: HTMLDialogElement;
    navLarge: HTMLElement;
    navMobile: HTMLElement;
    appSettings = new SettingsManager();
    tabs: Record<string, HTMLAnchorElement[]> = {};

    constructor() {
        const { navDesktop, navMobile } = this.createNavs();
        this.dialog = this.createDialog();
        this.navLarge = navDesktop;
        this.navMobile = navMobile;
        this.init();
    }

    private async init() {
        const railBar = document.querySelector("#rail-bar") as HTMLElement;
        if (railBar) {
            railBar.innerHTML = this.navLarge.innerHTML;
        }
        // document.body.appendChild(this.navLarge);
        // document.body.appendChild(this.navMedium);
        document.body.appendChild(this.navMobile);
        // document.body.appendChild(this.dialog);

        this.cacheTabs();
        // window.addEventListener("softnav:after", () => this.setCurrentTab());

        this.setCurrentTab();
        // this.initPrefetching();  // <— add this

        const menuButton = document.querySelector("#menu-button") as HTMLButtonElement;
        const menuButtonIcon = menuButton.querySelector("i") as HTMLElement;
        const isCollapsed = localStorage.getItem("navigation-collapsed") === "true";
        menuButtonIcon.innerText = isCollapsed ? "menu" : "menu_open";
        railBar.classList.toggle("max", !isCollapsed);

        menuButton.addEventListener("click", async () => {
            railBar.classList.toggle("max");
            if (railBar.classList.contains("max")) {
                menuButtonIcon.textContent = "menu_open";
                localStorage.setItem("navigation-collapsed", "false");
            }
            else {
                menuButtonIcon.textContent = "menu";
                localStorage.setItem("navigation-collapsed", "true");
            }
        });
    }

    private createNavs() {
        const navLarge = document.createElement("template");
        navLarge.innerHTML = `
            <div>
                <header class="small-padding">
                    <button class="extra circle transparent" id="menu-button">
                        <i>menu_open</i>
                    </button>
                </header>
                ${this.link("news", "news", "News")}
                ${this.link("calendar", "calendar_today", "Calendar")}
                ${this.link("recordings", "video_library", "Recordings")}
                ${this.link("settings", "settings", "Settings")}
                ${this.link("contact", "contact_mail", "Contact")}
                ${User.role === "admin" || User.role === "super_admin" ? this.link("admin/shared/folders", "folder_shared", "Shared Folders") : ""}
                ${User.role === "admin" || User.role === "super_admin" ? this.link("admin/assignments", "folder_open", "Assignments") : ""}
                ${User.role === "admin" || User.role === "super_admin" ? this.link("admin/register", "person_add", "Register") : ""}
                <a id="install" text="Install">
                    <i>download</i>
                    <span>Install</span>
                </a>
            </div>
        `;

        const navDesktop = navLarge.content.firstElementChild as HTMLElement;

        const navMobile = document.createElement("nav");
        navMobile.className = "bottom s";
        navMobile.innerHTML = `
            ${this.link("news", "news", "News")}
            ${this.link("calendar", "calendar_today", "Calendar")}
            ${this.link("recordings", "video_library", "Recordings")}
            ${User.role === "admin" || User.role === "super_admin" ? this.link("admin/shared/folders", "folder_shared", "Shared Folders") : ""}
        `;

        return { navDesktop, navMobile };
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
                        <img class="responsive" src="/static/icons/android-icon-192x192.png" alt="HBNI Logo" />
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
                ${User.role === "admin" || User.role === "super_admin" ? this.link("admin/shared/folders", "folder_shared", "Shared Folders") : ""}
                ${User.role === "admin" || User.role === "super_admin" ? this.link("admin/assignments", "folder_open", "Assignments") : ""}
                ${User.role === "admin" || User.role === "super_admin" ? this.link("admin/register", "person_add", "Register") : ""}
                <a id="install" text="Install">
                    <i>download</i>
                    <span>Install</span>
                </a>
            </nav>
            <hr class="tiny-margin">
        `;
        return dialog;
    }

    private link(href: string, icon: string, label: string): string {
        return `
        <a id="${href}"  href="/${href}" text="${label}">
            <i>${icon}</i>
            <span>${label}</span>
        </a>
        `;
    }

    private cacheTabs(): void {
        const railBar = document.querySelector("#rail-bar") as HTMLElement;
        const anchors = [
            ...railBar.querySelectorAll("a"),
            ...this.navMobile.querySelectorAll("a"),
        ];

        anchors.forEach((anchor) => {
            const href = anchor.getAttribute("href");
            if (href === "/") {
                return;
            }
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
                appTitle.innerText = "HBNITV";
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
