import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { dbGet, dbRun } from '@/lib/database';
import { isFileExpired, isFileRestricted, deleteFile } from '@/lib/fileUtils';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fileId } = await params;
    const action = request.nextUrl.searchParams.get('action'); // 'view' or 'download'

    // Get file from database
    const file = await dbGet('SELECT * FROM files WHERE id = ?', [fileId]);
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Check if file is expired
    if (isFileExpired(file.expires_at)) {
      // Delete expired file
      deleteFile(file.file_path);
      await dbRun('DELETE FROM files WHERE id = ?', [fileId]);
      return NextResponse.json(
        { error: 'File has expired' },
        { status: 410 }
      );
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.file_path)) {
      return NextResponse.json(
        { error: 'File not found on disk' },
        { status: 404 }
      );
    }

    // Check authentication for restricted files
    const token = request.cookies.get('token')?.value;
    const user = token ? verifyToken(token) : null;

    // If file is restricted and user is not logged in, deny access
    if (isFileRestricted(file.original_name) && !user) {
      return NextResponse.json(
        { error: 'Access denied. This file type requires authentication.' },
        { status: 403 }
      );
    }

    // If user is not the owner and file is not public, deny access
    if (user && user.id !== file.uploaded_by && !file.is_public) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // If no user and file is not public, deny access
    if (!user && !file.is_public) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Read file
    const fileBuffer = fs.readFileSync(file.file_path);

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', file.mime_type);
    headers.set('Content-Length', file.file_size.toString());

    if (action === 'download') {
      headers.set('Content-Disposition', `attachment; filename="${file.original_name}"`);
    } else {
      headers.set('Content-Disposition', 'inline');
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('File access error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: fileId } = await params;

    // Get file from database
    const file = await dbGet('SELECT * FROM files WHERE id = ?', [fileId]);
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Check if user owns the file
    if (file.uploaded_by !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete file from disk
    deleteFile(file.file_path);

    // Delete file record from database
    await dbRun('DELETE FROM files WHERE id = ?', [fileId]);

    return NextResponse.json(
      { message: 'File deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
