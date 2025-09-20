from dataclasses import dataclass

from app.kuriki.outcome import Outcome
from app.kuriki.skill import Skill
from app.kuriki.skills import Skills
from app.kuriki.strand import Strand


@dataclass(frozen=True)
class MathOutcome(Outcome):
    strand: Strand
    skills: Skills
    general_learning_outcome: list[str]

    def to_dict(self) -> dict:
        return {
            "outcome_id": self.outcome_id,
            "grade": self.grade,
            "strand": self.strand.to_dict(),
            "skills": self.skills.to_dict(),
            "specific_learning_outcome": self.specific_learning_outcome,
            "general_learning_outcome": self.general_learning_outcome,
        }
