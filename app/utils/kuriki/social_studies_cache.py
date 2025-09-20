from app.Kuriki.cluster import Cluster
from app.Kuriki.clusters import Clusters
from app.Kuriki.general_learning_outcome import GeneralLearningOutcome
from app.Kuriki.general_learning_outcomes import GeneralLearningOutcomes
from app.Kuriki.glossary import Glossary
from app.Kuriki.glossary_term import GlossaryTerm
from app.Kuriki.learning_type import LearningType
from app.Kuriki.learning_types import LearningTypes
from app.Kuriki.skill import Skill
from app.Kuriki.social_studies_outcome import SocialStudiesOutcome
from app.Kuriki.social_studies_skill import SocialStudiesSkill


class SocialStudiesCache:
    _loaded = False
    clusters: Clusters = Clusters()
    glossary: Glossary = Glossary()
    skill_types: LearningTypes = LearningTypes()
    outcome_types: LearningTypes = LearningTypes()
    distinctive_learning_outcomes: LearningTypes = LearningTypes()
    general_learning_outcomes: GeneralLearningOutcomes = GeneralLearningOutcomes()
    outcomes: list[SocialStudiesOutcome] = []
    skills: list[SocialStudiesSkill] = []
    cache: dict[str, dict[str, dict[str, str]]] = {}

    @classmethod
    def load(cls, db_cursor, table_name="social_studies"):
        if cls._loaded:
            return

        db_cursor.execute(f"SELECT grade, cluster, title FROM {table_name}_clusters")
        cls.clusters._clusters = [Cluster(*row) for row in db_cursor.fetchall()]

        db_cursor.execute(f"SELECT code, description FROM {table_name}_general_outcomes")
        cls.general_learning_outcomes._general_learning_outcomes = [GeneralLearningOutcome(*row) for row in db_cursor.fetchall()]

        db_cursor.execute(f"SELECT code, description FROM {table_name}_skill_types")
        cls.skill_types._learning_types = [LearningType(*row) for row in db_cursor.fetchall()]

        db_cursor.execute(f"SELECT code, description FROM {table_name}_outcome_types")
        cls.outcome_types._learning_types = [LearningType(*row) for row in db_cursor.fetchall()]

        db_cursor.execute(f"SELECT code, description FROM {table_name}_distinctive_learning_outcomes")
        cls.distinctive_learning_outcomes._learning_types = [LearningType(*row) for row in db_cursor.fetchall()]

        db_cursor.execute(f"SELECT term, definition FROM {table_name}_glossary")
        cls.glossary._terms = [GlossaryTerm(*row) for row in db_cursor.fetchall()]

        db_cursor.execute(
            f"SELECT outcome_id, grade, cluster, outcome_type, general_learning_outcome, distinctive_learning_outcome, specific_learning_outcome FROM {table_name}_outcomes"
        )

        for row in db_cursor.fetchall():
            cluster = next((c for c in cls.clusters if c.get_id() == f"{row[1]}.{row[2]}"), None)
            outcome_type = next((c for c in cls.outcome_types if c.code == row[3]), None)
            general_learning_outcome = next((c for c in cls.general_learning_outcomes if c.code == row[4]), None)
            distinctive_learning_outcome = next(
                (c for c in cls.distinctive_learning_outcomes if c.code == row[5]),
                LearningType("", ""),
            )

            outcome = SocialStudiesOutcome(
                outcome_id=row[0],
                grade=row[1],
                specific_learning_outcome=row[5],
                cluster=cluster,
                outcome_type=outcome_type,
                general_learning_outcome=general_learning_outcome,
                distinctive_learning_outcome=distinctive_learning_outcome,
            )

            cls.outcomes.append(outcome)
            cls.cache[row[0]] = outcome.to_dict()

        db_cursor.execute(f"SELECT skill_id, skill_type, grade, specific_learning_outcome FROM {table_name}_skills")

        for row in db_cursor.fetchall():
            skill_type = next((c for c in cls.skill_types if c.code == row[1]), None)

            skill = SocialStudiesSkill(
                outcome_id=row[0],
                grade=row[2],
                specific_learning_outcome=row[3],
                skill_type=skill_type,
            )

            cls.skills.append(skill)
            cls.cache[row[0]] = skill.to_dict()

        cls._loaded = True
