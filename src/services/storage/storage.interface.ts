export interface UploadedFileResult {
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
}

export interface IStorageService {
  saveFile(buffer: Buffer, originalName: string, mimeType: string): Promise<UploadedFileResult>;
  getFile(filePath: string): Promise<Buffer>;
  deleteFile(filePath: string): Promise<void>;
}
