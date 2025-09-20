from dataclasses import dataclass

from app.kuriki.general_learning_outcomes import GeneralLearningOutcomes
from app.kuriki.outcome import Outcome
from app.kuriki.unit import Unit


@dataclass(frozen=True)
class BiologyOutcome(Outcome):
    unit: Unit
    general_learning_outcomes: GeneralLearningOutcomes  # These are letter codes

    def to_dict(self) -> dict:
        return {
            "outcome_id": self.outcome_id,
            "grade": self.grade,
            "specific_learning_outcome": self.specific_learning_outcome,
            "unit": self.unit.to_dict(),
            "general_learning_outcomes": self.general_learning_outcomes.to_dict(),
        }
