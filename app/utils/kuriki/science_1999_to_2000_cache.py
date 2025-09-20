from app.kuriki.cluster import Cluster
from app.kuriki.clusters import Clusters
from app.kuriki.general_learning_outcome import GeneralLearningOutcome
from app.kuriki.general_learning_outcomes import GeneralLearningOutcomes
from app.kuriki.science_outcome import ScienceOutcome


class Science1999To2000Cache:
    _loaded = False
    clusters: Clusters = Clusters()
    general_learning_outcomes: GeneralLearningOutcomes = GeneralLearningOutcomes()
    outcomes: list[ScienceOutcome] = []
    cache: dict[str, dict[str, dict[str, str]]] = {}

    @classmethod
    def load(cls, db_cursor, table_name="science_1999_to_2000"):
        if cls._loaded:
            return

        db_cursor.execute(f"SELECT grade, cluster, title FROM {table_name}_clusters")
        cls.clusters._clusters = [Cluster(*row) for row in db_cursor.fetchall()]

        db_cursor.execute(f"SELECT code, description FROM {table_name}_general_outcomes")
        cls.general_learning_outcomes._general_learning_outcomes = [GeneralLearningOutcome(*row) for row in db_cursor.fetchall()]

        db_cursor.execute(f"SELECT outcome_id, grade, cluster, general_learning_outcomes, specific_learning_outcome FROM {table_name}_curriculum")

        for row in db_cursor.fetchall():
            cluster = next((c for c in cls.clusters if c.get_id() == f"{row[1]}.{row[2]}"))
            general_learning_outcomes = GeneralLearningOutcomes()
            for code in row[3]:
                for general_learning_outcome in cls.general_learning_outcomes:
                    if general_learning_outcome.code == code:
                        general_learning_outcomes.add(general_learning_outcome)
                        break

            outcome = ScienceOutcome(
                outcome_id=row[0],
                grade=row[1],
                specific_learning_outcome=row[4],
                cluster=cluster,
                general_learning_outcomes=general_learning_outcomes,
            )

            cls.outcomes.append(outcome)
            cls.cache[row[0]] = outcome.to_dict()

        cls._loaded = True
