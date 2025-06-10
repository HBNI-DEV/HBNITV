from app.curiki.unit import Unit
from app.curiki.units import Units
from app.curiki.general_learning_outcome import GeneralLearningOutcome
from app.curiki.general_learning_outcomes import GeneralLearningOutcomes
from app.curiki.biology_outcome import BiologyOutcome


class BiologyCache:
    _loaded = False
    units: Units = Units()
    general_learning_outcomes: GeneralLearningOutcomes = GeneralLearningOutcomes()
    outcomes: list[BiologyOutcome] = []
    cache: dict[str, dict[str, dict[str, str]]] = {}

    @classmethod
    def load(cls, db_cursor, table_name="biology"):
        if cls._loaded:
            return

        db_cursor.execute(f"SELECT grade, unit, title FROM {table_name}_units")
        cls.units._untits = [Unit(*row) for row in db_cursor.fetchall()]

        db_cursor.execute(
            f"SELECT code, description FROM {table_name}_general_outcomes"
        )
        cls.general_learning_outcomes._general_learning_outcomes = [
            GeneralLearningOutcome(*row) for row in db_cursor.fetchall()
        ]

        db_cursor.execute(
            f"SELECT outcome_id, grade, unit, general_learning_outcomes, specific_learning_outcome FROM {table_name}_curriculum"
        )

        for row in db_cursor.fetchall():
            unit = next(
                (u for u in cls.units if u.get_id() == f"{row[1]}.{row[2]}"), None
            )
            general_learning_outcomes = GeneralLearningOutcomes()
            for code in row[3]:
                for general_learning_outcome in cls.general_learning_outcomes:
                    if general_learning_outcome.code == code:
                        general_learning_outcomes.add(general_learning_outcome)
                        break

            outcome = BiologyOutcome(
                outcome_id=row[0],
                grade=row[1],
                specific_learning_outcome=row[4],
                unit=unit,
                general_learning_outcomes=general_learning_outcomes,
            )

            cls.outcomes.append(outcome)
            cls.cache[row[0]] = outcome.to_dict()

        cls._loaded = True
