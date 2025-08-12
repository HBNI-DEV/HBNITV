
import { setTheme, setMode, triggerThemeTransition } from '@utils/theme';
import { initializeCoreUI } from "@utils/ui-core";

function load() {
    const themeButtons = document.querySelectorAll("#theme-button") as NodeListOf<HTMLButtonElement>;
    themeButtons.forEach(button => {
        button.addEventListener("click", () => {
            triggerThemeTransition();
            const color = button.dataset.color as string;
            setTheme(color);
        });
    });

    const selectColorInput = document.querySelector("#select-color") as HTMLInputElement;
    selectColorInput.addEventListener("change", () => {
        triggerThemeTransition();
        const color = selectColorInput.value;
        setTheme(color);
    });

    const lightModeButton = document.querySelector("#light-theme") as HTMLInputElement;
    lightModeButton.addEventListener("click", () => {
        triggerThemeTransition();
        setMode("light");
    });

    const darkModeButton = document.querySelector("#dark-theme") as HTMLInputElement;
    darkModeButton.addEventListener("click", () => {
        triggerThemeTransition();
        setMode("dark");
    });

    const sameAsDeviceButton = document.querySelector("#same-as-device") as HTMLInputElement;
    sameAsDeviceButton.addEventListener("click", () => {
        triggerThemeTransition();
        setMode("auto");
    });

    const savedMode = localStorage.getItem("mode") || "auto";
    const savedTheme = localStorage.getItem("theme") || "#006493";

    if (savedMode === "auto") {
        sameAsDeviceButton.checked = true;
    } else if (savedMode === "dark") {
        darkModeButton.checked = true;
    } else {
        lightModeButton.checked = true;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // document.body.classList.add("hidden");
    initializeCoreUI();
    load();
    // document.body.classList.add("hidden");
});
