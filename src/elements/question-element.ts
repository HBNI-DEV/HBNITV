import { Question } from "@models/question";
const katex = require('katex');

export class QuestionElement {
    htmlElement: HTMLElement;
    question: Question;
    questionNumber: number;

    worthElement: HTMLInputElement;
    pageSpaceElement: HTMLSelectElement;
    typeElement: HTMLSelectElement;
    questionElement: HTMLTextAreaElement;
    latexPreviewElement: HTMLElement;
    answerElement: HTMLTextAreaElement;

    constructor(questionNumber: number = 1) {
        this.questionNumber = questionNumber;
        this.question = new Question();
        this.question.questionNumber = questionNumber;

        this.htmlElement = this.createElement();

        this.worthElement = this.htmlElement.querySelector("#worth") as HTMLInputElement;
        this.pageSpaceElement = this.htmlElement.querySelector("#pageSpace") as HTMLSelectElement;
        this.typeElement = this.htmlElement.querySelector("#type") as HTMLSelectElement;
        this.questionElement = this.htmlElement.querySelector("#question") as HTMLTextAreaElement;
        this.answerElement = this.htmlElement.querySelector("#answer") as HTMLTextAreaElement;
        this.latexPreviewElement = this.htmlElement.querySelector("#latex-preview") as HTMLElement;

        this.bindEvents();
        this.bindQuestionChange();
    }

    private createElement(): HTMLElement {
        const template = document.createElement("template");
        template.innerHTML = `
        <details class="question" open>
            <summary>
                <article class="round primary no-elevate">
                    <nav>
                        <h5 class="max">Question ${this.questionNumber}</h5>
                        <i>expand_more</i>
                    </nav>
                </article>
            </summary>
            <article class="grid round border">
                <div class="s12 m6 l6 small-round field label border">
                    <input type="number" id="worth" name="worth" value="5" />
                    <label for="worth">Worth</label>
                </div>
                <div class="s12 m6 l6 small-round field label suffix border">
                    <select name="pageSpace" id="pageSpace">
                        <option value="0.3">Third of Page</option>
                        <option value="0.5" selected>Half Page</option>
                        <option value="1">Full Page</option>
                    </select>
                    <label for="pageSpace">Page Space</label>
                    <i>arrow_drop_down</i>
                </div>
                <div class="s12 m12 l12 small-round field min textarea label border">
                    <textarea id="question" name="question" autocapitalize="words"></textarea>
                    <label for="question">Question</label>
                    <span class="helper no-line">LaTeX is supported. See supported <a class="link underline" href="https://katex.org/docs/supported" target="_blank">functions</a> and table of <a class="link underline" href="https://katex.org/docs/support_table" target="_blank">symbols</a>.</span>
                </div>
                <details class="s12 m12 l12" open>
                    <summary>
                        <i>arrow_drop_down</i>
                        <span>Preview</span>
                    </summary>
                    <div class="padding border small-round KaTeX-display" id="latex-preview"></div>
                </details>
                <div class="s12 m12 l12 small-round field textarea label border">
                    <textarea id="answer" name="answer" autocapitalize="words"></textarea>
                    <label for="answer">Answer</label>
                </div>
            </article>
        </details>
        `;
        return template.content.firstElementChild as HTMLElement;
    }

    private bindEvents() {
        this.worthElement.addEventListener("input", () => {
            this.question.worth = parseInt(this.worthElement.value, 10) || 0;
        });
        this.pageSpaceElement.addEventListener("change", () => {
            this.question.questionSpace = parseFloat(this.pageSpaceElement.value);
        });
        this.questionElement.addEventListener("input", () => {
            this.question.question = this.questionElement.value;
            this.updateLatexPreview();
        });
        this.answerElement.addEventListener("input", () => {
            this.question.answer = this.answerElement.value;
        });
    }

    private updateLatexPreview() {
        const input = this.questionElement.value.trim();
        if (!input) {
            this.latexPreviewElement.innerHTML = "";
            return;
        }

        let output = "";
        let cursor = 0;
        const regex = /\$\$[^$]*\$\$|\$[^$]*\$/g;
        let match: RegExpExecArray | null;

        try {
            while ((match = regex.exec(input)) !== null) {
                const start = match.index;
                const end = regex.lastIndex;

                const normalText = input.slice(cursor, start);
                if (normalText) {
                    output += `<span class="text">${this.escapeHtml(normalText)}</span>`;
                }

                const token = match[0];
                const isBlock = token.startsWith('$$');
                const latexContent = token.slice(isBlock ? 2 : 1, isBlock ? -2 : -1);

                const rendered = katex.renderToString(latexContent, {
                    throwOnError: false,
                    displayMode: isBlock,
                    output: "mathml"
                });

                if (isBlock) {
                    output += `<span class="math block fade-in">${rendered}</span>`;
                } else {
                    output += `<span class="math inline fade-in">${rendered}</span>`;
                }

                cursor = end;
            }

            const remainingText = input.slice(cursor);
            if (remainingText) {
                output += `<span class="text">${this.escapeHtml(remainingText)}</span>`;
            }

            this.latexPreviewElement.innerHTML = output;
            this.latexPreviewElement.classList.remove("error-preview");
        } catch (error: any) {
            console.error("KaTeX rendering failed", error);
            this.latexPreviewElement.innerHTML = `<span class="text">${this.escapeHtml(input)}</span>`;
            this.latexPreviewElement.classList.add("error-preview");
        }
    }


    private escapeHtml(text: string): string {
        const div = document.createElement("div");
        div.innerText = text;
        return div.innerHTML;
    }

    private bindQuestionChange() {
        this.question.onChange((changedQuestion) => {
            const event = new CustomEvent("questionChanged", {
                detail: { question: changedQuestion }
            });
            this.htmlElement.dispatchEvent(event);
        });
    }
}
