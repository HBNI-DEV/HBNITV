from dataclasses import dataclass

from app.Kuriki.cluster import Cluster
from app.Kuriki.general_learning_outcomes import GeneralLearningOutcomes
from app.Kuriki.outcome import Outcome


@dataclass(frozen=True)
class ScienceOutcome(Outcome):
    cluster: Cluster
    general_learning_outcomes: GeneralLearningOutcomes  # These are letter codes

    def to_dict(self) -> dict:
        return {
            "outcome_id": self.outcome_id,
            "grade": self.grade,
            "specific_learning_outcome": self.specific_learning_outcome,
            "cluster": self.cluster.to_dict(),
            "general_learning_outcomes": self.general_learning_outcomes.to_dict(),
        }
