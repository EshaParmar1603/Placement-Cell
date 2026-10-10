import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env.js';
import { IStorageService, UploadedFileResult } from './storage.interface.js';
import { BadRequestError, NotFoundError } from '../../utils/appError.js';

export class LocalStorageService implements IStorageService {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
    this.ensureDirectory();
  }

  private async ensureDirectory() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      await fs.mkdir(path.join(this.baseDir, 'resumes'), { recursive: true });
    } catch (e) {
      // already exists
    }
  }

  async saveFile(buffer: Buffer, originalName: string, mimeType: string): Promise<UploadedFileResult> {
    await this.ensureDirectory();
    const ext = path.extname(originalName).toLowerCase();
    const allowedExts = ['.pdf', '.docx'];

    if (!allowedExts.includes(ext)) {
      throw new BadRequestError(`Invalid file extension '${ext}'. Allowed: .pdf, .docx`);
    }

    const uniqueName = `${uuidv4()}${ext}`;
    const relativePath = path.join('resumes', uniqueName);
    const absolutePath = path.join(this.baseDir, relativePath);

    await fs.writeFile(absolutePath, buffer);

    return {
      fileName: uniqueName,
      originalName,
      mimeType,
      fileSize: buffer.length,
      filePath: relativePath,
    };
  }

  async getFile(filePath: string): Promise<Buffer> {
    const absolutePath = path.join(this.baseDir, filePath);
    try {
      return await fs.readFile(absolutePath);
    } catch {
      throw new NotFoundError('File not found in storage');
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    const absolutePath = path.join(this.baseDir, filePath);
    try {
      await fs.unlink(absolutePath);
    } catch {
      // file might already be removed
    }
  }
}

export const localStorageService = new LocalStorageService();
