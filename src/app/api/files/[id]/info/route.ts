import { NextRequest, NextResponse } from 'next/server';
import { dbGet } from '@/lib/database';
import { isFileExpired, isFileRestricted } from '@/lib/fileUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fileId } = await params;

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
      return NextResponse.json(
        { error: 'File has expired' },
        { status: 410 }
      );
    }

    // Check if file is restricted for non-authenticated users
    const token = request.cookies.get('token')?.value;
    const isRestricted = isFileRestricted(file.original_name);
    
    if (isRestricted && !token) {
      return NextResponse.json(
        { error: 'File access restricted' },
        { status: 403 }
      );
    }

    // Check if file is public or user has access
    if (!file.is_public && !token) {
      return NextResponse.json(
        { error: 'File is private' },
        { status: 403 }
      );
    }

    const baseUrl = request.nextUrl.origin;
    
    return NextResponse.json({
      id: file.id,
      filename: file.original_name,
      mime_type: file.mime_type,
      file_size: file.file_size,
      is_public: file.is_public,
      expires_at: file.expires_at,
      created_at: file.created_at,
      urls: {
        view: `${baseUrl}/api/files/${file.id}?action=view`,
        download: `${baseUrl}/api/files/${file.id}?action=download`
      },
      embed: {
        image: file.mime_type.startsWith('image/') ? 
          `<img src="${baseUrl}/api/files/${file.id}?action=view" alt="${file.original_name}" style="max-width: 100%; height: auto;" />` : null,
        iframe: ['image/', 'text/', 'application/pdf', 'video/', 'audio/'].some(type => file.mime_type.startsWith(type)) ?
          `<iframe src="${baseUrl}/api/files/${file.id}?action=view" width="100%" height="400" frameborder="0"></iframe>` : null,
        link: `<a href="${baseUrl}/api/files/${file.id}?action=download" target="_blank">${file.original_name}</a>`
      }
    }, { status: 200 });
  } catch (error) {
    console.error('File info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
