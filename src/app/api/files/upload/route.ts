import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { dbRun, dbGet } from '@/lib/database';
import { 
  generateUniqueFilename, 
  getUploadPath, 
  ensureUploadDirectory, 
  getFileExpirationDate 
} from '@/lib/fileUtils';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const expireDays = formData.get('expireDays') as string;
    const isPublic = formData.get('isPublic') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Generate unique filename and path
    const uniqueFilename = generateUniqueFilename(file.name);
    const filePath = getUploadPath(uniqueFilename);
    
    // Ensure upload directory exists
    ensureUploadDirectory();

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const fs = require('fs');
    fs.writeFileSync(filePath, buffer);

    // Calculate expiration date
    const expireDaysNum = expireDays ? parseInt(expireDays) : 7;
    const expiresAt = expireDaysNum === 0 ? null : getFileExpirationDate(expireDaysNum);

    // Save file metadata to database
    const result = await dbRun(
      `INSERT INTO files (filename, original_name, file_path, file_size, mime_type, uploaded_by, expires_at, is_public) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uniqueFilename,
        file.name,
        filePath,
        file.size,
        file.type,
        user.id,
        expiresAt,
        isPublic ? 1 : 0
      ]
    );

    const fileId = result.lastID;

    return NextResponse.json(
      {
        message: 'File uploaded successfully',
        file: {
          id: fileId,
          filename: uniqueFilename,
          original_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          expires_at: expiresAt,
          is_public: isPublic
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
