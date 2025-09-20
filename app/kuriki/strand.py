from dataclasses import dataclass


@dataclass(frozen=True)
class Strand:
    strand_id: str
    strand_name: str

    def to_dict(self) -> dict:
        return {self.strand_id: self.strand_name}
