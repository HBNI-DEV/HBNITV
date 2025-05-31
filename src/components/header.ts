import { User } from "@models/user";

export class Header {
    htmlElement: HTMLElement;
    tagName = "header-html";

    constructor() {
        this.htmlElement = this.createElement();
        this.init();
    }

    private createElement(): HTMLElement {
        const nav = document.createElement("nav");
        nav.innerHTML = `
            <button class="s circle transparent" onclick="ui('#navigation-dialog')">
                <i>menu</i>
            </button>
            <h5 class="s m left-align" id="app-title"></h5>
            <div class="max"></div>
            <span id="auth-button-container"></span>
        `;
        return nav;
    }

    private init(): void {
        this.setAuthButton();
        this.setupNetworkStatusBadge();
    }

    private setAuthButton(): void {
        const container = this.htmlElement.querySelector(
            "#auth-button-container",
        ) as HTMLSpanElement;
        container.innerHTML = User.is_logged_in
            ? `
            <button class="transparent circle" id="profile-button" onclick="ui('#profile-dialog')">
                <img class="responsive" src="/static/profiles/${User.user_id}.jpg" alt="Profile Picture" id="profile-picture" />
                <div class="badge tiny tiny-padding bottom right green" id="internet-status-badge"><i class="tiny">wifi</i></div>
            </button>`
            : `
            <button class="transparent circle s" id="login-button" onclick="ui('#login-modal')">
                <i>login</i>
            </button>
            <button class="transparent m l" id="login-button" onclick="ui('#login-modal')">
                <i>login</i><span>Log in</span>
            </button>`;
    }

    private setupNetworkStatusBadge(): void {
        const badge = this.htmlElement.querySelector("#internet-status-badge") as HTMLElement;
        if (!badge) return;

        const updateBadge = () => {
            if (navigator.onLine) {
                badge.classList.remove("error");
                badge.classList.add("green");
                badge.innerHTML = `<i class="tiny" style="color: black;">wifi</i>`;
            } else {
                badge.classList.remove("green");
                badge.classList.add("error");
                badge.innerHTML = `<i class="tiny" style="color: black;">wifi_off</i>`;
            }
        };

        updateBadge();

        window.addEventListener("online", updateBadge);
        window.addEventListener("offline", updateBadge);
    }
}
