export class Skill {
    constructor(
        public skillId: string,
        public skillName: string
    ) {}

    toDict(): Record<string, string> {
        return { [this.skillId]: this.skillName };
    }
}
