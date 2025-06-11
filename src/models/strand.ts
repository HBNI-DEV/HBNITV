export class Strand {
    constructor(
        public strandId: string,
        public strandName: string
    ) {}

    toDict(): Record<string, string> {
        return { [this.strandId]: this.strandName };
    }
}
