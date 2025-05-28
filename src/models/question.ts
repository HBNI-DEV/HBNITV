import { QuestionData } from "@models/question-data";

export class Question implements QuestionData {
    private _data: QuestionData;
    private eventTarget = new EventTarget();

    constructor(data?: Partial<QuestionData>) {
        this._data = {
            questionNumber: data?.questionNumber ?? 1,
            worth: data?.worth ?? 5,
            questionSpace: data?.questionSpace ?? 0.5,
            question: data?.question ?? "",
            open: data?.open ?? true,
            answer: data?.answer ?? "",
        };
    }

    onChange(listener: (question: Question) => void): void {
        this.eventTarget.addEventListener("change", () => listener(this));
    }

    private emitChange(): void {
        this.eventTarget.dispatchEvent(new Event("change"));
    }

    get questionNumber() { return this._data.questionNumber; }
    set questionNumber(value: number) { this._data.questionNumber = value; this.emitChange(); }

    get worth() { return this._data.worth; }
    set worth(value: number) { this._data.worth = value; this.emitChange(); }

    get questionSpace() { return this._data.questionSpace; }
    set questionSpace(value: number) { this._data.questionSpace = value; this.emitChange(); }

    get question() { return this._data.question; }
    set question(value: string) { this._data.question = value; this.emitChange(); }

    get answer() { return this._data.answer; }
    set answer(value: string) { this._data.answer = value; this.emitChange(); }

    get open() { return this._data.open; }
    set open(value: boolean) { this._data.open = value; this.emitChange(); }

    toJSON(): QuestionData {
        return { ...this._data };
    }
}
