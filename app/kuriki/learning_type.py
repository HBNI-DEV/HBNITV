from dataclasses import dataclass


@dataclass(frozen=True)
class LearningType:
    code: str
    description: str

    def to_dict(self) -> dict:
        return {self.code: self.description}
