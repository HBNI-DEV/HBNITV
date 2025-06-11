import { Skill } from '@models/skill';

export class Skills implements Iterable<Skill> {
    private _skills: Skill[] = [];

    add(skill: Skill): void {
        this._skills.push(skill);
    }

    [Symbol.iterator](): Iterator<Skill> {
        return this._skills[Symbol.iterator]();
    }

    get length(): number {
        return this._skills.length;
    }

    get(index: number): Skill {
        return this._skills[index];
    }

    toDict(): Record<string, string> {
        return Object.fromEntries(this._skills.map(skill => [skill.skillId, skill.skillName]));
    }
}
