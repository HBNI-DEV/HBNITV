import { Snackbar } from "@components/snackbar";
import { SnackbarError } from "@components/snackbar-error";
import { AccountRegisteredDialog } from "@components/account-registered-dialog";
import { initializeCoreUI } from "@utils/ui-core";

const DOMAIN_NAME: string = "hbnitv.net";

function getColonyCodeName(colony: string): string {
    const parts = colony.split("-");
    return parts[parts.length - 1];
}

function updateEmailElement(firstName: string, lastName: string, colony: string) {
    const email = `${getColonyCodeName(colony)}-${firstName.toLowerCase().split(" ")[0]}@${DOMAIN_NAME}`;
    const emailElement = document.querySelector("#email") as HTMLInputElement;
    emailElement.value = email;
}

function load() {
    const colonyNameInput = document.querySelector("#organizational_unit") as HTMLInputElement;
    const firstNameInput = document.querySelector("#name") as HTMLInputElement;
    const colonyInitialsInput = document.querySelector("#colony_initials") as HTMLInputElement;

    firstNameInput.addEventListener("input", () => {
        updateEmailElement(firstNameInput.value, colonyInitialsInput.value, colonyNameInput.value);
    });

    colonyInitialsInput.addEventListener("input", () => {
        updateEmailElement(firstNameInput.value, colonyInitialsInput.value, colonyNameInput.value);
    });

    if (localStorage.getItem("colony")) {
        colonyNameInput.value = localStorage.getItem("colony") || "";
        colonyInitialsInput.value = getColonyCodeName(colonyNameInput.value.toUpperCase());
    }

    colonyNameInput.addEventListener("change", () => {
        localStorage.setItem("colony", colonyNameInput.value);
        colonyInitialsInput.value = getColonyCodeName(colonyNameInput.value.toUpperCase());
        updateEmailElement(firstNameInput.value, colonyInitialsInput.value, colonyNameInput.value);
    });

    updateEmailElement(firstNameInput.value, colonyInitialsInput.value, colonyNameInput.value);

    const form = document.querySelector("form") as HTMLFormElement;
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        await fetch("/api/register", {
            method: "POST",
            body: formData,
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    if (data.created) {
                        // const snackbar = new Snackbar("register-snackbar", data.message);
                        // snackbar.show(2000);
                        const accountRegisteredDialog = new AccountRegisteredDialog(data.user_info);
                        accountRegisteredDialog.show();
                    } else {
                        const snackbar = new Snackbar("register-snackbar", data.message);
                        snackbar.show(6000);
                    }
                } else {
                    const snackbar = new SnackbarError("register-snackbar-error", data.message);
                    snackbar.show(2000);
                }
            })
            .catch((err) => {
                const snackbar = new SnackbarError("register-snackbar-error", `Register failed: ${err}`);
                snackbar.show(2000);
                console.error("❌ Register failed:", err);
            });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // document.body.classList.add("hidden");
    initializeCoreUI();
    load();
    // document.body.classList.add("hidden");
});
