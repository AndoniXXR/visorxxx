import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get('url');
  if (!fileUrl) {
    return NextResponse.json({ error: 'No url provided' }, { status: 400 });
  }

  try {
    console.log('[DOWNLOAD] Request received:', { fileUrl });
    const response = await fetch(fileUrl);
    if (!response.ok || !response.body) {
      console.error('[DOWNLOAD] Failed to fetch file:', { fileUrl, status: response.status });
      return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
    }
    const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
    const contentLength = response.headers.get('Content-Length');
    const filename = fileUrl.split('/').pop() || 'downloaded_file';

    // Detect type for header logic
    const isImage = contentType.startsWith('image/') && contentType !== 'image/gif';
    const isGif = contentType === 'image/gif';
    const isVideo = contentType.startsWith('video/');

    let headers: Record<string, string> = {
      'Content-Type': contentType,
    };

    if (isImage || isGif) {
      headers['Content-Disposition'] = `attachment; filename="${filename}"`;
      if (contentLength) headers['Content-Length'] = contentLength;
      console.log('[DOWNLOAD] Detected image/gif:', { contentType, contentLength, filename, headers });
    } else if (isVideo) {
      // Reenviar Accept-Ranges y Content-Range si existen
      const acceptRanges = response.headers.get('Accept-Ranges');
      const contentRange = response.headers.get('Content-Range');
      if (acceptRanges) headers['Accept-Ranges'] = acceptRanges;
      if (contentRange) headers['Content-Range'] = contentRange;
      console.log('[DOWNLOAD] Detected video:', { contentType, acceptRanges, contentRange, filename, headers });
    } else {
      // Otro tipo de archivo, solo Content-Type y Content-Disposition
      headers['Content-Disposition'] = `attachment; filename="${filename}"`;
      if (contentLength) headers['Content-Length'] = contentLength;
      console.log('[DOWNLOAD] Detected other file type:', { contentType, contentLength, filename, headers });
    }

    console.log('[DOWNLOAD] Sending response with headers:', headers);
    return new NextResponse(response.body, { headers });
  } catch (error) {
    let errorMessage = 'Error downloading file';
    let errorDetails = '';
    let errorName = '';
    // Manejo correcto del error según TypeScript
    if (error instanceof Error) {
      errorMessage = error.message;
      errorName = error.name;
      errorDetails = error.stack || '';
    } else if (typeof error === 'object' && error !== null) {
      errorDetails = JSON.stringify(error);
    } else {
      errorDetails = String(error);
    }
    console.error('[DOWNLOAD] Error downloading file:', { fileUrl, errorName, errorMessage, errorDetails });
    return NextResponse.json({ error: errorMessage, name: errorName, details: errorDetails }, { status: 500 });
  }
}
