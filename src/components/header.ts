import { User } from "@models/user";

export class Header {
    htmlElement: HTMLElement;
    tagName = "header-html";

    constructor() {
        this.htmlElement = this.createElement();
        this.init();
    }

    private createElement(): HTMLElement {
        const header = document.createElement("header");
        header.classList.add("fixed", "transparent", "center-align", "min");
        header.innerHTML = `
        <div class="margin">
            <nav class="toolbar primary elevate min">
                <nav class="s min active">
                    <button class="extra circle">
                        <i>menu</i>
                    </button>
                    <menu class="bottom transparent no-wrap" style="max-block-size: 100vh !important;">
                        ${this.link("news", "news", "News")}
                        ${this.link("calendar", "calendar_today", "Calendar")}
                        ${this.link("recordings", "video_library", "Recordings")}
                        ${this.link("settings", "settings", "Settings")}
                        ${this.link("contact", "contact_mail", "Contact")}
                        ${User.role === "admin" || User.role === "super_admin" ? this.link("admin/assignments", "folder_open", "Assignments") : ""}
                        ${User.role === "admin" || User.role === "super_admin" ? this.link("admin/register", "person_add", "Register") : ""}
                        <li>
                            <button class="fill" id="install" text="Install">
                                <i>download</i>
                                <span>Install</span>
                            </button>
                        </li>
                    </menu>
                </nav>
                <h5 id="app-title"></h5>
                <span id="auth-button-container"></span>
            </nav>
        </div>
        `;
        return header;
    }

    private link(href: string, icon: string, label: string): string {
        return `
        <li>
            <button class="fill" id="${href}"  onclick="window.location.href='/${href}';">
                <i>${icon}</i>
                <span>${label}</span>
            </button>
        </li>
        `;
    }

    private init(): void {
        this.setAuthButton();
    }

    private setAuthButton(): void {
        const container = this.htmlElement.querySelector(
            "#auth-button-container",
        ) as HTMLSpanElement;
        container.innerHTML = User.is_logged_in
            ? `
            <button class="transparent circle" id="profile-button" onclick="ui('#profile-dialog')">
                <img class="responsive" src="/static/profiles/${User.user_id}.jpg" alt="Profile Picture" id="profile-picture" />
            </button>`
            : `
            <button class="transparent circle s" id="login-button" onclick="ui('#login-modal')">
                <i>login</i>
            </button>
            <button class="transparent m l" id="login-button" onclick="ui('#login-modal')">
                <i>login</i><span>Log in</span>
            </button>`;
    }
}
