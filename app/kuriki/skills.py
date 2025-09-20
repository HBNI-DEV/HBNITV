from typing import Iterator

from app.Kuriki.skill import Skill


class Skills:
    def __init__(self):
        self._skills: list[Skill] = []

    def add(self, skill: Skill):
        self._skills.append(skill)

    def __iter__(self) -> Iterator[Skill]:
        return iter(self._skills)

    def __len__(self) -> int:
        return len(self._skills)

    def __getitem__(self, index: int) -> Skill:
        return self._skills[index]

    def to_dict(self) -> dict:
        return {skill.skill_id: skill.skill_name for skill in self._skills}
