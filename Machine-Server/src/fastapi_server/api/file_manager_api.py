import asyncio
from fastapi import APIRouter, Form, UploadFile, HTTPException
from fastapi import APIRouter, Depends, File, Request, UploadFile, status, HTTPException
from fastapi.responses import JSONResponse
from typing import Annotated, List

from utils.shared_data import SharedFastApiData
from ..models.file_manager_models import FileCreate
from ..constants import FastAPIServerConstants as constants
from ..services.file_manager_service import FileManagerService

router = APIRouter()


@router.post("/open/{filename}")
def open_file(filename: str, request: Request):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = FileManagerService.open_file(
            shared_core_data, filename)
        return JSONResponse(content=core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.post("/upload")
async def upload_files(request: Request, files: List[UploadFile] = File(...)):
    try:
        shared_core_data = request.app.shared_core_data
        FileManagerService.upload_files(
            shared_core_data, files)

    except Exception as error:
        print(error)
        raise HTTPException(status_code=500, detail=str(error))


@router.delete("/delete/{filename}")
def delete_file(filename: str, request: Request):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = FileManagerService.delete_file(
            shared_core_data, filename)
        return JSONResponse(content=core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.post("/rename")
def rename_file(request: Request, old_filename: str = Form(...), new_filename: str = Form(...)):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = FileManagerService.rename_file(
            shared_core_data, old_filename, new_filename)
        return JSONResponse(content=core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.post("/start")
def start_file(request: Request):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = FileManagerService.start_file(
            shared_core_data)
        return JSONResponse(content=core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/check")
def check_opened_file(request: Request):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = FileManagerService.check_opened_file(shared_core_data)
        return JSONResponse(content=core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/list")
def get_files_list(request: Request):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = FileManagerService.get_files_list(shared_core_data)
        return JSONResponse(content=core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
