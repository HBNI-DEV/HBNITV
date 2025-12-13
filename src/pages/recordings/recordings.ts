import { User } from "@models/user";
import { loadTheme } from "@utils/theme";
import { initializeCoreUI } from "@utils/ui-core";


let selectedOwners: string[] = [];
let selectedFolders: string[] = [];

function applyRecordingFilters() {
    const recordings = document.getElementById("recordings-container") as HTMLDivElement;
    const recordingsList = recordings.querySelectorAll(".recording") as NodeListOf<HTMLElement>;

    const searchInput = (document.getElementById("search-input") as HTMLInputElement).value.toLowerCase();
    const searchTerms = searchInput.length > 0
        ? [...new Set(searchInput.match(/"[^"]+"|\S+/g)?.map(s => s.replace(/^"|"$/g, "")) || [])]
        : [];

    const sectionWrappers = recordings.querySelectorAll("article[id^='recordings-']");
    sectionWrappers.forEach(section => section.classList.remove("hidden"));

    recordingsList.forEach(recording => {
        const recordingOwnerEmail = recording.dataset.ownerEmail || "";
        const recordingFolderId = recording.dataset.folderId || "";

        const title = (recording.querySelector("#title") as HTMLElement)?.innerText || "";
        const createdAt = (recording.querySelector("#created-at") as HTMLElement)?.innerText || "";
        const createdAtRelative = (recording.querySelector("#created-at-relative") as HTMLElement)?.innerText || "";
        const displayName = (recording.querySelector("#display-name") as HTMLElement)?.innerText || "";
        const email = (recording.querySelector("#email") as HTMLElement)?.innerText || "";

        const recordingText = (title + createdAt + createdAtRelative + displayName + email).toLowerCase();

        const matchesSearch =
            searchTerms.length === 0 ||
            searchTerms.every(term => recordingText.includes(term));
        const matchesFolder =
            selectedFolders.length === 0 ||
            selectedFolders.includes(recordingFolderId);

        const matchesOwner =
            selectedOwners.length === 0 ||
            selectedOwners.includes(recordingOwnerEmail);

        if (matchesSearch && matchesOwner && matchesFolder) {
            recording.classList.remove("hidden");
        } else {
            recording.classList.add("hidden");
        }
    });

    // Hide sections where all child recordings are hidden
    sectionWrappers.forEach(section => {
        const visibleRecordings = section.querySelectorAll(".recording:not(.hidden)");
        if (visibleRecordings.length === 0) {
            section.classList.add("hidden");
        } else {
            section.classList.remove("hidden");
        }
    });
}


document.addEventListener("DOMContentLoaded", () => {
    // document.body.classList.add("hidden");
    loadTheme();
    initializeCoreUI();

    if (User.is_logged_in) {
        const searchInput = document.getElementById("search-input") as HTMLInputElement;
        searchInput.addEventListener("input", () => {
            applyRecordingFilters();
        });

        // const ownersNav = document.getElementById("owners") as HTMLDivElement;
        // const owners = ownersNav.querySelectorAll(".chip") as NodeListOf<HTMLElement>;
        // owners.forEach(owner => {
        //     const ownerName = owner.dataset.ownerName as string;
        //     const ownerEmail = owner.dataset.ownerEmail as string;

        //     const checkIcon = owner.querySelector("i") as HTMLElement;
        //     const image = owner.querySelector("img") as HTMLImageElement;

        //     owner.addEventListener("click", () => {
        //         const isChecked = checkIcon.classList.contains("hidden");
        //         if (isChecked) {
        //             selectedOwners.push(ownerEmail);
        //             checkIcon.classList.remove("hidden");
        //             image.classList.add("hidden");
        //             owner.classList.add("fill")
        //         } else {
        //             selectedOwners = selectedOwners.filter(email => email !== ownerEmail);
        //             checkIcon.classList.add("hidden");
        //             image.classList.remove("hidden");
        //             owner.classList.remove("fill")
        //         }
        //         applyRecordingFilters();
        //     });
        // });
        document.querySelectorAll(".class-button").forEach(button => {
            const folderId = (button as HTMLElement).dataset.folderId!;
            const icon = button.querySelector("i")!;

            button.addEventListener("click", () => {
                const active = selectedFolders.includes(folderId);

                if (active) {
                    selectedFolders = selectedFolders.filter(id => id !== folderId);
                    icon.textContent = "folder_shared";
                    button.classList.remove("fill");
                } else {
                    selectedFolders.push(folderId);
                    icon.textContent = "check";
                    button.classList.add("fill");
                }

                applyRecordingFilters();
            });
        });

        document.querySelectorAll(".menu-button").forEach(button => {
            button.addEventListener("click", e => {
                e.stopPropagation();
            });
        });

        document.querySelectorAll("menu").forEach(menu => {
            menu.addEventListener("click", e => {
                const target = (e.target as HTMLElement).closest("li");
                if (!target) {
                    return;
                }
                e.stopPropagation();

                const id = target.dataset.id;
                const title = target.dataset.title;

                if (target.id === "copy-link-button") {
                    const link = `${location.origin}/recordings/watch?id=${id}`;
                    navigator.clipboard.writeText(link).then(() => {
                        ui("#copied-snackbar", 1000);
                    });
                }

                if (target.id === "share-button") {
                    const link = `${location.origin}/recordings/watch?id=${id}`;
                    if (navigator.share) {
                        navigator.share({
                            title: title || "Recording",
                            url: link
                        }).catch(console.error);
                    } else {
                        navigator.clipboard.writeText(link).then(() => {
                            console.log(`Copied (fallback): ${link}`);
                        });
                    }
                }
            });
        });
    }
    // document.body.classList.add("hidden");
});
