from typing import Optional
from pydantic import BaseModel


class AIConfigData(BaseModel):
    process: str = ''
    ai_models_list: list[str] = []
    ai_settings_list: list[str] = []
    success: bool = False


class AIImageGeneratorData(BaseModel):
    process: str = ''
    images: list[str] = []
    is_svg_images: bool = False
    success: bool = False


class AIImageGeneratorResponse(BaseModel):
    type: str
    data: AIImageGeneratorData


class AIConfigResponse(BaseModel):
    type: str
    data: AIConfigData


class MainAISetting(BaseModel):
    inferenceSteps: int
    numberOfImages: int
    guidanceScale: int
    isSeedsUsed: bool
    seed: int
    imageWidth: int
    imageHeight: int
    imageForm: str
    model: str


class AISettings(BaseModel):
    settingsId: Optional[int] = None
    name: str
    settings: MainAISetting


class AiGeneratorSettingsData(BaseModel):
    mainPrompts: str
    negativePrompts: str
    inferenceSteps: int
    numberOfImages: int
    guidanceScale: int
    isSeedsUsed: bool
    seed: int
    imageWidth: int
    imageHeight: int
    imageForm: str
    model: str
