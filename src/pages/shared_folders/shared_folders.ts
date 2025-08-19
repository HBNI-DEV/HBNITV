import { initializeCoreUI } from "@utils/ui-core";

document.addEventListener("DOMContentLoaded", () => {
    initializeCoreUI();
    const editButton = document.querySelector("#edit-button") as HTMLButtonElement;
    const saveButton = document.querySelector("#save-button") as HTMLButtonElement;
    const allFolders = document.querySelectorAll(".shared-folder") as NodeListOf<HTMLElement>;
    const deleteButtons = document.querySelectorAll(".delete-folder-button") as NodeListOf<HTMLButtonElement>;
    const allTextareaDivs = document.querySelectorAll(".field.textarea") as NodeListOf<HTMLElement>;
    const allAllowedAccountsList = document.querySelectorAll(".allowed-accounts-list") as NodeListOf<HTMLElement>;

    deleteButtons.forEach(deleteButton => {
        deleteButton.addEventListener("click", () => {
            const areYouSure = confirm("Are you sure you want to delete this folder? (Note: This does not actually delete the Google Drive folder)");
            if (!areYouSure) return;

            const folderId = deleteButton.dataset.folderId as string;
            fetch(`/api/shared-folders/delete/${folderId}`, {
                method: "DELETE",
            })
                .then(response => response.json())
                .then(data => {
                    ui("#deleted", 1000);
                    setTimeout(() => {
                        document.location.reload();
                    }, 1000);
                })
                .catch(error => console.error(error));
        });
    });

    editButton.addEventListener("click", () => {
        editButton.classList.add("hidden");
        saveButton.classList.remove("hidden");
        allTextareaDivs.forEach(textareaDiv => {
            textareaDiv.classList.remove("hidden");
        });
        allAllowedAccountsList.forEach(list => {
            list.classList.add("hidden");
        })
    });

    saveButton.addEventListener("click", () => {
        editButton.classList.remove("hidden");
        saveButton.classList.add("hidden");

        const folderData = [] as { folderId: string, allowedAccounts: string[] }[];

        allFolders.forEach(folder => {
            const folderId = folder.dataset.folderId as string;
            const textarea = folder.querySelector("textarea") as HTMLTextAreaElement;
            const allowedAccounts = textarea.value
                .split(/[\n,]+/) // Split by newline or comma
                .map(account => account.trim())
                .filter(account => account !== ""); // Remove empty strings

            folderData.push({ folderId, allowedAccounts });
        });

        const jsonData = JSON.stringify(folderData);

        // Send the JSON data to the server
        fetch("/api/update-folders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: jsonData,
        })
            .then(response => response.json())
            .then(data => {
                ui("#saved", 1000);
                setTimeout(() => {
                    document.location.reload();
                }, 1000);
            })
            .catch(error => console.error(error));
    });

    allFolders.forEach(folder => {
        const folderId = folder.dataset.folderId as string;
        const textarea = folder.querySelector("textarea") as HTMLTextAreaElement;
    });
});
