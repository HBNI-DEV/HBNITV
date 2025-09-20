from typing import Iterator

from app.Kuriki.strand import Strand


class Strands:
    def __init__(self):
        self._strands: list[Strand] = []

    def add(self, strand: Strand):
        self._strands.append(strand)

    def __iter__(self) -> Iterator[Strand]:
        return iter(self._strands)

    def __len__(self) -> int:
        return len(self._strands)

    def __getitem__(self, index: int) -> Strand:
        return self._strands[index]

    def to_dict(self) -> dict:
        return {strand.strand_id: strand.strand_name for strand in self._strands}
