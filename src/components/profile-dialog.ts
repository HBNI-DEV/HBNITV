import { UserData } from "@utils/user";
import { Snackbar } from "./snackbar";
import { CookieManager } from "@utils/cookie-manager";

export class ProfileDialog {
    htmlElement: HTMLDialogElement;
    tagName = "profile-dialog-html";

    constructor() {
        this.htmlElement = this.createElement();
        this.init();
    }

    private createElement(): HTMLDialogElement {
        const isStudent = UserData.role.includes("student");
        const roleLabel = this.formatRole(UserData.role);
        const icon = isStudent ? "person" : "security";

        const dialog = document.createElement("dialog");
        dialog.id = "profile-dialog";
        dialog.className = "no-padding";
        dialog.innerHTML = `
            <div>
                <div class="fill padding">
                    <p class="no-margin">This account is managed by hbni.net.</p>
                    <p class="no-margin">
                        <a class="link center-align" href="https://support.google.com/accounts/answer/181692" target="_blank">
                            Learn more <i class="tiny tiny-margin">open_in_new</i>
                        </a>
                    </p>
                </div>
                <div class="padding">
                    <div class="row">
                        <div>
                            <img class="responsive circle" src="${UserData.profile_picture}" alt="Profile Picture" />
                        </div>
                        <div>
                            <p class="no-margin bold">${UserData.username}</p>
                            <p class="no-margin">${UserData.email}</p>
                            <div class="badge none tiny small-round no-margin">
                                <i>${icon}</i>
                                <span>${roleLabel}</span>
                            </div>
                        </div>
                    </div>
                    <hr class="margin">
                    <nav class="right-align">
                        <button class="small-round border" id="logout-button">
                            <i>logout</i>
                            <span>Log out</span>
                        </button>
                    </nav>
                </div>
            </div>
        `;
        return dialog;
    }

    private formatRole(role: string): string {
        return role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    }

    private async init() {
        if (!UserData.is_logged_in) return;

        document.body.appendChild(this.htmlElement);

        this.bindLogout();
        this.showWelcomeSnackbar();
    }

    private bindLogout() {
        const logoutBtn = this.htmlElement.querySelector("#logout-button");
        logoutBtn?.addEventListener("click", async () => {
            try {
                // Unregister all service workers (to reset state)
                if ("serviceWorker" in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (const reg of registrations) await reg.unregister();
                }

                await fetch("/api/logout", {
                    method: "GET",
                    credentials: "same-origin",
                });

                window.location.reload();
            } catch (error) {
                console.error("🚫 Logout failed:", error);
            }
        });
    }

    private showWelcomeSnackbar() {
        const key = "welcome_snackbar_last_shown";
        const lastShown = parseInt(CookieManager.getCookie(key) || "0", 10);
        const now = Date.now();
        const twelveHours = 12 * 60 * 60 * 1000;

        if (now - lastShown > twelveHours) {
            new Snackbar("welcome-snackbar", `Welcome back, ${UserData.given_name}!`).show(2000);
            CookieManager.setCookie(key, String(now), 0.5); // 0.5 days = 12 hours
        }
    }
}
