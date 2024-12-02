export interface JobsManagerWebsocketData {
  type: string;
  opened_file: string;
  files_list: JobFileData[];
  time: string;
}

export interface OpenedJobFileData {
  fileName: string;
  fileContent: string;
  materialName: string;
  materialImage: string;
  materialThickness: string;
}

export interface JobFileData {
  file: string;
  date: string;
  size: number;
}
