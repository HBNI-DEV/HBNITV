from app.handlers.kuriki import KurikiBaseHandler
from app.utils.kuriki.social_studies_2003_cache import SocialStudies2003Cache


class KurikiSocialStudiesAPIHandler(KurikiBaseHandler):
    def initialize(self):
        super().initialize()
        SocialStudies2003Cache.load(self.cur)


class KurikiSocialStudiesClustersAPIHandler(KurikiSocialStudiesAPIHandler):
    def get(self):
        try:
            self.write(
                {
                    "status": "success",
                    "data": SocialStudies2003Cache.clusters.to_dict(),
                }
            )
        except Exception as e:
            self.write_error_response(e)


class KurikiSocialStudiesSkillTypesAPIHandler(KurikiSocialStudiesAPIHandler):
    def get(self):
        try:
            self.write(
                {
                    "status": "success",
                    "data": SocialStudies2003Cache.skill_types.to_dict(),
                }
            )
        except Exception as e:
            self.write_error_response(e)


class KurikiSocialStudiesOutcomeTypesAPIHandler(KurikiSocialStudiesAPIHandler):
    def get(self):
        try:
            self.write(
                {
                    "status": "success",
                    "data": SocialStudies2003Cache.outcome_types.to_dict(),
                }
            )
        except Exception as e:
            self.write_error_response(e)


class KurikiSocialStudiesDistinctiveLearningOutcomesAPIHandler(KurikiSocialStudiesAPIHandler):
    def get(self):
        try:
            self.write(
                {
                    "status": "success",
                    "data": SocialStudies2003Cache.distinctive_learning_outcomes.to_dict(),
                }
            )
        except Exception as e:
            self.write_error_response(e)


class KurikiSocialStudiesGeneralLearningOutcomesAPIHandler(KurikiSocialStudiesAPIHandler):
    def get(self):
        try:
            self.write(
                {
                    "status": "success",
                    "data": SocialStudies2003Cache.general_learning_outcomes.to_dict(),
                }
            )
        except Exception as e:
            self.write_error_response(e)


class KurikiSocialStudiesGlossaryAPIHandler(KurikiSocialStudiesAPIHandler):
    def get(self):
        try:
            self.write(
                {
                    "status": "success",
                    "data": SocialStudies2003Cache.glossary.to_dict(),
                }
            )
        except Exception as e:
            self.write_error_response(e)


class KurikiSocialStudiesOutcomesAPIHandler(KurikiSocialStudiesAPIHandler):
    def get(self):
        try:
            outcome_id = self.get_argument("id", None)

            if outcome_id:
                if result := SocialStudies2003Cache.cache.get(outcome_id):
                    self.write({"status": "success", "data": result})
                else:
                    self.set_status(404)
                    self.write({"status": "error", "message": "Outcome not found"})
            else:
                all_outcomes = {}
                for outcome in SocialStudies2003Cache.outcomes:
                    all_outcomes[outcome.outcome_id] = outcome.to_dict()
                self.write({"status": "success", "data": all_outcomes})
        except Exception as e:
            self.write_error_response(e)

    @staticmethod
    def _get_skill(skill_id: str):
        if result := SocialStudies2003Cache.cache.get(skill_id):
            return result
        else:
            return None


class KurikiSocialStudiesSkillsAPIHandler(KurikiSocialStudiesAPIHandler):
    def get(self):
        try:
            skill_id = self.get_argument("id", None)

            if skill_id:
                if result := SocialStudies2003Cache.cache.get(skill_id):
                    self.write({"status": "success", "data": result})
                else:
                    self.set_status(404)
                    self.write({"status": "error", "message": "Outcome not found"})
            else:
                all_skills = {}
                for skill in SocialStudies2003Cache.skills:
                    all_skills[skill.outcome_id] = skill.to_dict()
                self.write({"status": "success", "data": all_skills})
        except Exception as e:
            self.write_error_response(e)

    @staticmethod
    def _get_skill(skill_id: str):
        if result := SocialStudies2003Cache.cache.get(skill_id):
            return result
        else:
            return None
