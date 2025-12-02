import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api/axios';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mangaId: string }> }
) {
  try {
    const { mangaId } = await params;
    
    if (!mangaId) {
      return NextResponse.json(
        { error: 'Manga ID kiritilmagan' },
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

    // Convert mangaId to integer if it's a string
    const mangaIdInt = parseInt(mangaId);
    if (isNaN(mangaIdInt)) {
      return NextResponse.json(
        { error: 'Manga ID noto\'g\'ri format' },
        { status: 400 }
      );
    }

    // Create a new request with the authorization header
    const result = await apiClient.post(`/favorites/${mangaIdInt}/`, null, {
      headers: {
        'Authorization': authHeader
      }
    });
    
    return NextResponse.json(result.data, { status: 200 });
  } catch (error: any) {
    const errorMessage = error?.response?.data?.detail || 
                        error?.response?.data?.message || 
                        error?.response?.data?.error ||
                        'Sevimlilarga qo\'shishda xatolik yuz berdi';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: error?.response?.status || 500 }
    );
  }
}


