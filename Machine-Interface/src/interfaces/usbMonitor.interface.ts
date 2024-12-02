export interface USBJobMonitorData {
  type: string;
  device_name: string;
  job_files_data: USBFileData[];
  image_files_data: USBFileData[];
  is_connected: boolean;
  time: string;
}

export interface USBFileData {
  id: number;
  file: string;
  path: string;
  mountPoint: string;
  size: number;
  time: string;
  loading?: boolean;
  uploaded?: boolean;
}
