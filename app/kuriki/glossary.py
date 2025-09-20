from typing import Iterator

from app.Kuriki.glossary_term import GlossaryTerm


class Glossary:
    def __init__(self):
        self._terms: list[GlossaryTerm] = []

    def add(self, term: GlossaryTerm):
        self._terms.append(term)

    def __iter__(self) -> Iterator[GlossaryTerm]:
        return iter(self._terms)

    def __len__(self) -> int:
        return len(self._terms)

    def __getitem__(self, index: int) -> GlossaryTerm:
        return self._terms[index]

    def to_dict(self) -> dict:
        return {term.term: term.definition for term in self._terms}
