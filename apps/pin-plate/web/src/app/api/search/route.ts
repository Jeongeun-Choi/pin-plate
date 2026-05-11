const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.shortFormattedAddress',
  'places.location',
  'places.nationalPhoneNumber',
  'places.googleMapsUri',
  'places.primaryTypeDisplayName',
].join(',');

interface GooglePlace {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  location?: { latitude: number; longitude: number };
  nationalPhoneNumber?: string;
  googleMapsUri?: string;
  primaryTypeDisplayName?: { text: string };
}

const normalizePlace = (place: GooglePlace) => ({
  id: place.id ?? '',
  place_name: place.displayName?.text ?? '',
  category_name: place.primaryTypeDisplayName?.text ?? '',
  category_group_code: '',
  category_group_name: '',
  phone: place.nationalPhoneNumber ?? '',
  address_name: place.shortFormattedAddress ?? place.formattedAddress ?? '',
  road_address_name: place.formattedAddress ?? '',
  x: String(place.location?.longitude ?? ''),
  y: String(place.location?.latitude ?? ''),
  place_url: place.googleMapsUri ?? '',
  distance: '',
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const x = searchParams.get('x');
  const y = searchParams.get('y');

  const emptyResponse = {
    meta: {
      total_count: 0,
      pageable_count: 0,
      is_end: true,
      same_name: { region: [], keyword: query ?? '', selected_region: '' },
    },
    documents: [],
  };

  if (!query) {
    return new Response(JSON.stringify(emptyResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: Record<string, unknown> = {
      textQuery: query,
      languageCode: 'ko',
      maxResultCount: 20,
    };

    if (x && y) {
      body.locationBias = {
        circle: {
          center: { latitude: parseFloat(y), longitude: parseFloat(x) },
          radius: 2000.0,
        },
      };
      body.rankPreference = 'DISTANCE';
    }

    const result = await fetch(
      'https://places.googleapis.com/v1/places:searchText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY ?? '',
          'X-Goog-FieldMask': FIELD_MASK,
        },
        body: JSON.stringify(body),
      },
    );

    const data = await result.json();
    const places: GooglePlace[] = data.places ?? [];
    const documents = places.map(normalizePlace);

    return new Response(
      JSON.stringify({
        meta: {
          total_count: documents.length,
          pageable_count: documents.length,
          is_end: true,
          same_name: { region: [], keyword: query, selected_region: '' },
        },
        documents,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
