from app.curiki.math_outcome import MathOutcome
from app.curiki.skill import Skill
from app.curiki.skills import Skills
from app.curiki.strand import Strand
from app.curiki.strands import Strands


class MathCache:
    _loaded = False
    skills: Skills = Skills()
    strands: Strands = Strands()
    outcomes: list[MathOutcome] = []
    cache: dict[str, dict[str, dict[str, str]]] = {}

    @classmethod
    def load(cls, db_cursor, table_name="math"):
        if cls._loaded:
            return

        db_cursor.execute(f"SELECT code, name FROM {table_name}_skills")
        cls.skills._skills = [Skill(*row) for row in db_cursor.fetchall()]

        db_cursor.execute(f"SELECT code, name FROM {table_name}_strands")
        cls.strands._strands = [Strand(*row) for row in db_cursor.fetchall()]

        db_cursor.execute(
            f"SELECT outcome_id, grade, strand, skills, specific_learning_outcome, general_learning_outcomes FROM {table_name}_curriculum"
        )

        for row in db_cursor.fetchall():
            skills = Skills()
            for skill_id in row[3]:
                for skill in cls.skills:
                    if skill.skill_id == skill_id:
                        skills.add(skill)
                        break

            strand = next((s for s in cls.strands if s.strand_id == row[2]), None)

            outcome = MathOutcome(
                outcome_id=row[0],
                grade=row[1],
                strand=strand,
                skills=skills,
                specific_learning_outcome=row[4],
                general_learning_outcome=row[5],
            )

            cls.outcomes.append(outcome)
            cls.cache[row[0]] = outcome.to_dict()

        cls._loaded = True
