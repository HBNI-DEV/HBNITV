from dataclasses import dataclass
from app.curiki.learning_type import LearningType
from app.curiki.outcome import Outcome


@dataclass(frozen=True)
class SocialStudiesSkill(Outcome):
    skill_type: LearningType

    def to_dict(self) -> dict:
        return {
            "outcome_id": self.outcome_id,
            "grade": self.grade,
            "skill_type": self.skill_type.to_dict(),
            "specific_learning_outcome": self.specific_learning_outcome,
        }
