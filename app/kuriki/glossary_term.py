from dataclasses import dataclass


@dataclass(frozen=True)
class GlossaryTerm:
    term: str
    definition: str
