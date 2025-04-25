import "beercss";
import "@utils/theme";
import "@utils/register-service-worker";
import { UserData } from "@utils/user";

export class LoginDialog {
    tagName = "login-html";
    htmlElement?: HTMLDialogElement;

    constructor() {
        if (!UserData.is_logged_in) {
            this.htmlElement = this.createDialog();
            document.body.appendChild(this.htmlElement);
            this.appendLoginScript();
        }
    }

    private createDialog(): HTMLDialogElement {
        const dialog = document.createElement("dialog");
        dialog.id = "login-modal";
        dialog.innerHTML = `
            <nav>
                <button class="circle transparent" onclick="ui('#login-modal')">
                    <i>close</i>
                </button>
                <h5>Login</h5>
            </nav>
            <div id="login-form">
                <div id="g_id_onload"
                    data-client_id="453511062592-hcnq2v5956hpktbgmi9605o09q007fo6.apps.googleusercontent.com"
                    data-callback="handleGoogleLogin"
                    data-auto_select="false"
                    data-login_uri="/api/login"
                    data-context="signin"
                    data-ux_mode="popup"
                    data-itp_support="true">
                </div>
                <div class="g_id_signin" data-type="standard"></div>
            </div>
        `;
        return dialog;
    }

    private appendLoginScript(): void {
        const script = document.createElement("script");
        script.textContent = `
            function handleGoogleLogin(response) {
                const token = response.credential;
                fetch("/api/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        token: token,
                    }),
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) window.location.reload();
                    else alert(data.message);
                })
                .catch(err => {
                    console.error("❌ Login failed:", err);
                    alert("Login failed");
                });
            }
        `;
        document.body.appendChild(script);
    }
}
