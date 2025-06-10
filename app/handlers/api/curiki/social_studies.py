from app.handlers.curiki import CurikiBaseHandler
from app.utils.curiki.social_studies_cache import SocialStudiesCache


class CurikiSocialStudiesAPIHandler(CurikiBaseHandler):
    def initialize(self):
        super().initialize()
        SocialStudiesCache.load(self.cur)


class CurikiSocialStudiesClustersAPIHandler(CurikiSocialStudiesAPIHandler):
    def get(self):
        try:
            self.write(
                {
                    "status": "success",
                    "data": SocialStudiesCache.clusters.to_dict(),
                }
            )
        except Exception as e:
            self.write_error_response(e)


class CurikiSocialStudiesSkillTypesAPIHandler(CurikiSocialStudiesAPIHandler):
    def get(self):
        try:
            self.write(
                {
                    "status": "success",
                    "data": SocialStudiesCache.skill_types.to_dict(),
                }
            )
        except Exception as e:
            self.write_error_response(e)


class CurikiSocialStudiesOutcomeTypesAPIHandler(CurikiSocialStudiesAPIHandler):
    def get(self):
        try:
            self.write(
                {
                    "status": "success",
                    "data": SocialStudiesCache.outcome_types.to_dict(),
                }
            )
        except Exception as e:
            self.write_error_response(e)


class CurikiSocialStudiesDistinctiveLearningOutcomesAPIHandler(
    CurikiSocialStudiesAPIHandler
):
    def get(self):
        try:
            self.write(
                {
                    "status": "success",
                    "data": SocialStudiesCache.distinctive_learning_outcomes.to_dict(),
                }
            )
        except Exception as e:
            self.write_error_response(e)


class CurikiSocialStudiesGeneralLearningOutcomesAPIHandler(
    CurikiSocialStudiesAPIHandler
):
    def get(self):
        try:
            self.write(
                {
                    "status": "success",
                    "data": SocialStudiesCache.general_learning_outcomes.to_dict(),
                }
            )
        except Exception as e:
            self.write_error_response(e)


class CurikiSocialStudiesGlossaryAPIHandler(CurikiSocialStudiesAPIHandler):
    def get(self):
        try:
            self.write(
                {
                    "status": "success",
                    "data": SocialStudiesCache.glossary.to_dict(),
                }
            )
        except Exception as e:
            self.write_error_response(e)


class CurikiSocialStudiesOutcomesAPIHandler(CurikiSocialStudiesAPIHandler):
    def get(self):
        try:
            outcome_id = self.get_argument("id", None)

            if outcome_id:
                if result := SocialStudiesCache.cache.get(outcome_id):
                    self.write({"status": "success", "data": result})
                else:
                    self.set_status(404)
                    self.write({"status": "error", "message": "Outcome not found"})
            else:
                all_outcomes = {}
                for outcome in SocialStudiesCache.outcomes:
                    all_outcomes[outcome.outcome_id] = outcome.to_dict()
                self.write({"status": "success", "data": all_outcomes})
        except Exception as e:
            self.write_error_response(e)

    @staticmethod
    def _get_skill(skill_id: str):
        if result := SocialStudiesCache.cache.get(skill_id):
            return result
        else:
            return None


class CurikiSocialStudiesSkillsAPIHandler(CurikiSocialStudiesAPIHandler):
    def get(self):
        try:
            skill_id = self.get_argument("id", None)

            if skill_id:
                if result := SocialStudiesCache.cache.get(skill_id):
                    self.write({"status": "success", "data": result})
                else:
                    self.set_status(404)
                    self.write({"status": "error", "message": "Outcome not found"})
            else:
                all_skills = {}
                for skill in SocialStudiesCache.skills:
                    all_skills[skill.outcome_id] = skill.to_dict()
                self.write({"status": "success", "data": all_skills})
        except Exception as e:
            self.write_error_response(e)

    @staticmethod
    def _get_skill(skill_id: str):
        if result := SocialStudiesCache.cache.get(skill_id):
            return result
        else:
            return None
