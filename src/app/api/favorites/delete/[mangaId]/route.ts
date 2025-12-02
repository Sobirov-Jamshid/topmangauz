import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api/axios';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ mangaId: string }> }
) {
  try {
    const { mangaId } = await params;
    
    if (!mangaId) {
      return NextResponse.json(
        { error: 'Favorite ID kiritilmagan' },
        { status: 400 }
      );
    }

    // Get authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication token topilmadi' },
        { status: 401 }
      );
    }

    // Convert mangaId to integer (this is actually favorite ID)
    const favoriteIdInt = parseInt(mangaId);
    if (isNaN(favoriteIdInt)) {
      return NextResponse.json(
        { error: 'Favorite ID noto\'g\'ri format' },
        { status: 400 }
      );
    }

    // Delete favorite using the favorite ID
    await apiClient.delete(`/favorites/delete/${favoriteIdInt}/`, {
      headers: {
        'Authorization': authHeader
      }
    });
    
    return NextResponse.json(
      { message: 'Sevimlilardan olib tashlandi' },
      { status: 200 }
    );
  } catch (error: any) {
    const errorMessage = error?.response?.data?.detail || 
                        error?.response?.data?.message || 
                        error?.response?.data?.error ||
                        'Sevimlilardan olib tashlashda xatolik yuz berdi';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: error?.response?.status || 500 }
    );
  }
}


