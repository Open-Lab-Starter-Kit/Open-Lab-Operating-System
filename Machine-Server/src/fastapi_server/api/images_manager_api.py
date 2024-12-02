from fastapi import APIRouter, Form, UploadFile, HTTPException, File, Request
from fastapi.responses import JSONResponse, FileResponse

from ..models.images_manager_model import ImagesManagerResponse, RenameImageData, USBImageFileData
from ..services.images_manager_service import ImagesManagerService

router = APIRouter()


@router.get("/list", response_model=ImagesManagerResponse)
def images_list_data(request: Request):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = ImagesManagerService.images_list_data(shared_core_data)
        return JSONResponse(content=core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/fetch/{image_name}", response_model=ImagesManagerResponse)
def fetch_image_data(request: Request, image_name: str):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = ImagesManagerService.fetch_image_data(
            shared_core_data, image_name)
        return JSONResponse(content=core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.post("/upload", response_model=ImagesManagerResponse)
def upload_image(request: Request, file: UploadFile = File(...)):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = ImagesManagerService.upload_image(
            shared_core_data, file)
        return JSONResponse(content=core_response, status_code=200)

    except Exception as error:
        print(error)
        raise HTTPException(status_code=500, detail=str(error))


@router.delete("/delete/{image_name}", response_model=ImagesManagerResponse)
def delete_image(request: Request, image_name: str):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = ImagesManagerService.delete_image(
            shared_core_data, image_name)
        return JSONResponse(content=core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.put("/rename", response_model=ImagesManagerResponse)
def rename_image(request: Request, rename_data: RenameImageData):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = ImagesManagerService.rename_image(
            shared_core_data, rename_data.old_image_name, rename_data.new_image_name)
        return JSONResponse(content=core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.post("/upload_usb_image_file", response_model=ImagesManagerResponse)
def upload_image_file_from_usb_device(request: Request, usb_image_data: USBImageFileData):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = ImagesManagerService.upload_usb_image_file(
            shared_core_data, usb_image_data.image_path)
        return JSONResponse(content=core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
