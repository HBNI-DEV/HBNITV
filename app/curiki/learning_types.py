from app.curiki.learning_type import LearningType
from typing import Iterator


class LearningTypes:
    def __init__(self):
        self._learning_types: list[LearningType] = []

    def add(self, learning_type: LearningType):
        self._learning_types.append(learning_type)

    def __iter__(self) -> Iterator[LearningType]:
        return iter(self._learning_types)

    def __len__(self) -> int:
        return len(self._learning_types)

    def __getitem__(self, index: int) -> LearningType:
        return self._learning_types[index]

    def to_dict(self) -> dict:
        return {
            learning_type.code: learning_type.description
            for learning_type in self._learning_types
        }
