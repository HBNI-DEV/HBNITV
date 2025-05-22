import { initializeCoreUI } from "@utils/ui-core";
// import { ClassElement } from "@elements/class-element";

document.addEventListener("DOMContentLoaded", async () => {
    await initializeCoreUI();

    // const classes = document.getElementById("classes-page") as HTMLDivElement;

    // const response = await fetch('/api/classes', {
    //     method: "GET",
    //     headers: { "Content-Type": "application/json" },
    // });

    // if (!response.ok) {
    //     throw new Error(`Failed to save assignment: ${response.statusText}`);
    // }else{
    //     const json = await response.json();
    //     for (const file of json.files) {
    //         try {
    //             const classElement = await ClassElement.create(file.id);
    //             classes.appendChild(classElement.htmlElement);
    //             requestAnimationFrame(() => {
    //                 classElement.htmlElement.classList.add("show");
    //             });
    //         } catch (e) {
    //             console.error(`Failed to load class ${file.id}`, e);
    //         }
    //     }
    // }
});
