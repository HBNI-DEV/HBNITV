import { CurikiMathAPI } from "@api/curiki-math-api";
import { initializeCoreUI } from "@utils/ui-core";

document.addEventListener("DOMContentLoaded", () => {
    // document.body.classList.add("hidden");
    initializeCoreUI();
    // document.body.classList.add("hidden");

    CurikiMathAPI.getAllOutcomes().then(outcomes => {
        console.log(outcomes);
    });
});
