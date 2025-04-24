import { UserData } from "../utils/user";
import { Snackbar } from "./snackbar";
import { CookieManager } from "../utils/cookie-manager";

export class ProfileMenu {
    htmlElement: HTMLElement;
    tagName: string;
    constructor() {
        const template = document.createElement("template") as HTMLTemplateElement;
        const isStudent = UserData.role.includes("student");
        const roleLabel = UserData.role.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
        const icon = isStudent ? "person" : "security";
        template.innerHTML = `
        <dialog id="profile-dialog" class="no-padding">
            <div>
                <div class="fill padding">
                    <p class="no-margin">This account is managed by hbni.net.</p>
                    <p class="no-margin"><a class="link center-align" href="https://support.google.com/accounts/answer/181692" target="_blank">Learn more <i class="tiny tiny-margin">open_in_new</i></a></p>
                </div>
                <div class="padding">
                    <div class="row">
                        <div>
                            <img class="responsive circle" src="${UserData.profile_picture}" alt="Profile Picture" id="profile-picture" />
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
                        <button
                            class="small-round border"
                            id="logout-button"
                        >
                            <i>logout</i>
                            <span>Log out</span>
                        </button>
                    </nav>
                </div>
            </div>
        </dialog>
        `;
        this.tagName = "profile-menu-html";
        this.htmlElement = template.content.firstElementChild as HTMLElement;
        this.init();
    }

    init() {
        if (UserData.is_logged_in) {
            document.body.appendChild(this.htmlElement);
            const logoutButton = this.htmlElement.querySelector("#logout-button");
            if (logoutButton) {
                logoutButton.addEventListener("click", async () => {
                    try {
                        // This is because it does not show the login button because the serice worker caches the login state from when we were logged in.
                        // This is a hacky way to clear the cache.
                        if ("serviceWorker" in navigator) {
                            const registrations = await navigator.serviceWorker.getRegistrations();
                            for (const reg of registrations) {
                                await reg.unregister();
                            }
                        }

                        // Perform logout request
                        await fetch("/logout", { method: "GET", credentials: "same-origin" });

                        window.location.reload();
                    } catch (error) {
                        console.error("Logout failed:", error);
                    }
                });
            }
            // Show welcome message once every 12 hours
            const welcomeKey = "welcome_snackbar_last_shown";
            const lastShown = parseInt(CookieManager.getCookie(welcomeKey) || "0", 10);
            const now = Date.now();
            const twelveHours = 12 * 60 * 60 * 1000;

            if (now - lastShown > twelveHours) {
                const snackbar = new Snackbar("welcome-snackbar", `Welcome back, ${UserData.given_name}!`);
                snackbar.show(2000);
                CookieManager.setCookie(welcomeKey, String(now), 0.5); // 0.5 days = 12 hours
            }
        }
    }
}