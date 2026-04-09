import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    const { id } = await context.params;
    
    const response = await fetch(`http://localhost:5000/api/screening/export/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    // Get the blob data and return it
    const blob = await response.blob();
    
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'text/csv',
        'Content-Disposition': response.headers.get('Content-Disposition') || `attachment; filename="shortlist_${id}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export screening API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
