import { Snackbar } from "./snackbar";

interface UserInfo {
    given_name: string;
    family_name: string;
    password: string;
    email: string;
}

export class AccountRegisteredDialog {
    htmlElement: HTMLDialogElement;
    tagName = "account-registered-html";
    userInfo: UserInfo;

    constructor(userInfo: UserInfo) {
        this.userInfo = userInfo;
        this.htmlElement = this.createElement();
        this.init();
    }

    private createElement(): HTMLDialogElement {
        const dialog = document.createElement("dialog");
        dialog.className = "modal";
        dialog.id = "account-registered-dialog";
        dialog.innerHTML = `
            <h6 class="max">Account registered successfully for, <span class="bold">${this.userInfo.given_name}</span>!</h6>
            <div class="row">
                <div class="max">
                    <p class="no-line">Email: <code class="small-round">${this.userInfo.email}</code></p>
                    <p class="no-line">Password: <code class="small-round">${this.userInfo.password}</code></p>
                </div>
            </div>
            <nav class="right-align">
                <button class="transparent link" data-action="close">
                    <span>Close</span>
                </button>
                <button class="transparent link" data-action="copy">
                    <span>Copy</span>
                </button>
            </nav>
        `;
        return dialog;
    }

    private init(): void {
        document.body.appendChild(this.htmlElement);
        this.resize();

        window.addEventListener("resize", this.resize.bind(this));

        this.htmlElement.querySelector('[data-action="copy"]')?.addEventListener("click", () => {
            navigator.clipboard.writeText(this.getCredentials());
            new Snackbar("register-snackbar", "Credentials copied to clipboard!").show(2000);
        });

        this.htmlElement.querySelector('[data-action="close"]')?.addEventListener("click", () => {
            ui("#account-registered-dialog");
        });
    }

    public show(): void {
        ui("#account-registered-dialog");
    }

    private resize(): void {
        if (window.innerWidth < 600) {
            this.htmlElement.classList.add("bottom");
        } else {
            this.htmlElement.classList.remove("bottom");
        }
    }

    private getCredentials(): string {
        return `Email: ${this.userInfo.email}\nPassword: ${this.userInfo.password}`;
    }
}
