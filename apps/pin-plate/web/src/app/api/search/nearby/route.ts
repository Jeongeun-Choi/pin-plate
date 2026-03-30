export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const x = searchParams.get('x');
  const y = searchParams.get('y');
  const radius = searchParams.get('radius') || '300';

  if (!x || !y) {
    return new Response(JSON.stringify({ error: 'x, y are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await fetch(
      `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=FD6&x=${x}&y=${y}&radius=${radius}&sort=distance&size=5`,
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
