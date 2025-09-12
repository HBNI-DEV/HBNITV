import { initializeCoreUI } from "@utils/ui-core";
import { SettingsManager } from "@managers/settings-manager";
import { User } from "@models/user";
import { News } from "@models/news";
import { NewsAPI } from "@api/news-api";
import { Snackbar } from "@components/snackbar";
import { SnackbarError } from "@components/snackbar-error";
import { PreviewStyle } from "@toast-ui/editor";

let Editor: typeof import('@toast-ui/editor').Editor;
let Viewer: typeof import('@toast-ui/editor/dist/toastui-editor-viewer').default;

async function loadToastUICSS() {
    const baseCSS = document.createElement("link");
    baseCSS.rel = "stylesheet";
    baseCSS.href = "https://cdn.jsdelivr.net/npm/@toast-ui/editor/dist/toastui-editor.css";

    const themeCSS = document.createElement("link");
    themeCSS.rel = "stylesheet";
    themeCSS.href = `https://cdn.jsdelivr.net/npm/@toast-ui/editor/dist/theme/toastui-editor-dark.css`;

    document.head.append(baseCSS, themeCSS);
}

async function loadEditorModules() {
    const editorModule = await import('@toast-ui/editor');
    const viewerModule = await import('@toast-ui/editor/dist/toastui-editor-viewer');

    Editor = editorModule.Editor;
    Viewer = viewerModule.default;

    initializePage();
}

let editorPage: CreateNewsPostPage | null = null;

async function initializePage() {
    const newsPage = new ViewNewsPage();
    if (User.role === "admin" || User.role === "super_admin") {
        await import("@toast-ui/editor");
        editorPage = new CreateNewsPostPage(newsPage);
        (window as any).editorPage = editorPage; // optional global access
    }
}

class ViewNewsPage {
    private mode: string = "light"
    private settings = new SettingsManager();
    private news: News[] = [];
    private currentPage = 0;
    private itemsPerPage = 25;

    latestNewsElement: HTMLElement;
    listNewsElement: HTMLElement;
    dialogElement!: HTMLDialogElement;
    dialogViewer?: InstanceType<typeof Viewer>;
    latestNewsViewer: InstanceType<typeof Viewer>;

    constructor() {
        this.latestNewsElement = document.getElementById("latest-news")!;
        this.listNewsElement = document.getElementById("list-news")!;
        this.latestNewsViewer = new Viewer({
            el: this.latestNewsElement,
            initialValue: "",
            theme: this.mode,
        });
        this.init();
    }

    async init() {
        this.mode = localStorage.getItem("mode") || "auto";
        if (this.mode === "auto") {
            this.mode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }

        await this.updateNewsPage();

        window.addEventListener("resize", () => {
            this.resizeDialog();
        });
        this.resizeDialog();
    }

    resizeDialog() {
        const dialog = document.querySelector("#news-dialog") as HTMLDialogElement;
        if (window.innerWidth <= 600) {
            dialog.classList.add("max");
        } else {
            dialog.classList.remove("max");
        }
    }

    async updateNewsPage() {
        this.news = await NewsAPI.getAllNews();

        if (this.news.length === 0) {
            this.listNewsElement.innerHTML = "<p>No news available.</p>";
            return;
        }

        this.news.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        this.renderLatestArticle(this.news[0]);
        this.createDialog();
        this.setupPaginationControls();
        this.renderNewsPage(this.currentPage);
    }

    private renderLatestArticle(news: News) {
        this.latestNewsElement.innerHTML = `
            <nav class="row">
                <img id="dialog-profile-picture" src="${news.user_info.profile_picture}" class="circle" alt="Profile Picture" />
                <div class="max">
                    <h6 class="small bold">${news.user_info.given_name} ${news.user_info.family_name}</h6>
                    <a href="mailto:${news.user_info.email}" class="link" id="dialog-email">${news.user_info.email}</a>
                </div>
                <button id="edit-latest-news-btn" class="circle border">
                    <i>edit</i>
                </button>
                <button class="circle border error" id="delete-latest-news-btn">
                    <i>delete</i>
                </button>
            </nav>
            <h5 id="dialog-title">${news.title}</h5>
            <span style="color: var(--on-surface-variant);" id="created-at">${news.createdAtReadable} (${news.createdAtRelative})</span>
            <div id="latest-news-viewer" style="z-index: 0 !important;"></div>
        `;

        const latestNewsViewer = this.latestNewsElement.querySelector("#latest-news-viewer") as HTMLElement;

        const editButton = this.latestNewsElement.querySelector("#edit-latest-news-btn") as HTMLButtonElement;
        const deleteButton = this.latestNewsElement.querySelector("#delete-latest-news-btn") as HTMLButtonElement;

        if (User.email === news.user_info.email || User.email === "jared@hbni.net" || User.email === "manager@hbni.net") {
            editButton.classList.remove("hidden");
            deleteButton.classList.remove("hidden");
        } else {
            editButton.classList.add("hidden");
            deleteButton.classList.add("hidden");
        }

        editButton.onclick = () => {
            showPage("#create-news-page");
            this.settings.saveSetting("toast_editor_content", news.content);
            this.settings.saveSetting("toast_editor_title", news.title);

            const ep = (window as any).editorPage as CreateNewsPostPage;
            ep.titleElement.value = news.title;
            ep.editor.setMarkdown(news.content);
            ep.currentNewsId = news.id;          // <-- reuse existing instance
            window.scrollTo({ top: 0, behavior: "smooth" });
        };

        deleteButton.onclick = () => {
            const areYouSure = confirm("Are you sure you want to delete this news post? This action cannot be undone.");
            if (areYouSure) {
                NewsAPI.deleteNews(news.id)
                    .then(() => {
                        const snackbar = new Snackbar("delete-snackbar", "News deleted!");
                        snackbar.show(2000);
                        setTimeout(() => window.location.reload(), 1000);
                    })
                    .catch((error) => {
                        console.error("Failed to delete news:", error);
                        const snackbar = new SnackbarError("delete-snackbar-error", "Failed to delete news");
                        snackbar.show(2000);
                    });
            }
        };
        this.latestNewsViewer = new Viewer({
            el: latestNewsViewer,
            initialValue: news.content,
            theme: this.mode,
        });
        requestAnimationFrame(() => {
            this.latestNewsElement.classList.add('show');
        });
    }

    private renderNewsArticle(news: News): HTMLElement {
        const htmlElement = document.createElement("template");
        htmlElement.innerHTML = `
            <article class="s12 m6 l4 round border no-space fade-in clickable">
                <h5 class="small">${news.title}</h5>
                <span style="color: var(--on-surface-variant);" id="created-at">${news.createdAtReadable} (${news.createdAtRelative})</span>
                <blockquote>${news.content.slice(0, 250)}...<button id="updated-button" class="badge none no-border no-padding no-margin transparent ripple hidden"><span style="color: var(--on-surface-variant);">(Edited)</span><div id="updated-at" class="tooltip">${news.updatedAtReadable} (${news.updatedAtRelative})</div></button></blockquote>
                <nav class="row top-margin">
                    <img class="circle" src="${news.user_info.profile_picture}" alt="Profile Picture" />
                    <div class="max">
                        <h6 class="small bold">${news.user_info.given_name} ${news.user_info.family_name}</h6>
                        <a href="mailto:${news.user_info.email}" class="link">${news.user_info.email}</a>
                    </div>
                </nav>
            </article>
        `;

        const articleElement = htmlElement.content.firstElementChild as HTMLElement;
        articleElement.addEventListener("click", () => this.openDialogWithArticle(news));

        const createdAt = articleElement.querySelector("#created-at") as HTMLSpanElement;
        createdAt.innerText = `${news.createdAtReadable} (${news.createdAtRelative})`;

        const updateButton = articleElement.querySelector("#updated-button") as HTMLButtonElement;
        if (news.updatedAt != news.createdAt) {
            updateButton.classList.remove("hidden");
        }

        return htmlElement.content.firstElementChild as HTMLElement;
    }

    private renderNewsPage(page: number) {
        this.listNewsElement.innerHTML = "";

        const startIndex = page * this.itemsPerPage + 1; // skip the first article
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.news.length);

        const pageArticles = this.news.slice(startIndex, endIndex);

        pageArticles.forEach((article, index) => {
            const articleElement = this.renderNewsArticle(article);
            this.listNewsElement.appendChild(articleElement);
            requestAnimationFrame(() => {
                articleElement.classList.add('show');
            });
        });

        this.updatePaginationControls();
    }

    private createDialog() {
        this.dialogElement = document.createElement("dialog");
        this.dialogElement.id = "news-dialog";
        this.dialogElement.className = "";
        this.dialogElement.innerHTML = `
            <nav>
                <button id="close-dialog-btn" class="circle no-border transparent">
                    <i>close</i>
                </button>
            </nav>
            <nav class="row top-margin">
                <img id="dialog-profile-picture" class="circle" alt="Profile Picture" />
                <div class="max">
                    <h6 class="small bold" id="dialog-username"></h6>
                    <a class="link" id="dialog-email"></a>
                </div>
                <button id="edit-btn" class="circle border">
                    <i>edit</i>
                </button>
                <button class="circle border error" id="delete-btn">
                    <i>delete</i>
                </button>
            </nav>
            <h5 id="dialog-title"></h5>
            <span style="color: var(--on-surface-variant);" id="created-at"></span>
            <div id="dialog-viewer"></div>
        `;
        const viewerContainer = this.dialogElement.querySelector("#dialog-viewer") as HTMLElement;

        const closeButton = this.dialogElement.querySelector("#close-dialog-btn") as HTMLButtonElement;
        closeButton.addEventListener("click", () => {
            ui("#news-dialog");
        });
        document.body.appendChild(this.dialogElement);
    }

    private async openDialogWithArticle(news: News) {
        if (!this.dialogViewer) {
            const { default: Viewer } = await import("@toast-ui/editor/dist/toastui-editor-viewer");
            const viewerContainer = this.dialogElement.querySelector("#dialog-viewer") as HTMLElement;
            this.dialogViewer = new Viewer({
                el: viewerContainer,
                theme: this.mode,
            });
        }

        this.dialogViewer.setMarkdown(news.content);

        const dialogTitle = this.dialogElement.querySelector("#dialog-title") as HTMLHeadingElement;
        dialogTitle.innerText = news.title;

        const profilePicture = this.dialogElement.querySelector("#dialog-profile-picture") as HTMLImageElement;
        profilePicture.src = news.user_info.profile_picture;

        const username = this.dialogElement.querySelector("#dialog-username") as HTMLHeadingElement;
        username.innerText = `${news.user_info.given_name} ${news.user_info.family_name}`;

        const email = this.dialogElement.querySelector("#dialog-email") as HTMLAnchorElement;
        email.href = `mailto:${news.user_info.email}`;
        email.innerText = news.user_info.email;

        const editButton = this.dialogElement.querySelector("#edit-btn") as HTMLButtonElement;
        const deleteButton = this.dialogElement.querySelector("#delete-btn") as HTMLButtonElement;
        if (User.email === news.user_info.email || User.email === "jared@hbni.net" || User.email === "manager@hbni.net") {
            editButton.classList.remove("hidden");
            deleteButton.classList.remove("hidden");
        } else {
            editButton.classList.add("hidden");
            deleteButton.classList.add("hidden");
        }

        editButton.onclick = () => {
            ui("#news-dialog");
            this.settings.saveSetting("toast_editor_content", news.content);
            this.settings.saveSetting("toast_editor_title", news.title);

            const ep = (window as any).editorPage as CreateNewsPostPage;
            ep.titleElement.value = news.title;
            ep.editor.setMarkdown(news.content);
            ep.currentNewsId = news.id;          // <-- reuse existing instance
            showPage("#create-news-page");
            window.scrollTo({ top: 0, behavior: "smooth" });
        };

        deleteButton.onclick = () => {
            const areYouSure = confirm("Are you sure you want to delete this news post? This action cannot be undone.");
            if (areYouSure) {
                NewsAPI.deleteNews(news.id)
                    .then(() => {
                        const snackbar = new Snackbar("delete-snackbar", "News deleted!");
                        snackbar.show(2000);
                        setTimeout(() => window.location.reload(), 1000);
                    })
                    .catch((error) => {
                        console.error("Failed to delete news:", error);
                        const snackbar = new SnackbarError("delete-snackbar-error", "Failed to delete news");
                        snackbar.show(2000);
                    });
            }
        }


        // const updatedAt = this.dialogElement.querySelector("#updated-at") as HTMLSpanElement;
        // updatedAt.innerText = article.updatedAt;

        const createdAt = this.dialogElement.querySelector("#created-at") as HTMLSpanElement;
        createdAt.innerText = `${news.createdAtReadable} (${news.createdAtRelative})`;

        ui("#news-dialog");
    }

    private setupPaginationControls() {
        const prevBtn = document.getElementById("prev-page-btn")!;
        const nextBtn = document.getElementById("next-page-btn")!;

        prevBtn.addEventListener("click", () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.renderNewsPage(this.currentPage);
            }
        });

        nextBtn.addEventListener("click", () => {
            const maxPages = Math.ceil((this.news.length - 1) / this.itemsPerPage);
            if (this.currentPage < maxPages - 1) {
                this.currentPage++;
                this.renderNewsPage(this.currentPage);
            }
        });
    }

    private updatePaginationControls() {
        const prevBtn = document.getElementById("prev-page-btn")! as HTMLButtonElement;
        const nextBtn = document.getElementById("next-page-btn")! as HTMLButtonElement;
        const maxPages = Math.ceil((this.news.length - 1) / this.itemsPerPage);

        prevBtn.disabled = this.currentPage === 0;
        nextBtn.disabled = this.currentPage >= maxPages - 1;
    }
}

class CreateNewsPostPage {
    editorElement: HTMLElement;
    postButtonElement: HTMLButtonElement;
    clearButtonElement: HTMLButtonElement;
    titleElement: HTMLInputElement;
    settings = new SettingsManager();
    editor!: InstanceType<typeof Editor>;
    newsPage: ViewNewsPage;
    currentNewsId: string | null = null;
    isMobile: boolean = false;
    previewStyle: PreviewStyle = "vertical";

    constructor(newsPage: ViewNewsPage) {
        this.newsPage = newsPage;
        this.editorElement = document.getElementById("editor") as HTMLElement;
        this.postButtonElement = document.getElementById("post-button") as HTMLButtonElement;
        this.clearButtonElement = document.getElementById("clear-editor") as HTMLButtonElement;
        this.titleElement = document.getElementById("news-title") as HTMLInputElement;
        this.isMobile = window.window.innerWidth <= 600;
        this.previewStyle = this.isMobile ? "tab" : "vertical";

        this.init();
    }

    async init() {
        document.querySelector("#editor")!.innerHTML = "";

        let [savedContent, savedTitle] = await Promise.all([
            this.settings.getSetting("toast_editor_content", "# Hello, World!"),
            this.settings.getSetting("toast_editor_title", "Hello, World!"),
        ]);
        let editorTheme = localStorage.getItem("mode") || "auto";

        if (editorTheme === "auto") {
            editorTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }

        this.titleElement.value = savedTitle as string;

        this.editor = new Editor({
            el: document.querySelector("#editor") as HTMLElement,
            previewStyle: this.previewStyle,
            height: "500px",
            initialEditType: "markdown",
            initialValue: savedContent,
            usageStatistics: false,
            theme: editorTheme,
        });
        this.bindEvents();
    }

    private bindEvents() {
        this.postButtonElement.addEventListener("click", () => this.postNews());
        this.clearButtonElement.addEventListener("click", () => this.clearEditor());
        this.titleElement.addEventListener("input", async () => {
            await this.settings.saveSetting("toast_editor_title", this.titleElement.value);
        });
        this.editor.on("change", async () => {
            const markdown = this.editor.getMarkdown();
            await this.settings.saveSetting("toast_editor_content", markdown);
        });
    }

    async postNews() {
        const content = this.editor.getMarkdown();
        const news = new News();
        if (this.currentNewsId) {
            news.id = this.currentNewsId;
        } else {
            news.id = Date.now().toString();
        }
        news.content = content;
        news.user_info = User;
        news.title = this.titleElement.value;
        NewsAPI.saveNews(news)
            .then(() => {
                const snackbar = new Snackbar("post-snackbar", `News ${this.currentNewsId ? "updated" : "posted"}!`);
                snackbar.show(2000);
                setTimeout(() => window.location.reload(), 1000);
                // this.currentNewsId = null;
            })
            .catch((error) => {
                console.error("Failed to save news:", error);
                const snackbar = new SnackbarError("post-snackbar-error", "Failed to post news");
                snackbar.show(2000);
                // this.currentNewsId = null;
            });
    }

    private async clearEditor() {
        const areYouSure = confirm("Are you sure you want to clear the editor?");
        if (areYouSure) {
            this.titleElement.value = "";
            this.editor.setMarkdown("");
            await this.settings.saveSetting("toast_editor_title", "");
            await this.settings.saveSetting("toast_editor_content", "");
            this.currentNewsId = null;
        }
    }
}

function showPage(pageId: string) {
    document.querySelectorAll(".page").forEach((el) => {
        el.classList.remove("active");
    });
    const page = document.querySelector(pageId);
    if (page) page.classList.add("active");

    document.querySelectorAll(".tabs a").forEach((tab) => {
        tab.classList.remove("active");
        if (tab.getAttribute("data-ui") === pageId) {
            tab.classList.add("active");
        }
    });

    document.querySelectorAll(".tabs a").forEach((tab) => {
        tab.addEventListener("click", async () => {
            const pageId = tab.getAttribute("data-ui")!;
            localStorage.setItem("last_active_news_tab", pageId);
        });
    });
}

function load() {
    // document.body.classList.add("hidden");

    Promise.all([
        loadToastUICSS(),
        loadEditorModules(),
    ]);

    const savedTab = localStorage.getItem("last_active_news_tab") || "#news-page";

    showPage(savedTab);

    document.querySelectorAll(".tabs a").forEach((tab) => {
        tab.classList.remove("active");
        if (tab.getAttribute("data-ui") === savedTab) {
            tab.classList.add("active");
        }
    });

    document.querySelectorAll(".tabs a").forEach((tab) => {
        tab.addEventListener("click", async () => {
            const pageId = tab.getAttribute("data-ui")!;
            localStorage.setItem("last_active_news_tab", pageId);
        });
    });
    // document.body.classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
    initializeCoreUI();
    load();
});
