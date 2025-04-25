export class NavigationDialog {
    htmlElement: HTMLDialogElement;
    tagName = "navigation-dialog";

    constructor() {
        this.htmlElement = this.createElement();
        this.init();
    }

    private createElement(): HTMLDialogElement {
        const dialog = document.createElement("dialog");
        dialog.id = this.tagName;
        dialog.className = "left medium-width no-padding";
        dialog.innerHTML = `
            <nav class="row no-space small-margin">
                <button class="circle transparent" type="button">
                    <i>close</i>
                </button>
                <a class="fill border tiny-padding tiny-margin small-round center-align middle-align" href="/">
                    <h6><span class="bold">HBNI</span> <span>ITV</span></h6>
                </a>
            </nav>
            <hr class="tiny-margin">
            <div class="padding">
                <nav class="vertical tabs no-space no-border">
                    ${this.link("news", "news", "News")}
                    ${this.link("calendar", "calendar_today", "Calendar")}
                    ${this.link("classes", "video_library", "Classes")}
                    ${this.link("contact", "contact_mail", "Contact")}
                    ${this.link("settings", "settings", "Preferences")}
                </nav>
            </div>
            <hr class="tiny-margin">
        `;
        return dialog;
    }

    private link(href: string, icon: string, label: string): string {
        return `
            <a class="round left-align" href="/${href}">
                <i>${icon}</i>
                <span>${label}</span>
            </a>
        `;
    }

    private init() {
        document.body.appendChild(this.htmlElement);

        const closeBtn = this.htmlElement.querySelector("button");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                ui(`#${this.tagName}`);
            });
        }
    }

    public show() {
        this.htmlElement.showModal();
    }

    public hide() {
        this.htmlElement.close();
    }
}
