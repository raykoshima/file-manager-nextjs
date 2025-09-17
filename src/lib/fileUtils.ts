import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export interface FileMetadata {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  expires_at: string | null;
  is_public: boolean;
  created_at: string;
}

// File types that are restricted for non-logged users
const RESTRICTED_EXTENSIONS = ['.exe', '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'];

export function isFileRestricted(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return RESTRICTED_EXTENSIONS.includes(ext);
}

export function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const uuid = uuidv4();
  return `${name}_${uuid}${ext}`;
}

export function getUploadPath(filename: string): string {
  return path.join(process.cwd(), 'uploads', 'files', filename);
}

export function ensureUploadDirectory(): void {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const filesDir = path.join(uploadsDir, 'files');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
  }
}

export function deleteFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

export function isFileExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

export function getFileExpirationDate(days: number | null): string | null {
  if (days === null) return null;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
