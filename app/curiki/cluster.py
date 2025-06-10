from dataclasses import dataclass


@dataclass(frozen=True)
class Cluster:
    grade: str
    cluster_id: str
    cluster_name: str

    def get_id(self) -> str:
        return f"{self.grade}.{self.cluster_id}"

    def to_dict(self) -> dict:
        return {self.cluster_id: self.cluster_name}
