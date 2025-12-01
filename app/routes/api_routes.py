from app.handlers.api.assignment import AssignmentAPIHandler
from app.handlers.api.calendar import CalendarAPIHandler
from app.handlers.api.google_share_folder_ids import SharedGoogleFolderIDsAPIHandler
from app.handlers.api.kuriki.biology_2010_to_2011 import (
    KurikiBiologyGeneralLearningOutcomesAPIHandler,
    KurikiBiologyOutcomesAPIHandler,
    KurikiBiologyUnitsAPIHandler,
)
from app.handlers.api.kuriki.lessons import KurikiLessonsAPIHandler
from app.handlers.api.kuriki.mathematics_2013_to_2014 import (
    KurikiMathematicsOutcomesAPIHandler,
    KurikiMathematicsSkillsAPIHandler,
    KurikiMathematicsStrandsAPIHandler,
)
from app.handlers.api.kuriki.resources import KurikiResourcesAPIHandler
from app.handlers.api.kuriki.science_1999_to_2000 import (
    KurikiScienceClustersAPIHandler,
    KurikiScienceGeneralLearningOutcomesAPIHandler,
    KurikiScienceOutcomesAPIHandler,
)
from app.handlers.api.kuriki.social_studies_2003 import (
    KurikiSocialStudiesClustersAPIHandler,
    KurikiSocialStudiesDistinctiveLearningOutcomesAPIHandler,
    KurikiSocialStudiesGeneralLearningOutcomesAPIHandler,
    KurikiSocialStudiesGlossaryAPIHandler,
    KurikiSocialStudiesOutcomesAPIHandler,
    KurikiSocialStudiesOutcomeTypesAPIHandler,
    KurikiSocialStudiesSkillsAPIHandler,
    KurikiSocialStudiesSkillTypesAPIHandler,
)
from app.handlers.api.kuriki.worksheets import KurikiWorksheetsAPIHandler
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
        r"/api/shared-folders/delete/(.*)",
        UpdateFoldersAPIHandler,
        name="api_delete_shared_folders",
    ),
    route(
        r"/api/shared_google_folder_ids",
        SharedGoogleFolderIDsAPIHandler,
        name="api_shared_google_folder_ids",
    ),
    (r"/api/kuriki/resources", KurikiResourcesAPIHandler),
    (r"/api/kuriki/lessons", KurikiLessonsAPIHandler),
    (r"/api/kuriki/worksheets", KurikiWorksheetsAPIHandler),
    route(
        r"/api/kuriki/mathematics/2013-2014/outcomes",
        KurikiMathematicsOutcomesAPIHandler,
        name="api_kuriki_math_outcomes",
    ),
    route(
        r"/api/kuriki/mathematics/2013-2014/skills",
        KurikiMathematicsSkillsAPIHandler,
        name="api_kuriki_math_skills",
    ),
    route(
        r"/api/kuriki/mathematics/2013-2014/strands",
        KurikiMathematicsStrandsAPIHandler,
        name="api_kuriki_math_strands",
    ),
    route(
        r"/api/kuriki/science/1999-2000/outcomes",
        KurikiScienceOutcomesAPIHandler,
        name="api_kuriki_science_outcomes",
    ),
    route(
        r"/api/kuriki/science/1999-2000/clusters",
        KurikiScienceClustersAPIHandler,
        name="api_kuriki_science_clusters",
    ),
    route(
        r"/api/kuriki/science/1999-2000/general_learning_outcomes",
        KurikiScienceGeneralLearningOutcomesAPIHandler,
        name="api_kuriki_science_general_learning_outcomes",
    ),
    route(
        r"/api/kuriki/biology/2010-2011/outcomes",
        KurikiBiologyOutcomesAPIHandler,
        name="api_kuriki_biology_outcomes",
    ),
    route(
        r"/api/kuriki/biology/2010-2011/units",
        KurikiBiologyUnitsAPIHandler,
        name="api_kuriki_biology_units",
    ),
    route(
        r"/api/kuriki/biology/2010-2011/general_learning_outcomes",
        KurikiBiologyGeneralLearningOutcomesAPIHandler,
        name="api_kuriki_biology_general_learning_outcomes",
    ),
    route(
        r"/api/kuriki/social_studies/2003/clusters",
        KurikiSocialStudiesClustersAPIHandler,
        name="api_kuriki_social_studies_clusters",
    ),
    route(
        r"/api/kuriki/social_studies/2003/skill_types",
        KurikiSocialStudiesSkillTypesAPIHandler,
        name="api_kuriki_social_studies_skill_types",
    ),
    route(
        r"/api/kuriki/social_studies/2003/outcome_types",
        KurikiSocialStudiesOutcomeTypesAPIHandler,
        name="api_kuriki_social_studies_outcome_types",
    ),
    route(
        r"/api/kuriki/social_studies/2003/distinctive_learning_outcomes",
        KurikiSocialStudiesDistinctiveLearningOutcomesAPIHandler,
        name="api_kuriki_social_studies_distinctive_learning_outcomes",
    ),
    route(
        r"/api/kuriki/social_studies/2003/general_learning_outcomes",
        KurikiSocialStudiesGeneralLearningOutcomesAPIHandler,
        name="api_kuriki_social_studies_general_learning_outcomes",
    ),
    route(
        r"/api/kuriki/social_studies/2003/skills",
        KurikiSocialStudiesSkillsAPIHandler,
        name="api_kuriki_social_studies_skills",
    ),
    route(
        r"/api/kuriki/social_studies/2003/outcomes",
        KurikiSocialStudiesOutcomesAPIHandler,
        name="api_kuriki_social_studies_outcomes",
    ),
    route(
        r"/api/kuriki/social_studies/2003/glossary",
        KurikiSocialStudiesGlossaryAPIHandler,
        name="api_kuriki_social_studies_glossary",
    ),
    route(r"/api/calendar", CalendarAPIHandler, name="api_calendar"),
]
