import "beercss";
import "@utils/register-service-worker";
import { LoginDialog } from "@components/login-dialog";
import { NavigationDialog } from "@components/navigation-dialog";
import { Tabs } from "@components/tabs";
import { ProfileMenu } from "@components/profile-dialog";
import { Header } from "@components/header";
import { loadAnimationStyleSheet, loadTheme } from "@utils/theme";
import { SnackbarLogin } from "@components/snackbar-login";

document.addEventListener("DOMContentLoaded", async () => {
    loadTheme()
        .then(() => {
            setTimeout(() => {
                loadAnimationStyleSheet();
            }, 100);
        })
        .catch((error) => {
            console.error(error);
        });

    const header = document.querySelector("header") as HTMLDivElement;
    if (header) {
        header.appendChild(new Header().htmlElement);
    }

    const tabs = document.querySelector("#tabs") as HTMLDivElement;
    if (tabs) {
        tabs.appendChild(new Tabs().htmlElement);
    }

    new NavigationDialog();
    new ProfileMenu();
    new LoginDialog();
    new SnackbarLogin();
});
