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
        nav.className = "no-space";
        nav.innerHTML = `
            <button class="circle transparent s" id="menu-button" onclick="ui('#navigation-dialog')">
                <i>menu</i>
            </button>
            <a class="fill border tiny-padding tiny-margin small-round center-align middle-align" id="header-link" href="/">
                <h6><span class="bold">HBNI</span> <span>ITV</span></h6>
            </a>
            <div class="max"></div>
            <button class="circle transparent">
                <i>more_vert</i>
                <menu class="left border no-wrap">
                    <li onclick="window.location.href='/settings'">
                        <i>settings</i><span>Preferences</span>
                    </li>
                    <li onclick="window.location.href='/contact'">
                        <i>contact_mail</i><span>Contact</span>
                    </li>
                    ${
                        User.role === "admin" ||
                        User.role === "super_admin"
                            ? `
                        <li onclick="window.location.href='/admin/register'">
                            <i>person_add</i><span>Register</span>
                        </li>
                        <li onclick="window.location.href='/admin/assignments'">
                            <i>folder_open</i><span>Assignments</span>
                        </li>`
                            : ""
                    }
                </menu>
            </button>
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
                <img class="responsive" src="${User.profile_picture}" alt="Profile Picture" id="profile-picture" />
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
