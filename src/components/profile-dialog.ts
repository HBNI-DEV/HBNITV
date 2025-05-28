import { User } from "@models/user";
import { Snackbar } from "./snackbar";
import { CookieManager } from "@managers/cookie-manager";

export class ProfileDialog {
    htmlElement: HTMLDialogElement;
    tagName = "profile-dialog-html";

    constructor() {
        this.htmlElement = this.createElement();
        this.init();
    }

    private createElement(): HTMLDialogElement {
        const isStudent = User.role.includes("student");
        const roleLabel = this.formatRole(User.role);
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
                            <img class="responsive circle" width="96px" height="96px" src="/static/profiles/${User.user_id}.jpg" alt="Profile Picture" />
                        </div>
                        <div>
                            <p class="no-margin bold">${User.username}</p>
                            <p class="no-margin">${User.email}</p>
                            <nav class="vertical wrap no-space">
                                <div class="chip round tiny tiny-margin">
                                    <i>${icon}</i>
                                    <span>${roleLabel}</span>
                                </div>
                                <div class="chip round tiny green tiny-margin" id="internet-status-badge">
                                    <i>wifi</i>
                                    <span>Online</span>
                                </div>
                            </nav>
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
        if (!User.is_logged_in) return;

        document.body.appendChild(this.htmlElement);

        this.bindLogout();
        this.showWelcomeSnackbar();
        this.setupNetworkStatusBadge();
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

    private setupNetworkStatusBadge(): void {
        const badge = this.htmlElement.querySelector("#internet-status-badge") as HTMLElement;
        if (!badge) return;

        const updateBadge = () => {
            if (navigator.onLine) {
                badge.classList.remove("error");
                badge.classList.add("green");
                badge.innerHTML = `<i style="color: black;">wifi</i><span style="color: black;">Online</span>`;
            } else {
                badge.classList.remove("green");
                badge.classList.add("error");
                badge.innerHTML = `<i style="color: black;">wifi_off</i><span style="color: black;">Offline</span>`;
            }
        };

        updateBadge();

        window.addEventListener("online", updateBadge);
        window.addEventListener("offline", updateBadge);
    }

    private showWelcomeSnackbar() {
        const key = "welcome_snackbar_last_shown";
        const lastShown = parseInt(CookieManager.getCookie(key) || "0", 10);
        const now = Date.now();
        const twelveHours = 12 * 60 * 60 * 1000;

        if (now - lastShown > twelveHours) {
            new Snackbar("welcome-snackbar", `Welcome back, ${User.given_name}!`).show(2000);
            CookieManager.setCookie(key, String(now), 0.5); // 0.5 days = 12 hours
        }
    }
}
