export class ClassElement {
    private id: string;
    private jsonData: any;
    htmlElement!: HTMLElement;

    private constructor(id: string) {
        this.id = id;
    }

    static async create(id: string): Promise<ClassElement> {
        const instance = new ClassElement(id);
        await instance.init();
        return instance;
    }

    private async getJsonData() {
        const response = await fetch(`/api/recordings?id=${this.id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            throw new Error(`Failed to load class: ${response.statusText}`);
        }

        return await response.json();
    }

    private async init() {
        this.jsonData = await this.getJsonData();
        this.htmlElement = this.createElement(this.jsonData);
        this.bindEvents();
    }

    private createElement(json_data: any): HTMLDetailsElement {
        const template = document.createElement("template");

        const createdDate = new Date(json_data.createdTime);
        const now = new Date();
        const daysAgo = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

        const readableDate = new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(createdDate);

        const relative = daysAgo === 0 ? "Today" : `${daysAgo} day${daysAgo !== 1 ? "s" : ""} ago`;

        template.innerHTML = `
        <article class="no-padding s12 m6 l4 fade-in round clickable" onclick="window.location.href='/watch_class?id=${this.id}'">
            <img class="responsive small top-round" src="/api/thumbnail?link=${json_data.thumbnailLink}" alt="Thumbnail" />
            <div class="padding">
                <p class="bold">${json_data.name}</p>
                <span style="color: var(--on-surface-variant);" id="created-at">${readableDate} <span style="opacity: 0.7;">(${relative})</span>
                </span>
                <nav class="row top-padding">
                    <img id="dialog-profile-picture" src="${json_data.owners[0].photoLink}" class="circle" alt="Profile Picture" />
                    <div class="max">
                        <h6 class="small bold">${json_data.owners[0].displayName}</h6>
                        <a href="mailto:${json_data.owners[0].emailAddress}" class="link" id="dialog-email">${json_data.owners[0].emailAddress}</a>
                    </div>
                </nav>
            </div>
        </article>
        `;
        return template.content.firstElementChild as HTMLDetailsElement;
    }

    bindEvents() {}
}
