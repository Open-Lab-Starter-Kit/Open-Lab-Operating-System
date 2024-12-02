import { ImageFileData, UsedImageData } from './imageFilesManagement.interface';
import {
  JobFileData,
  OpenedJobFileData,
} from './jobsFilesManagement.interface';

export interface JobApiResponse {
  type: string;
  data: {
    process: string;
    fileData: OpenedJobFileData;
    filesListData: JobFileData[];
    success: boolean;
  };
}

export interface ImagesApiResponse {
  type: string;
  data: {
    process: string;
    imageData: UsedImageData;
    imagesListData: ImageFileData[];
    success: boolean;
  };
}

export interface AIGeneratorApiResponse {
  type: string;
  data: {
    process: string;
    images: string;
    isSVGImages: boolean;
    success: boolean;
  };
}

export interface AIApiResponse {
  type: string;
  data: {
    process: string;
    aiModelsList: string;
    aiSettingsList: string;
    success: boolean;
  };
}

export interface MaterialLibraryApiResponse {
  type: string;
  data: {
    process: string;
    materialsList: string;
    success: boolean;
  };
}
