from app.handlers.api.assignment import AssignmentAPIHandler
from app.handlers.api.calendar import CalendarAPIHandler
from app.handlers.api.curiki.biology import (
    CurikiBiologyGeneralLearningOutcomesAPIHandler,
    CurikiBiologyOutcomesAPIHandler,
    CurikiBiologyUnitsAPIHandler,
)
from app.handlers.api.curiki.math import (
    CurikiMathOutcomesAPIHandler,
    CurikiMathSkillsAPIHandler,
    CurikiMathStrandsAPIHandler,
)
from app.handlers.api.curiki.science import (
    CurikiScienceClustersAPIHandler,
    CurikiScienceGeneralLearningOutcomesAPIHandler,
    CurikiScienceOutcomesAPIHandler,
)
from app.handlers.api.curiki.social_studies import (
    CurikiSocialStudiesClustersAPIHandler,
    CurikiSocialStudiesDistinctiveLearningOutcomesAPIHandler,
    CurikiSocialStudiesGeneralLearningOutcomesAPIHandler,
    CurikiSocialStudiesGlossaryAPIHandler,
    CurikiSocialStudiesOutcomesAPIHandler,
    CurikiSocialStudiesOutcomeTypesAPIHandler,
    CurikiSocialStudiesSkillsAPIHandler,
    CurikiSocialStudiesSkillTypesAPIHandler,
)
from app.handlers.api.google_share_folder_ids import SharedGoogleFolderIDsAPIHandler
from app.handlers.api.login import LoginAPIHandler
from app.handlers.api.logout import LogoutAPIHandler
from app.handlers.api.news import NewsAPIHandler
from app.handlers.api.recordings import RecordingsAPIHandler
from app.handlers.api.register import RegisterAPIHandler
from app.handlers.api.thumbnail import ThumbnailProxyHandler
from app.handlers.api.update_folders import UpdateFoldersAPIHandler
from app.routes.helpers import route

api_routes = [
    route(r"/api/news", NewsAPIHandler, name="api_news"),
    route(r"/api/login", LoginAPIHandler, name="api_login"),
    route(r"/api/logout", LogoutAPIHandler, name="api_logout"),
    route(r"/api/register", RegisterAPIHandler, name="api_register"),
    route(r"/api/assignment", AssignmentAPIHandler, name="api_assignment"),
    route(r"/api/recordings", RecordingsAPIHandler, name="api_recordings"),
    route(r"/api/thumbnail", ThumbnailProxyHandler, name="api_thumbnail"),
    route(r"/api/update-folders", UpdateFoldersAPIHandler, name="api_update_folders"),
    route(
        r"/api/shared_google_folder_ids",
        SharedGoogleFolderIDsAPIHandler,
        name="api_shared_google_folder_ids",
    ),
    route(
        r"/api/curiki/math/outcomes",
        CurikiMathOutcomesAPIHandler,
        name="api_curiki_math_outcomes",
    ),
    route(
        r"/api/curiki/math/skills",
        CurikiMathSkillsAPIHandler,
        name="api_curiki_math_skills",
    ),
    route(
        r"/api/curiki/math/strands",
        CurikiMathStrandsAPIHandler,
        name="api_curiki_math_strands",
    ),
    route(
        r"/api/curiki/science/outcomes",
        CurikiScienceOutcomesAPIHandler,
        name="api_curiki_science_outcomes",
    ),
    route(
        r"/api/curiki/science/clusters",
        CurikiScienceClustersAPIHandler,
        name="api_curiki_science_clusters",
    ),
    route(
        r"/api/curiki/science/general_learning_outcomes",
        CurikiScienceGeneralLearningOutcomesAPIHandler,
        name="api_curiki_science_general_learning_outcomes",
    ),
    route(
        r"/api/curiki/biology/outcomes",
        CurikiBiologyOutcomesAPIHandler,
        name="api_curiki_biology_outcomes",
    ),
    route(
        r"/api/curiki/biology/units",
        CurikiBiologyUnitsAPIHandler,
        name="api_curiki_biology_units",
    ),
    route(
        r"/api/curiki/biology/general_learning_outcomes",
        CurikiBiologyGeneralLearningOutcomesAPIHandler,
        name="api_curiki_biology_general_learning_outcomes",
    ),
    route(
        r"/api/curiki/social_studies/clusters",
        CurikiSocialStudiesClustersAPIHandler,
        name="api_curiki_social_studies_clusters",
    ),
    route(
        r"/api/curiki/social_studies/skill_types",
        CurikiSocialStudiesSkillTypesAPIHandler,
        name="api_curiki_social_studies_skill_types",
    ),
    route(
        r"/api/curiki/social_studies/outcome_types",
        CurikiSocialStudiesOutcomeTypesAPIHandler,
        name="api_curiki_social_studies_outcome_types",
    ),
    route(
        r"/api/curiki/social_studies/distinctive_learning_outcomes",
        CurikiSocialStudiesDistinctiveLearningOutcomesAPIHandler,
        name="api_curiki_social_studies_distinctive_learning_outcomes",
    ),
    route(
        r"/api/curiki/social_studies/general_learning_outcomes",
        CurikiSocialStudiesGeneralLearningOutcomesAPIHandler,
        name="api_curiki_social_studies_general_learning_outcomes",
    ),
    route(
        r"/api/curiki/social_studies/skills",
        CurikiSocialStudiesSkillsAPIHandler,
        name="api_curiki_social_studies_skills",
    ),
    route(
        r"/api/curiki/social_studies/outcomes",
        CurikiSocialStudiesOutcomesAPIHandler,
        name="api_curiki_social_studies_outcomes",
    ),
    route(
        r"/api/curiki/social_studies/glossary",
        CurikiSocialStudiesGlossaryAPIHandler,
        name="api_curiki_social_studies_glossary",
    ),
    route(r"/api/calendar", CalendarAPIHandler, name="api_calendar"),
]
