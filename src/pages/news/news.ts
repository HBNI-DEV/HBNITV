import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";
import { initializeCoreUI } from "@utils/ui-core";
import { Editor } from "@toast-ui/editor";
import { SettingsManager } from "@managers/settings-manager";
import { User } from "@models/user";
import { News } from "@models/news";
import { NewsAPI } from "@api/news-api";
import { Snackbar } from "@components/snackbar";
import { SnackbarError } from "@components/snackbar-error";



document.addEventListener("DOMContentLoaded", async () => {
    await initializeCoreUI();
    const settings = new SettingsManager();

    if (!User.role.includes("student")) {
        let editorTheme = await settings.getSetting("mode", "dark");
        if (editorTheme === "auto") {
            editorTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }

        // Get saved content from settings
        const savedContent = await settings.getSetting("toast_editor_content", "# Hello, World!");

        const editor = new Editor({
            el: document.querySelector("#editor") as HTMLElement,
            previewStyle: "vertical",
            height: "500px",
            initialEditType: "markdown",
            initialValue: savedContent,
            usageStatistics: false,
            theme: editorTheme,
        });

        // Save on change using SettingsManager
        editor.on("change", async () => {
            const markdown = editor.getMarkdown();
            await settings.saveSetting("toast_editor_content", markdown);
        });

        async function postNews() {
            const content = editor.getMarkdown();
            const news = new News();
            news.id = Date.now().toString();
            news.content = content;
            news.user_info = User;
            NewsAPI.saveNews(news)
                .then(() => {
                    const snackbar = new Snackbar("post-snackbar", "News posted!");
                    snackbar.show(2000);
                    setTimeout(() => window.location.reload(), 1000);
                })
                .catch((error) => {
                    console.error("Failed to save news:", error);
                    const snackbar = new SnackbarError("post-snackbar-error", "Failed to post news");
                    snackbar.show(2000);
                });
        }

        document.getElementById("post-button")?.addEventListener("click", async () => {
            await postNews();
        });

        // Clear button
        document.getElementById("clear-editor")?.addEventListener("click", async () => {
            const confirmed = confirm("Are you sure you want to clear the editor? This will delete your saved work.");
            if (confirmed) {
                await settings.deleteSetting("toast_editor_content");
                editor.setMarkdown("");
            }
        });
    }
});
