
"""Settings configuration - Configuration for environment variables can go in here."""

import os
from dotenv import load_dotenv

load_dotenv()

ENV = os.getenv('FLASK_ENV', default='production')
DEBUG = ENV == 'development'
DATABASE_URI = os.getenv('DATABASE_URI', default="mongodb://localhost:27017/")