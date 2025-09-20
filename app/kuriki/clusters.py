from typing import Iterator

from app.Kuriki.cluster import Cluster


class Clusters:
    def __init__(self):
        self._clusters: list[Cluster] = []

    def add(self, cluster: Cluster):
        self._clusters.append(cluster)

    def __iter__(self) -> Iterator[Cluster]:
        return iter(self._clusters)

    def __len__(self) -> int:
        return len(self._clusters)

    def __getitem__(self, index: int) -> Cluster:
        return self._clusters[index]

    def to_dict(self) -> dict:
        return {cluster.get_id(): cluster.to_dict() for cluster in self._clusters}
