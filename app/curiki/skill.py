from dataclasses import dataclass


@dataclass(frozen=True)
class Skill:
    skill_id: str
    skill_name: str

    def to_dict(self) -> dict:
        return {self.skill_id: self.skill_name}
