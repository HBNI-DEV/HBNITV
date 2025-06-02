import { SettingsManager } from "@managers/settings-manager";
import { User } from "@models/user";
import { initializeCoreUI } from "@utils/ui-core";


let selectedOwners: string[] = [];

function showPage(pageId: string) {
    document.querySelectorAll(".page").forEach((el) => {
        el.classList.remove("active");
    });
    const page = document.querySelector(pageId);
    if (page) page.classList.add("active");

    const tabs = document.getElementById("tabs") as HTMLDivElement;
    const anchors = tabs.querySelectorAll("a");
    anchors.forEach((anchor) => {
        anchor.classList.remove("active");
        if (anchor.getAttribute("data-ui") === pageId) {
            anchor.classList.add("active");
        }
    });
}

function applyRecordingFilters() {
    const recordings = document.getElementById("recordings") as HTMLDivElement;
    const recordingsList = recordings.querySelectorAll(".recording") as NodeListOf<HTMLElement>;

    const searchInput = (document.getElementById("search-input") as HTMLInputElement).value.toLowerCase().trim();
    const searchTerms = searchInput.length > 0 ? searchInput.split(" ") : [];

    recordingsList.forEach(recording => {
        const recordingOwnerEmail = recording.dataset.ownerEmail || "";

        const title = (recording.querySelector("#title") as HTMLElement)?.innerText || "";
        const createdAt = (recording.querySelector("#created-at") as HTMLElement)?.innerText || "";
        const createdAtRelative = (recording.querySelector("#created-at-relative") as HTMLElement)?.innerText || "";
        const displayName = (recording.querySelector("#display-name") as HTMLElement)?.innerText || "";
        const email = (recording.querySelector("#email") as HTMLElement)?.innerText || "";

        const recordingText = (title + createdAt + createdAtRelative + displayName + email).toLowerCase();

        const matchesSearch =
            searchTerms.length === 0 ||
            searchTerms.every(term => recordingText.includes(term));

        const matchesOwner =
            selectedOwners.length === 0 ||
            selectedOwners.includes(recordingOwnerEmail);

        if (matchesSearch && matchesOwner) {
            recording.classList.remove("hidden");
        } else {
            recording.classList.add("hidden");
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    document.body.classList.add("hidden");
    await initializeCoreUI();

    const settings = new SettingsManager();
    const savedTab = await settings.getSetting("last_active_recordings_tab", "#this-week") as string;

    if (User.is_logged_in) {
        showPage(savedTab);
        const tabs = document.getElementById("tabs") as HTMLDivElement;
        const anchors = tabs.querySelectorAll("a");
        anchors.forEach((anchor) => {
            anchor.addEventListener("click", async () => {
                const dataUi = anchor.getAttribute("data-ui");
                await settings.saveSetting("last_active_recordings_tab", dataUi);
            });
        });

        const searchInput = document.getElementById("search-input") as HTMLInputElement;
        searchInput.addEventListener("input", () => {
            applyRecordingFilters();
        });

        const ownersNav = document.getElementById("owners") as HTMLDivElement;
        const owners = ownersNav.querySelectorAll(".chip") as NodeListOf<HTMLElement>;
        owners.forEach(owner => {
            const ownerName = owner.dataset.ownerName as string;
            const ownerEmail = owner.dataset.ownerEmail as string;

            const checkIcon = owner.querySelector("i") as HTMLElement;
            const image = owner.querySelector("img") as HTMLImageElement;

            owner.addEventListener("click", () => {
                const isChecked = checkIcon.classList.contains("hidden");
                if (isChecked) {
                    selectedOwners.push(ownerEmail);
                    checkIcon.classList.remove("hidden");
                    image.classList.add("hidden");
                    owner.classList.add("fill")
                } else {
                    selectedOwners = selectedOwners.filter(email => email !== ownerEmail);
                    checkIcon.classList.add("hidden");
                    image.classList.remove("hidden");
                    owner.classList.remove("fill")
                }
                applyRecordingFilters();
            });
        });

    }
    document.body.classList.remove("hidden");
});
