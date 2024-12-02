import { api } from 'src/boot/axios';
import { Constants } from 'src/constants';
import {
  AiGeneratorSettingsData,
  AISetting,
} from 'src/interfaces/aiGeneratorImage.interface';
import {
  AIApiResponse,
  JobApiResponse,
  MaterialLibraryApiResponse,
  AIGeneratorApiResponse,
  ImagesApiResponse,
} from 'src/interfaces/API.interface';
import {
  GcodeFileSettings,
  MaterialData,
} from 'src/interfaces/imageToGcode.interface';

const getUrl: (endpoint: string, params?: string) => string = (
  endpoint,
  params
) => (params ? `${endpoint}${params}` : endpoint);

// api.interceptors.request.use(async (config) => {
//   const currentToken = await getToken();
//   if (currentToken) {
//     config.headers.Authorization = `Bearer ${currentToken}`;
//   }
//   return config;
// });

const API = {
  // getUser: () => api.get<IUser>(getUrl(API_URI.USER)),
  // deleteUser: () => api.delete(getUrl(API_URI.USER)),
  // logOutUser: () => api.post(getUrl(API_URI.LOGOUT)),
  // updateUser: (data: IUser) =>
  //   api.patch<IUser>(getUrl(API_URI_V2.USER), {
  //     ...data,
  //     timezone: timestampToISOWithOffset().slice(-6),
  //   }),
  // updateUserToken: (token: string) =>
  //   api.patch<IApiSuccessfulResponse>(getUrl(API_URI.), {
  //     deviceId: token,
  //   }),
  openFile: (filename: string) =>
    api.post<JobApiResponse>(
      getUrl(Constants.API_URI.JOBS_MANAGER, `open/${filename}`)
    ),
  deleteFile: (filename: string) =>
    api.delete<JobApiResponse>(
      getUrl(Constants.API_URI.JOBS_MANAGER, `delete/${filename}`)
    ),
  renameFile: (oldFilename: string, newFilename: string) => {
    const json_data = {
      old_filename: oldFilename,
      new_filename: newFilename,
    };

    return api.put<JobApiResponse>(
      getUrl(Constants.API_URI.JOBS_MANAGER, 'rename'),
      json_data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  },
  uploadJobFileFromUSB: (filePath: string) => {
    const json_data = {
      file_path: filePath,
    };

    return api.post<JobApiResponse>(
      getUrl(Constants.API_URI.JOBS_MANAGER, 'upload_usb_job_file'),
      json_data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  },
  closeFile: () =>
    api.post<JobApiResponse>(getUrl(Constants.API_URI.JOBS_MANAGER, 'close')),
  startFile: () =>
    api.post<JobApiResponse>(getUrl(Constants.API_URI.JOBS_MANAGER, 'start')),
  checkOpenFile: () =>
    api.get<JobApiResponse>(getUrl(Constants.API_URI.JOBS_MANAGER, 'check')),
  generateGcodeFile: (
    cuttingSVGBlob: Blob | null,
    markingSVGBlob: Blob | null,
    imageBlob: Blob | null,
    gcode_settings: GcodeFileSettings
  ) => {
    // create a formData to be send to the backend fastAPI service
    const formData = new FormData();
    cuttingSVGBlob &&
      formData.append(
        'cutting_svg_file',
        cuttingSVGBlob,
        'modifiedSVGCutting.svg'
      );
    markingSVGBlob &&
      formData.append(
        'marking_svg_file',
        markingSVGBlob,
        'modifiedSVGMarking.svg'
      );
    imageBlob && formData.append('image_file', imageBlob, 'modifiedImage.png');

    formData.append('gcode_settings', JSON.stringify(gcode_settings));

    return api.post<JobApiResponse>(
      getUrl(Constants.API_URI.JOBS_MANAGER, 'generate'),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },
  cancelGenerateGcodeFile: () =>
    api.post(getUrl(Constants.API_URI.JOBS_MANAGER, 'cancel')),
  downloadFile: (filename: string) =>
    api.post(getUrl(Constants.API_URI.JOBS_MANAGER, `download/${filename}`)),

  // images manager
  uploadImage: (imageFile: File) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    return api.post<ImagesApiResponse>(
      getUrl(Constants.API_URI.IMAGES_MANAGER, 'upload'),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },
  fetchImageData: (imageName: string) =>
    api.get<ImagesApiResponse>(
      getUrl(Constants.API_URI.IMAGES_MANAGER, `fetch/${imageName}`)
    ),
  deleteImage: (imageName: string) =>
    api.delete<ImagesApiResponse>(
      getUrl(Constants.API_URI.IMAGES_MANAGER, `delete/${imageName}`)
    ),
  renameImage: (oldImageName: string, newImageName: string) => {
    const json_data = {
      old_image_name: oldImageName,
      new_image_name: newImageName,
    };

    return api.put<ImagesApiResponse>(
      getUrl(Constants.API_URI.IMAGES_MANAGER, 'rename'),
      json_data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  },
  uploadImageFileFromUSB: (imagePath: string) => {
    const json_data = {
      image_path: imagePath,
    };

    return api.post<ImagesApiResponse>(
      getUrl(Constants.API_URI.IMAGES_MANAGER, 'upload_usb_image_file'),
      json_data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  },
  listImagesData: () =>
    api.get<ImagesApiResponse>(
      getUrl(Constants.API_URI.IMAGES_MANAGER, 'list')
    ),

  // AI api calls
  getAIConfigData: () =>
    api.get<AIApiResponse>(getUrl(Constants.API_URI.AI, 'config')),
  generateImageAI: (prompt: string) =>
    api.post<AIApiResponse>(getUrl(Constants.API_URI.AI, `generate/${prompt}`)),
  addNewAISettings: (aiSettings: AISetting) =>
    api.post<AIApiResponse>(getUrl(Constants.API_URI.AI, 'add'), aiSettings, {
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  deleteAISetting: (aiSettingId: number) =>
    api.delete<AIApiResponse>(
      getUrl(Constants.API_URI.AI, `delete/${aiSettingId}`)
    ),
  updateAISetting: (aiSettings: AISetting) =>
    api.put<AIApiResponse>(getUrl(Constants.API_URI.AI, 'update'), aiSettings, {
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  generateAIImages: (aiGeneratorSettingsData: AiGeneratorSettingsData) => {
    return api.post<AIGeneratorApiResponse>(
      getUrl(Constants.API_URI.AI, 'generate'),
      aiGeneratorSettingsData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  },
  cancelGeneratingImages: () =>
    api.post(getUrl(Constants.API_URI.AI, 'cancel')),

  // Materials Library api calls
  getMaterialsList: () =>
    api.get<MaterialLibraryApiResponse>(
      getUrl(Constants.API_URI.MATERIAL_LIBRARY, 'list')
    ),
  addNewMaterial: (materialData: MaterialData) =>
    api.post<MaterialLibraryApiResponse>(
      getUrl(Constants.API_URI.MATERIAL_LIBRARY, 'add'),
      materialData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    ),
  updateMaterial: (materialData: MaterialData) =>
    api.put<MaterialLibraryApiResponse>(
      getUrl(Constants.API_URI.MATERIAL_LIBRARY, 'update'),
      materialData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    ),
  deleteMaterial: (materialId: number) =>
    api.delete<MaterialLibraryApiResponse>(
      getUrl(Constants.API_URI.MATERIAL_LIBRARY, `delete/${materialId}`)
    ),
};

export default API;
