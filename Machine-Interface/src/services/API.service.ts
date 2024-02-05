import { api } from 'src/boot/axios';
import { Constants } from 'src/constants';

interface FileApiResponse {
  type: string;
  data: {
    process: string;
    message: string;
    file: string;
    filesList: string[];
    success: boolean;
  };
}

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
    api.post<FileApiResponse>(
      getUrl(Constants.API_URI.FILES, `open/${filename}`)
    ),
  deleteFile: (filename: string) =>
    api.delete<FileApiResponse>(
      getUrl(Constants.API_URI.FILES, `delete/${filename}`)
    ),
  renameFile: (oldFilename: string, newFilename: string) => {
    const formData = new FormData();
    formData.append('old_filename', oldFilename);
    formData.append('new_filename', newFilename);
    return api.post<FileApiResponse>(
      getUrl(Constants.API_URI.FILES, 'rename'),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },
  closeFile: () =>
    api.post<FileApiResponse>(getUrl(Constants.API_URI.FILES, 'close')),
  startFile: () =>
    api.post<FileApiResponse>(getUrl(Constants.API_URI.FILES, 'start')),
  getFilesList: () =>
    api.get<FileApiResponse>(getUrl(Constants.API_URI.FILES, 'list')),
  checkOpenFile: () =>
    api.get<FileApiResponse>(getUrl(Constants.API_URI.FILES, 'check')),
};

export default API;
