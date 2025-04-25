import "@utils/register-service-worker";

import { loadTheme, loadAnimationStyleSheet } from "@utils/theme";

import { Header } from "@components/header";
import { Tabs } from "@components/tabs";
import { LoginDialog } from "@components/login-dialog";
import { NavigationDialog } from "@components/navigation-dialog";
import { ProfileDialog } from "@components/profile-dialog";
import { SnackbarLogin } from "@components/snackbar-login";

export async function initializeCoreUI() {
    try {
        await Promise.all([
            loadTheme(),
            delay(100).then(loadAnimationStyleSheet),
        ]);
    } catch (error) {
        console.error("⚠️ UI Core: Theme or animation failed to load", error);
    }

    mount(Header, "header");
    mount(Tabs, "#tabs");

    new SnackbarLogin();

    initDialogs([ProfileDialog, NavigationDialog, LoginDialog]);
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
