import json
from fastapi import APIRouter, Form, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from ..models.material_library_model import MaterialData, MaterialLibraryResponse
from ..services.material_library_service import MaterialLibraryService

router = APIRouter()


@router.get("/list", response_model=MaterialLibraryResponse)
def get_materials_list(request: Request):
    try:
        shared_core_data = request.app.shared_core_data

        core_response = MaterialLibraryService.get_materials_list(
            shared_core_data)

        return JSONResponse(core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.post("/add", response_model=MaterialLibraryResponse)
def add_new_material(request: Request, material_data: MaterialData):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = MaterialLibraryService.add_new_material(
            shared_core_data, material_data)

        return JSONResponse(core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.put("/update", response_model=MaterialLibraryResponse)
def update_material(request: Request, material_data: MaterialData):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = MaterialLibraryService.update_material(
            shared_core_data, material_data)

        return JSONResponse(core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.delete("/delete/{material_id}", response_model=MaterialLibraryResponse)
def delete_material(request: Request, material_id: int):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = MaterialLibraryService.delete_material(
            shared_core_data, material_id)
        return JSONResponse(core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
