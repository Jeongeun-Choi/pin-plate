export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const page = searchParams.get('page') || '1';
  const sort = searchParams.get('sort') || 'distance';
  const x = searchParams.get('x');
  const y = searchParams.get('y');

  try {
    const result = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?&query=${encodeURIComponent(query || '')}&sort=${sort}&page=${page}&x=${x}&y=${y}`,
      {
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_SEARCH_CLIENT_ID || ''}`,
        },
      },
    );

    const data = await result.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
