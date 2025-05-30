import "@utils/register-service-worker";
import { initInstall } from "@utils/install";
import { loadTheme, loadAnimationStyleSheet } from "@utils/theme";
import { Header } from "@components/header";
import { LoginDialog } from "@components/login-dialog";
import { NavigationDialog } from "@components/navigation-dialog";
import { ProfileDialog } from "@components/profile-dialog";
import { SnackbarLogin } from "@components/snackbar-login";

export async function initializeCoreUI() {

    mount(Header, "header");

    new SnackbarLogin();

    initDialogs([ProfileDialog, NavigationDialog, LoginDialog]);
    initInstall();

    try {
        await Promise.all([
            loadTheme(),
            delay(100).then(loadAnimationStyleSheet),
        ]);
    } catch (error) {
        console.error("⚠️ UI Core: Theme or animation failed to load", error);
    }
}

function mount(
    Component: new () => { htmlElement: HTMLElement },
    selector: string,
) {
    const target = document.querySelector(selector);
    if (target) {
        target.appendChild(new Component().htmlElement);
    } else {
        console.warn(`⚠️ UI Core: Missing selector ${selector}`);
    }
}

function initDialogs(Components: (new () => any)[]) {
    for (const Dialog of Components) {
        new Dialog(); // let the dialog handle appending to body
    }
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

window.addEventListener("pagehide", (event) => {
    if (event.persisted) {
        console.log("Saving state because we might go into bfcache...");
    }
});

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        console.log("Page was restored from bfcache instantly!");
    }
});
