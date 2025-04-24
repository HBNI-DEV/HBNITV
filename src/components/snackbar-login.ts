import { UserData } from "../utils/user";

export class SnackbarLogin {
    htmlElement: HTMLElement;
    tagName: string;
    constructor() {
        const template = document.createElement("template");
        template.innerHTML = `
        <div class="snackbar" id="login-snackbar">
            <div class="max">Welcome to HBNI ITV!</div>
                <div id="g_id_onload"
                    data-client_id="453511062592-hcnq2v5956hpktbgmi9605o09q007fo6.apps.googleusercontent.com"
                    data-callback="handleGoogleLogin"
                    data-auto_select="false"
                    data-login_uri="/login"
                    data-context="signin"
                    data-ux_mode="popup"
                    data-itp_support="true">
                </div>
                <div class="g_id_signin" data-type="standard"></div>
        </div>
        `;
        this.tagName = "login-snackbar-html";
        this.htmlElement = template.content.firstElementChild as HTMLElement;
        this.init();
    }

    init() {
        document.body.appendChild(this.htmlElement);
        if (!UserData.is_logged_in) {
            ui("#login-snackbar", -1);
        }
    }
}