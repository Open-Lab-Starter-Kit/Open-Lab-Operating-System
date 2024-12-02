import json
from fastapi import APIRouter, Form, UploadFile, HTTPException, File, Request
from fastapi.responses import JSONResponse, FileResponse

from ..models.jobs_manager_model import JobsManagerResponse, RenameJobData, USBJobFileData
from ..services.jobs_manager_service import JobsManagerService
from ..constants import FastAPIServerConstants as constants

router = APIRouter()


@router.post("/open/{filename}", response_model=JobsManagerResponse)
def open_job(request: Request, filename: str):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = JobsManagerService.open_file(
            shared_core_data, filename)

        return JSONResponse(content=core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.post("/upload", response_model=JobsManagerResponse)
def upload_job(request: Request, file: UploadFile = File(...)):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = JobsManagerService.upload_file(
            shared_core_data, file)

        return JSONResponse(content=core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.delete("/delete/{filename}", response_model=JobsManagerResponse)
def delete_job(request: Request, filename: str):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = JobsManagerService.delete_file(
            shared_core_data, filename)

        return JSONResponse(content=core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.post("/download/{filename}", response_model=JobsManagerResponse)
def download_job(filename: str, request: Request):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = JobsManagerService.download_file(
            shared_core_data, filename)

        return FileResponse(core_response, media_type='application/octet-stream', filename=filename, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.put("/rename", response_model=JobsManagerResponse)
def rename_job(request: Request, rename_data: RenameJobData):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = JobsManagerService.rename_file(
            shared_core_data, rename_data.old_filename, rename_data.new_filename)

        return JSONResponse(content=core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.post("/generate", response_model=JobsManagerResponse)
def generate_job(request: Request, cutting_svg_file: UploadFile = Form(None), marking_svg_file: UploadFile = Form(None), image_file: UploadFile = Form(None), gcode_settings: str = Form(...)):
    try:
        shared_core_data = request.app.shared_core_data
        # Check if SVG files is provided
        cutting_svg_content = cutting_svg_file.file.read(
        ) if cutting_svg_file is not None else None

        marking_svg_content = marking_svg_file.file.read(
        ) if marking_svg_file is not None else None

        # Check if image file is provided
        image_content = image_file.file.read() if image_file is not None else None

        # convert json string to json data
        gcode_settings_dict = json.loads(gcode_settings)

        core_response = JobsManagerService.generate_file(
            shared_core_data, cutting_svg_content, marking_svg_content, image_content, gcode_settings_dict)

        # client cancel generating process
        if core_response.get('data').get('process') == constants.CANCEL_GENERATE_JOB_PROCESS:
            return JSONResponse(core_response, status_code=499)

        return JSONResponse(content=core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.post("/cancel")
def cancel_generate_job(request: Request):
    try:
        shared_core_data = request.app.shared_core_data
        JobsManagerService.cancel_generate_file(
            shared_core_data)

        return JSONResponse({"message": "Cancellation successful"}, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.post("/start", response_model=JobsManagerResponse)
def start_job(request: Request):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = JobsManagerService.start_file(
            shared_core_data)

        return JSONResponse(content=core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/check", response_model=JobsManagerResponse)
def check_opened_job(request: Request):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = JobsManagerService.check_opened_file(shared_core_data)

        return JSONResponse(content=core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.post("/upload_usb_job_file", response_model=JobsManagerResponse)
def upload_job_file_from_usb_device(request: Request, usb_job_data: USBJobFileData):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = JobsManagerService.upload_usb_job_file(
            shared_core_data, usb_job_data.file_path)

        return JSONResponse(content=core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
