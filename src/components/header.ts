import { UserData } from "@utils/user";

export class Header {
    htmlElement: HTMLElement;
    tagName: string;

    constructor() {
        const template = document.createElement("template");
        template.innerHTML = `
        <nav class="no-space">
            <button
                class="circle transparent"
                id="menu-button"
                onclick="ui('#navigation-dialog')"
            >
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
                        <i>settings</i>
                        <span>Preferences</span>
                    </li>
                    <li onclick="window.location.href='/contact'">
                        <i>contact_mail</i>
                        <span>Contact</span>
                    </li>
                    ${ UserData.role !== "student" ? `
                    <li onclick="window.location.href='/register'">
                        <i>person_add</i>
                        <span>Register</span>
                    </li>` : ''}
                </menu>
            </button>
            <span id="auth-button-container"></span>
        </nav>
        `;

        this.tagName = "header-html";
        this.htmlElement = template.content.firstElementChild as HTMLElement;

        this.init();
    }

    init() {
        this.setAuthButton();
    }

    setAuthButton() {
        const authContainer = this.htmlElement.querySelector("#auth-button-container") as HTMLSpanElement;

        if (UserData.is_logged_in) {
            authContainer.innerHTML = `
                <button
                    class="transparent circle"
                    id="profile-button"
                    onclick="ui('#profile-dialog')"
                >
                <img class="responsive" src="${UserData.profile_picture}" alt="Profile Picture" id="profile-picture" />
            </button>
            `;
        } else {
            authContainer.innerHTML = `
                <button
                    class="transparent circle s"
                    id="login-button"
                    onclick="ui('#login-modal')"
                >
                    <i>login</i>
                </button>
                <button
                    class="transparent m l"
                    id="login-button"
                    onclick="ui('#login-modal')"
                >
                    <i>login</i>
                    <span>Log in</span>
                </button>
            `;
        }
    }
}
