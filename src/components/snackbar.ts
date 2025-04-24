export class Snackbar {
    htmlElement: HTMLElement;
    tagName: string;
    constructor(tagName: string, text: string, position: string="bottom") {
        const template = document.createElement("template");
        template.innerHTML = `
        <div class="snackbar ${position}" id="${tagName}">
            <div class="max">${text}</div>
        </div>
        `;
        this.tagName = tagName;
        this.htmlElement = template.content.firstElementChild as HTMLElement;
        this.init();
    }

    init() {
        document.body.appendChild(this.htmlElement);
    }

    show(millisecondsToHide?: number) {
        if (!millisecondsToHide) {
            millisecondsToHide = 6000;
        }

        ui(`#${this.tagName}`, millisecondsToHide);

        setTimeout(() => {
            this.htmlElement.remove();
        }, millisecondsToHide * 2);
    }
}