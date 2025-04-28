export class NavigationDialog {
    navMedium: HTMLElement;
    dialogElement: HTMLDialogElement;

    constructor() {
        const navMedium = this.createNavs();
        this.navMedium = navMedium;
        this.dialogElement = this.createDialog();
        this.init();
    }

    private createNavs() {
        const navMedium = document.createElement("nav");
        navMedium.className = "left m l surface-container";
        navMedium.innerHTML = `
            <header class="surface-container">
                <img src="/static/icons/icon-192.png" class="circle">
            </header>
            ${this.links()}
        `;

        return navMedium;
    }

    private createDialog(): HTMLDialogElement {
        const dialog = document.createElement("dialog");
        dialog.id = "navigation-dialog";
        dialog.className = "left medium-width no-padding s";
        dialog.innerHTML = `
            <nav class="row no-space small-margin">
                <button id="close-dialog-btn" class="circle transparent" type="button">
                    <i>close</i>
                </button>
                <a class="fill border tiny-padding tiny-margin small-round center-align middle-align" href="/">
                    <h6><span class="bold">HBNI</span> <span>ITV</span></h6>
                </a>
            </nav>
            <hr class="tiny-margin">
            <div class="padding">
                <nav class="drawer">
                    ${this.links()}
                </nav>
            </div>
            <hr class="tiny-margin">
        `;
        return dialog;
    }

    private links(): string {
        return `
            ${this.link("news", "news", "News")}
            ${this.link("calendar", "calendar_today", "Calendar")}
            ${this.link("classes", "video_library", "Classes")}
            ${this.link("contact", "contact_mail", "Contact")}
            ${this.link("settings", "settings", "Settings")}
            <a id="install">
                <i>download</i>
                <span>Install</span>
            </a>
        `;
    }

    private link(href: string, icon: string, label: string): string {
        return `
            <a href="/${href}">
                <i>${icon}</i>
                <span>${label}</span>
            </a>
        `;
    }

    private init(): void {
        document.body.appendChild(this.navMedium);
        document.body.appendChild(this.dialogElement);

        const closeBtn = this.dialogElement.querySelector("#close-dialog-btn");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                ui("#navigation-dialog");
            });
        }
    }
}
