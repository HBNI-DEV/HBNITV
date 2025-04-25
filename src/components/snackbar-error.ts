export class SnackbarError {
    htmlElement: HTMLElement;
    tagName: string;

    constructor(tagName: string, text: string, position: "top" | "bottom" = "bottom") {
        this.tagName = tagName;
        this.htmlElement = this.createElement(tagName, text, position);
        this.init();
    }

    private createElement(tag: string, text: string, position: string): HTMLElement {
        const existing = document.getElementById(tag);
        if (existing) existing.remove(); // remove old snackbar with same ID

        const snackbar = document.createElement("div");
        snackbar.className = `snackbar error ${position}`;
        snackbar.id = tag;

        const content = document.createElement("div");
        content.className = "max";
        content.textContent = text;

        snackbar.appendChild(content);
        return snackbar;
    }

    private init(): void {
        document.body.appendChild(this.htmlElement);
    }

    public show(duration: number = 6000, autoRemove: boolean = true): void {
        // use `ui()` method if globally defined
        if (typeof ui === "function") {
            ui(`#${this.tagName}`, duration);
        } else {
            console.warn("⚠️ UI function not available. Snackbar will not animate.");
        }

        if (autoRemove) {
            setTimeout(() => {
                this.htmlElement.remove();
            }, duration * 2);
        }
    }
}
