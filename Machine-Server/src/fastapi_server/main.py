from multiprocessing import Process
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uvicorn import run

from .services.file_manager_service import FileManagerService
from .constants import FastAPIServerConstants as constants
from .api.file_manager_api import router as file_manager_router

from decouple import config


class FastApiServer(Process):
    def __init__(self, shared_core_data):
        super(FastApiServer, self).__init__()

        # FastAPi instance
        self.app = None

        # shared data with the core
        self.shared_core_data = shared_core_data

    def run(self):
        # share file manager service
        self.app = FastAPI()

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
            file_manager_router, prefix=constants.FILE_MANAGER_ROUTE)

    def start_server(self):
        # Run the FastAPI app using Uvicorn
        run(
            self.app,
            host=config('HOST'),
            port=int(config('FASTAPI_PORT')),
            log_level="debug" if config(
                'ENV') == 'development' else "warning",
        )
