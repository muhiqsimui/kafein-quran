import { NextRequest, NextResponse } from 'next/server';
import { searchVersesLocal } from '@/lib/quran-service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');
  
  if (!q) {
    return NextResponse.json({ 
        search: { 
            query: '', 
            total_results: 0, 
            current_page: 1, 
            total_pages: 0, 
            results: [] 
        } 
    });
  }

  try {
    const data = await searchVersesLocal(q);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search verses' },
      { status: 500 }
    );
  }
}
