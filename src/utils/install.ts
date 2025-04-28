let installPrompt: BeforeInstallPromptEvent | null = null;

export {};

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isAppInstalled(): boolean {
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone
    );
}

function hideInstallUI() {
    document.querySelectorAll("#install").forEach((btn) => {
        btn.classList.add("hidden");
    });

    const snackbar = document.querySelector("#install-snackbar");
    if (snackbar) snackbar.classList.add("hidden");
}

function showInstallButton() {
    document.querySelectorAll("#install").forEach((btn) => {
        btn.classList.remove("hidden");
    });
}

function showInstallSnackbar() {
    ui("#install-snackbar");
}

async function handleInstallClick() {
    if (!installPrompt) return;
    try {
        const result = await installPrompt.prompt();
        console.log(`Install prompt outcome: ${result.outcome}`);
        if (result.outcome === "accepted") {
            installPrompt = null;
            hideInstallUI();
        }
    } catch (err) {
        console.error("Error showing install prompt:", err);
    }
}

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;

    if (!isAppInstalled()) {
        showInstallSnackbar();
        showInstallButton();
    } else {
        hideInstallUI();
    }
});

window.addEventListener("appinstalled", () => {
    installPrompt = null;
    hideInstallUI();
});

export function initInstall() {
    if (isAppInstalled()) {
        hideInstallUI();
    } else {
        showInstallButton();
    }
    document.querySelectorAll("#install").forEach((btn) => {
        btn.addEventListener("click", handleInstallClick);
    });

    const installSnackbarButton = document.getElementById(
        "install-snackbar-btn",
    );
    if (installSnackbarButton) {
        installSnackbarButton.addEventListener("click", handleInstallClick);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const installSnackBar = document.createElement("div");
    installSnackBar.innerHTML = `
        <div id="install-snackbar" class="snackbar">
            <div class="max">Install this app for a better experience!</div>
            <a id="install-snackbar-btn" class="inverse-link">Install</a>
        </div>`;
    document.body.appendChild(installSnackBar);
});
