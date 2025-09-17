import { NextRequest, NextResponse } from 'next/server';
import { dbAll } from '@/lib/database';
import { isFileExpired, isFileRestricted } from '@/lib/fileUtils';

export async function GET(request: NextRequest) {
  try {
    // Get only public files that are not expired
    const files = await dbAll(
      'SELECT * FROM files WHERE is_public = 1 ORDER BY created_at DESC',
      []
    );

    // Filter out expired files and restricted files
    const validFiles = files.filter((file: any) => {
      if (isFileExpired(file.expires_at)) return false;
      if (isFileRestricted(file.original_name)) return false;
      return true;
    });

    return NextResponse.json({ files: validFiles }, { status: 200 });
  } catch (error) {
    console.error('Get public files error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
