from typing import Dict
from pydantic import BaseModel


class ImagesManagerData(BaseModel):
    process: str = ''
    imageData: Dict[str, str] = {'imageName': '', 'imageSource': '', }
    imagesListData: list[str] = []
    success: bool = False


class ImagesManagerResponse(BaseModel):
    type: str
    data: ImagesManagerData


class RenameImageData(BaseModel):
    old_image_name: str = ''
    new_image_name: str = ''


class USBImageFileData(BaseModel):
    image_name: str = ''
    image_path: str = ''
