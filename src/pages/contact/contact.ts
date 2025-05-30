import { initializeCoreUI } from "@utils/ui-core";

document.addEventListener("DOMContentLoaded", async () => {
    document.body.classList.add("hidden");
    await initializeCoreUI();
    document.body.classList.remove("hidden");
});
