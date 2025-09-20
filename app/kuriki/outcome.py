from dataclasses import dataclass


@dataclass(frozen=True)
class Outcome:
    outcome_id: str
    grade: str
    specific_learning_outcome: str
