import { Strand } from '@models/strand';
import { Skills } from '@models/skills';
import { Skill } from '@models/skill';

export class MathOutcome {
    private _data: {
        outcomeId: string;
        grade: string;
        specificLearningOutcome: string;
        generalLearningOutcome: string[];
        strand: Strand;
        skills: Skills;
    };

    constructor(data: {
        outcome_id?: string;
        grade?: string;
        specific_learning_outcome?: string;
        general_learning_outcome?: string[];
        strand?: Record<string, string>;
        skills?: Record<string, string>;
    }) {
        const strandKey = data.strand ? Object.keys(data.strand)[0] : '';
        const strandValue = data.strand ? data.strand[strandKey] : '';
        const strand = new Strand(strandKey, strandValue);

        const skills = new Skills();
        for (const [skill_id, name] of Object.entries(data.skills ?? {})) {
            skills.add(new Skill(skill_id, name));
        }

        this._data = {
            outcomeId: data.outcome_id ?? '',
            grade: data.grade ?? '',
            specificLearningOutcome: data.specific_learning_outcome ?? '',
            generalLearningOutcome: data.general_learning_outcome ?? [],
            strand,
            skills,
        };
    }

    get outcomeId() { return this._data.outcomeId; }
    get grade() { return this._data.grade; }
    get strand() { return this._data.strand; }
    get skills() { return this._data.skills; }
    get generalLearningOutcome() { return this._data.generalLearningOutcome; }
    get specificLearningOutcome() { return this._data.specificLearningOutcome; }
}
