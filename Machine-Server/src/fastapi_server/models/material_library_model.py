from typing import List, Optional
from pydantic import BaseModel


class MaterialResponseData(BaseModel):
    process: str = ''
    materials_list: list[str] = []
    success: bool = False


class MaterialLibraryResponse(BaseModel):
    type: str
    data: MaterialResponseData


class DitheringSettings(BaseModel):
    algorithm: str
    grayShift: float
    resolution: float
    blockSize: float
    blockDistance: float


class OperationMainSettings(BaseModel):
    power: float
    speed: float
    tool: str


class ThicknessOperation(OperationMainSettings):
    operationId: Optional[int] = None
    operationType: str
    dithering: Optional[DitheringSettings] = None


class MaterialThickness(BaseModel):
    thicknessId: Optional[int] = None
    thicknessValue: float | str
    thicknessOperations: List[ThicknessOperation] = []


class MaterialData(BaseModel):
    materialId: Optional[int] = None
    materialName: str
    materialImage: str | None = None
    materialThicknesses: List[MaterialThickness] = []
    isEditable: Optional[bool] = True
