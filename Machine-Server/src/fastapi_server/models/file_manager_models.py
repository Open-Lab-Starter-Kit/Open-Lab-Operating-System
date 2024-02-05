from pydantic import BaseModel


class FileBase(BaseModel):
    filename: str


class FileCreate(FileBase):
    content: str


class File(FileBase):
    id: int

    class Config:
        from_attributes = True
