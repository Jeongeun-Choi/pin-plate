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
    const baseUrl = `https://dapi.kakao.com/v2/local/search/category.json`;
    const headers = {
      Authorization: `KakaoAK ${process.env.KAKAO_SEARCH_CLIENT_ID || ''}`,
    };

    const [restaurantRes, cafeRes] = await Promise.all([
      fetch(
        `${baseUrl}?category_group_code=FD6&x=${x}&y=${y}&radius=${radius}&sort=distance&size=5`,
        { headers },
      ),
      fetch(
        `${baseUrl}?category_group_code=CE7&x=${x}&y=${y}&radius=${radius}&sort=distance&size=5`,
        { headers },
      ),
    ]);

    const [restaurantData, cafeData] = await Promise.all([
      restaurantRes.json(),
      cafeRes.json(),
    ]);

    const documents = [
      ...(restaurantData.documents ?? []),
      ...(cafeData.documents ?? []),
    ].sort((a, b) => Number(a.distance) - Number(b.distance));

    return new Response(JSON.stringify({ documents }), {
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
