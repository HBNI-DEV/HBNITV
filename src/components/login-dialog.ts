import "beercss";
import "../utils/theme";
import "../utils/service-worker";
import { UserData } from "../utils/user";

export class LoginDialog  {
    scriptElement: HTMLScriptElement;
    loginDialog: HTMLDialogElement;
    tagName: string;

    constructor() {
        this.scriptElement = document.createElement("script");
        this.loginDialog = document.createElement("dialog");
        if (!UserData.is_logged_in) {
            this.createLoginScript();
            this.createLoginDialog();
        }
        this.tagName = "login-html";
    }
    createLoginDialog() {
        this.loginDialog.id = "login-modal";
        this.loginDialog.innerHTML = `
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
                    data-login_uri="/login"
                    data-context="signin"
                    data-ux_mode="popup"
                    data-itp_support="true">
                </div>
                <div class="g_id_signin" data-type="standard"></div>
            </div>
        `;
        document.body.appendChild(this.loginDialog);
    }

    createLoginScript() {
        this.scriptElement.innerHTML = `
            function handleGoogleLogin(response) {
                const token = response.credential;

                fetch("/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        token: token,
                    }),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.success) {
                            window.location.reload();
                        } else {
                            alert(data.message);
                        }
                    })
                    .catch((err) => {
                        console.error("❌ Login failed:", err);
                        alert("Login failed");
                    });
            }
        `;
        document.body.appendChild(this.scriptElement);
    }
}
