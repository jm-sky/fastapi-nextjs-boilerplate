from app.core.factory import create_app
from app.core.settings import settings

app = create_app(settings)
