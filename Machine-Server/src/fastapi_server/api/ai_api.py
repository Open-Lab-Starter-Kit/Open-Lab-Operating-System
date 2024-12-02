from fastapi import APIRouter, Form, HTTPException, Request, Response
from fastapi.responses import JSONResponse

from ..models.ai_model import AIConfigResponse, AIImageGeneratorResponse, AISettings, AiGeneratorSettingsData
from ..services.ai_service import AIService
from ..constants import FastAPIServerConstants as constants

router = APIRouter()


@router.post("/generate", response_model=AIImageGeneratorResponse)
def generate_images(request: Request, ai_generator_settings_data: AiGeneratorSettingsData):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = AIService.ai_generate_images(
            shared_core_data, ai_generator_settings_data)

        # client cancel generating process
        if core_response.get('data').get('process') == constants.CANCEL_GENERATE_JOB_PROCESS:
            return JSONResponse(core_response, status_code=499)

        return JSONResponse(core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.post("/cancel", response_model=AIImageGeneratorResponse)
def cancel_generate_images(request: Request):
    try:
        shared_core_data = request.app.shared_core_data
        AIService.cancel_generate_images(
            shared_core_data)

        return JSONResponse({"message": "Cancellation successful"}, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/config", response_model=AIConfigResponse)
def get_ai_config_data(request: Request):
    try:
        shared_core_data = request.app.shared_core_data

        core_response = AIService.get_ai_config_data(
            shared_core_data)

        return JSONResponse(core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.post("/add", response_model=AIConfigResponse)
def add_new_ai_settings(request: Request, ai_settings: AISettings):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = AIService.add_new_ai_settings(
            shared_core_data, ai_settings)
        return JSONResponse(core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.delete("/delete/{ai_setting_id}", response_model=AIConfigResponse)
def delete_ai_settings(request: Request, ai_setting_id: int):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = AIService.delete_ai_setting(
            shared_core_data, ai_setting_id)
        return JSONResponse(core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.put("/update", response_model=AIConfigResponse)
def update_ai_settings(request: Request, ai_settings: AISettings):
    try:
        shared_core_data = request.app.shared_core_data
        core_response = AIService.update_ai_settings(
            shared_core_data, ai_settings)
        return JSONResponse(core_response, status_code=200)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
