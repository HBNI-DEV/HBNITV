from typing import Iterator

from app.Kuriki.unit import Unit


class Units:
    def __init__(self):
        self._untits: list[Unit] = []

    def add(self, unit: Unit):
        self._untits.append(unit)

    def __iter__(self) -> Iterator[Unit]:
        return iter(self._untits)

    def __len__(self) -> int:
        return len(self._untits)

    def __getitem__(self, index: int) -> Unit:
        return self._untits[index]

    def to_dict(self) -> dict:
        return {unit.get_id(): unit.to_dict() for unit in self._untits}
