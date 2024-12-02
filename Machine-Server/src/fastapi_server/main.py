from multiprocessing import Process
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uvicorn import run
from .constants import FastAPIServerConstants as constants
from .api.jobs_manager_api import router as jobs_manager_router
from .api.images_manager_api import router as images_manager_router
from .api.ai_api import router as ai_router
from .api.material_library_api import router as material_library_router
import os
from dotenv import load_dotenv

load_dotenv()


class FastApiServer(Process):
    def __init__(self, shared_core_data):
        super(FastApiServer, self).__init__()

        # FastAPi instance
        self.app = None

        # shared data with the core
        self.shared_core_data = shared_core_data

    def run(self):
        # share file manager service
        self.app = FastAPI(title="OLOS API")

        # add shared data to the application request
        self.app.shared_core_data = self.shared_core_data

        self.create_app()

        self.start_server()

    def create_app(self):
        # middleware or configuration
        self.app.add_middleware(
            CORSMiddleware,
            # Allow all origins for demonstration purposes
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        # Include routers
        self.app.include_router(
            jobs_manager_router, prefix=constants.JOBS_MANAGER_ROUTE)
        self.app.include_router(
            images_manager_router, prefix=constants.IMAGES_MANAGER_ROUTE)
        self.app.include_router(
            ai_router, prefix=constants.AI_ROUTE)
        self.app.include_router(
            material_library_router, prefix=constants.MATERIAL_LIBRARY_ROUTE)

    def start_server(self):
        # Run the FastAPI app using Uvicorn
        run(
            self.app,
            host=os.getenv('HOST'),
            port=int(os.getenv('FASTAPI_PORT')),
            log_level="debug" if os.getenv(
                'ENV') == 'development' else "warning",
        )
