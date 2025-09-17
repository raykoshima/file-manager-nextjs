import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { dbAll } from '@/lib/database';
import { isFileExpired } from '@/lib/fileUtils';

export async function GET(request: NextRequest) {
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

    // Get files uploaded by the user
    const files = await dbAll(
      'SELECT * FROM files WHERE uploaded_by = ? ORDER BY created_at DESC',
      [user.id]
    );

    // Filter out expired files
    const validFiles = files.filter((file: any) => !isFileExpired(file.expires_at));

    return NextResponse.json({ files: validFiles }, { status: 200 });
  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
