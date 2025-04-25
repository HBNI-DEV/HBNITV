import { UserData } from "@utils/user";

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
            <button class="circle transparent" id="menu-button" onclick="ui('#navigation-dialog')">
                <i>menu</i>
            </button>
            <a class="fill border tiny-padding tiny-margin small-round center-align middle-align" id="header-link" href="/">
                <h6><span class="bold">HBNI</span> <span>ITV</span></h6>
            </a>
            <div class="max tiny-margin m l" id="tabs"></div>
            <div class="max s"></div>
            <button class="circle transparent">
                <i>more_vert</i>
                <menu class="left no-wrap">
                    <li onclick="window.location.href='/settings'">
                        <i>settings</i><span>Preferences</span>
                    </li>
                    <li onclick="window.location.href='/contact'">
                        <i>contact_mail</i><span>Contact</span>
                    </li>
                    ${UserData.role === "admin" || UserData.role === "super_admin" ? `
                    <li onclick="window.location.href='/register'">
                        <i>person_add</i><span>Register</span>
                    </li>` : ''}
                </menu>
            </button>
            <span id="auth-button-container"></span>
        `;
        return nav;
    }

    private init(): void {
        this.setAuthButton();
    }

    private setAuthButton(): void {
        const container = this.htmlElement.querySelector("#auth-button-container") as HTMLSpanElement;
        container.innerHTML = UserData.is_logged_in
            ? `
            <button class="transparent circle" id="profile-button" onclick="ui('#profile-dialog')">
                <img class="responsive" src="${UserData.profile_picture}" alt="Profile Picture" id="profile-picture" />
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
