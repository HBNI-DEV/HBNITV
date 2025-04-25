export class Snackbar {
    htmlElement: HTMLElement;
    tagName: string;

    constructor(tagName: string, text: string, position: "top" | "bottom" = "bottom") {
        this.tagName = tagName;
        this.htmlElement = this.createElement(tagName, text, position);
        this.init();
    }

    private createElement(id: string, text: string, position: string): HTMLElement {
        document.getElementById(id)?.remove();
        const el = document.createElement("div");
        el.className = `snackbar ${position}`;
        el.id = id;
        const content = document.createElement("div");
        content.className = "max";
        content.textContent = text;
        el.appendChild(content);
        return el;
    }

    private init(): void {
        document.body.appendChild(this.htmlElement);
    }

    public show(duration: number = 6000): void {
        if (typeof ui === "function") {
            ui(`#${this.tagName}`, duration);
        }
        setTimeout(() => this.htmlElement.remove(), duration * 2);
    }
}
