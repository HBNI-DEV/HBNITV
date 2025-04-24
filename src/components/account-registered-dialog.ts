import { Snackbar } from "./snackbar";

interface UserInfo {
    given_name: string;
    family_name: string;
    password: string;
    email: string;
}

export class AccountRegisteredDialog {
    htmlElement: HTMLElement;
    tagName: string;
    userInfo: UserInfo;
    copyButton: HTMLButtonElement;

    constructor(userInfo: UserInfo) {
        const template = document.createElement("template");
        template.innerHTML = `
        <dialog class="bottom modal" id="account-registered-dialog">
            <h6 class="max">Account registered successfully for, <span class="bold">${userInfo.given_name}</span>!</h6>
            <div class="row">
                <div class="max">
                    <p class="no-line">Email: <code class="small-round">${userInfo.email}</code></p>
                    <p class="no-line">Password: <code class="small-round">${userInfo.password}</code></p>
                </div>
            </div>
            <nav class="right-align">
                <button class="transparent link" onclick="ui('#account-registered-dialog')">
                    <span>Close</span>
                </button>
                <button class="transparent link" id="copy-button">
                    <span>Copy</span>
                </button>
            </nav>
        </dialog>
        `;
        this.userInfo = userInfo;
        this.tagName = "account-registered-html";
        this.htmlElement = template.content.firstElementChild as HTMLElement;
        this.copyButton = this.htmlElement.querySelector("#copy-button") as HTMLButtonElement;
        this.init();
    }

    init() {
        window.addEventListener("resize", () => {
            this.resize();
        });
        this.copyButton.addEventListener("click", () => {
            navigator.clipboard.writeText(this.getCredentials())
            const snackbar = new Snackbar("register-snackbar", "Credentials copied to clipboard!");
            snackbar.show(2000);
        });

        document.body.appendChild(this.htmlElement);
        this.resize();
    }

    show() {
        ui("#account-registered-dialog");
    }

    resize() {
        if (window.innerWidth < 600) {
            this.htmlElement.classList.add("bottom");
        } else {
            this.htmlElement.classList.remove("bottom");
        }
    }

    getCredentials(): string {
        return `Email: ${this.userInfo.email}\nPassword: ${this.userInfo.password}`;
    }
}