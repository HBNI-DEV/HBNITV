export class NavigationDialog {
    htmlElement: HTMLElement;
    tagName: string;
    constructor() {
        const template = document.createElement("template") as HTMLTemplateElement;
        template.innerHTML = `
            <dialog class="left medium-width no-padding" id="navigation-dialog">
                <nav class="row no-space small-margin">
                    <button class="circle transparent" onclick="ui('#navigation-dialog')">
                        <i>close</i>
                    </button>
                    <a class="fill border tiny-padding tiny-margin small-round center-align middle-align" href="/">
                        <h6><span class="bold">HBNI</span> <span>ITV</span></h6>
                    </a>
                </nav>
                <hr class="tiny-margin">
                <div class="padding">
                    <nav class="vertical tabs no-space no-border">
                        <a class="round left-align" href="/news">
                            <i>news</i>
                            <span>News</span>
                        </a>
                        <a class="round left-align" href="/calendar">
                            <i>calendar_today</i>
                            <span>Calendar</span>
                        </a>
                        <a class="round left-align" href="/classes">
                            <i>video_library</i>
                            <span>Classes</span>
                        </a>
                        <a class="round left-align" href="/contact">
                            <i>contact_mail</i>
                            <span>Contact</span>
                        </a>
                        <a class="round left-align" href="/settings">
                            <i>settings</i>
                            <span>Preferences</span>
                        </a>
                    </nav>
                </div>
                <hr class="tiny-margin">
            </dialog>
        `;
        this.tagName = "navigation-dialog-html";
        this.htmlElement = template.content.firstElementChild as HTMLElement;
        this.init();
    }

    init() {
        document.body.appendChild(this.htmlElement);
    }
}