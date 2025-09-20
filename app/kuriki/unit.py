from dataclasses import dataclass


@dataclass(frozen=True)
class Unit:
    grade: str
    unit_id: str
    unit_name: str

    def get_id(self) -> str:
        return f"{self.grade}.{self.unit_id}"

    def to_dict(self) -> dict:
        return {self.unit_id: self.unit_name}
