from typing import Iterator

from app.Kuriki.general_learning_outcome import GeneralLearningOutcome


class GeneralLearningOutcomes:
    def __init__(self):
        self._general_learning_outcomes: list[GeneralLearningOutcome] = []

    def add(self, skill: GeneralLearningOutcome):
        self._general_learning_outcomes.append(skill)

    def __iter__(self) -> Iterator[GeneralLearningOutcome]:
        return iter(self._general_learning_outcomes)

    def __len__(self) -> int:
        return len(self._general_learning_outcomes)

    def __getitem__(self, index: int) -> GeneralLearningOutcome:
        return self._general_learning_outcomes[index]

    def to_dict(self) -> dict:
        return {general_learning_outcome.code: general_learning_outcome.description for general_learning_outcome in self._general_learning_outcomes}
