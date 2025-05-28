import { Question } from "@models/question";
const katex = require('katex');

export class QuestionElement {
    htmlElement: HTMLDetailsElement;
    questionItem: HTMLElement;
    question: Question;
    questionNumber: number;

    worthElement: HTMLInputElement;
    pageSpaceElement: HTMLSelectElement;
    typeElement: HTMLSelectElement;
    questionElement: HTMLTextAreaElement;
    latexPreviewElement: HTMLElement;
    answerElement: HTMLTextAreaElement;

    toggleQuestionButton: HTMLButtonElement;
    deleteQuestionButton: HTMLButtonElement;

    constructor(questionNumber: number = 1, question: Question) {
        this.questionNumber = questionNumber;
        this.question = question;
        // this.question.questionNumber = questionNumber;

        this.htmlElement = this.createElement();
        this.questionItem = this.htmlElement.querySelector(".question-item") as HTMLElement;
        this.worthElement = this.htmlElement.querySelector("#worth") as HTMLInputElement;
        this.pageSpaceElement = this.htmlElement.querySelector("#pageSpace") as HTMLSelectElement;
        this.typeElement = this.htmlElement.querySelector("#type") as HTMLSelectElement;
        this.questionElement = this.htmlElement.querySelector("#question") as HTMLTextAreaElement;
        this.answerElement = this.htmlElement.querySelector("#answer") as HTMLTextAreaElement;
        this.latexPreviewElement = this.htmlElement.querySelector("#latex-preview") as HTMLElement;
        this.toggleQuestionButton = this.htmlElement.querySelector("#toggle-question") as HTMLButtonElement;
        this.deleteQuestionButton = this.htmlElement.querySelector("#delete-question") as HTMLButtonElement;

        this.bindEvents();
        this.bindQuestionChange();
        this.updateLaTeXQuestionPreview();
    }

    private createElement(): HTMLDetailsElement {
        const template = document.createElement("template");
        template.innerHTML = `
        <div class="question-slot round fade-in" data-swapy-slot="${this.questionNumber}">
            <div class="question-item top-margin" data-swapy-item="${this.questionNumber}">
                <nav class="row no-space">
                    <div class="handle" data-swapy-handle><i>drag_indicator</i></div>
                    <button class="max extra no-padding no-margin round toggle-question-button" id="toggle-question">
                        <nav class="small-padding left-margin right-margin responsive row">
                            <h5 class="max">Question ${this.questionNumber}</h5>
                            <i>expand_more</i>
                        </nav>
                    </button>
                    <button class="circle error tiny-margin" id="delete-question">
                        <i>delete</i>
                    </button>
                </nav>
                <div class="question-content-wrapper">
                    <article class="grid surface round border top-margin">
                        <div class="s12 m6 l6 small-round field label border">
                            <input type="number" id="worth" name="worth" value="${this.question.worth}" />
                            <label for="worth">Worth</label>
                        </div>
                        <div class="s12 m6 l6 small-round field label suffix border">
                            <select name="pageSpace" id="pageSpace" value="${this.question.questionSpace}">
                                <option value="0.3">Third of Page</option>
                                <option value="0.5" selected>Half Page</option>
                                <option value="1">Full Page</option>
                            </select>
                            <label for="pageSpace">Page Space</label>
                            <i>arrow_drop_down</i>
                        </div>
                        <div class="s12 m12 l12 small-round field min textarea label border">
                            <textarea id="question" name="question" autocapitalize="words">${this.question.question}</textarea>
                            <label for="question">Question</label>
                            <span class="helper no-line">LaTeX is supported. See supported <a class="link underline" href="https://katex.org/docs/supported" target="_blank">functions</a> and table of <a class="link underline" href="https://katex.org/docs/support_table" target="_blank">symbols</a>.</span>
                        </div>
                        <details class="s12 m12 l12 top-margin" open>
                            <summary>
                                <i>arrow_drop_down</i>
                                <span>Preview</span>
                            </summary>
                            <div class="padding border small-round KaTeX-display" id="latex-preview"></div>
                        </details>
                        <div class="s12 m12 l12 small-round field textarea label border">
                            <textarea id="answer" name="answer" autocapitalize="words">${this.question.answer}</textarea>
                            <label for="answer">Answer</label>
                        </div>
                    </article>
                </div>
            </div>
        </div>
        `;
        return template.content.firstElementChild as HTMLDetailsElement;
    }

    updateQuestionNumber(questionNumber: number) {
        this.questionNumber = questionNumber;
        this.question.questionNumber = questionNumber;
        // this.questionItem.dataset.swapyItem = questionNumber.toString();
        const header = this.htmlElement.querySelector("h5");
        if (header) header.textContent = `Question ${questionNumber}`;
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
            this.updateLaTeXQuestionPreview();
        });
        this.answerElement.addEventListener("input", () => {
            this.question.answer = this.answerElement.value;
        });

        const wrapper = this.htmlElement.querySelector(".question-content-wrapper") as HTMLElement;

        const resizeWrapper = () => {
            if (this.questionItem.classList.contains("open")) {
                wrapper.style.maxHeight = wrapper.scrollHeight + "px";
            }
        };

        wrapper.querySelectorAll("textarea, input, select").forEach(el => {
            el.addEventListener("input", resizeWrapper);
        });

        this.toggleQuestionButton.addEventListener("click", () => {
            const isOpen = this.questionItem.classList.contains("open");

            if (isOpen) {
                wrapper.style.maxHeight = wrapper.scrollHeight + "px";
                requestAnimationFrame(() => {
                    wrapper.style.maxHeight = "0px";
                    wrapper.style.opacity = "0";
                });
                this.questionItem.classList.remove("open");
                this.question.open = false;

            } else {
                wrapper.style.maxHeight = "0px";
                wrapper.style.opacity = "0";
                this.questionItem.classList.add("open");

                requestAnimationFrame(() => {
                    wrapper.style.maxHeight = wrapper.scrollHeight + "px";
                    wrapper.style.opacity = "1";
                });

                this.question.open = true;
            }

            setTimeout(resizeWrapper, 300);
            const toggleEvent = new Event("toggle", { bubbles: true });
            this.htmlElement.dispatchEvent(toggleEvent);
        });

        this.deleteQuestionButton.addEventListener("click", () => {
            const event = new CustomEvent("delete", { bubbles: true });
            this.htmlElement.dispatchEvent(event);
        });
    }

    private updateLaTeXQuestionPreview() {
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
                    output += `<span class="math block">${rendered}</span>`;
                } else {
                    output += `<span class="math inline">${rendered}</span>`;
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
