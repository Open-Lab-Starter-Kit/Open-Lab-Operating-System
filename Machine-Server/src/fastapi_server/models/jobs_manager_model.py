from typing import Dict
from pydantic import BaseModel


class JobsManagerData(BaseModel):
    process: str = ''
    fileData: Dict[str, str] = {'fileName': '', 'fileContent': '',
                                'materialName': '', 'materialImage': '', 'materialThickness': ''}
    filesListData: list[str] = []
    success: bool = False


class JobsManagerResponse(BaseModel):
    type: str
    data: JobsManagerData


class RenameJobData(BaseModel):
    old_filename: str = ''
    new_filename: str = ''


class USBJobFileData(BaseModel):
    filename: str = ''
    file_path: str = ''
