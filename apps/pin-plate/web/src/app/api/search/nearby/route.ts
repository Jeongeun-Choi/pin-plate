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

const calcDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number => {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const normalizePlace = (
  place: GooglePlace,
  refLat: number,
  refLng: number,
) => ({
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
  distance: place.location
    ? String(
        calcDistance(
          refLat,
          refLng,
          place.location.latitude,
          place.location.longitude,
        ),
      )
    : '',
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const x = searchParams.get('x'); // longitude
  const y = searchParams.get('y'); // latitude
  const radius = searchParams.get('radius') || '300';

  if (!x || !y) {
    return new Response(JSON.stringify({ error: 'x, y are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const lat = parseFloat(y);
  const lng = parseFloat(x);

  try {
    const result = await fetch(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY ?? '',
          'X-Goog-FieldMask': FIELD_MASK,
        },
        body: JSON.stringify({
          includedTypes: ['restaurant', 'cafe', 'bakery'],
          maxResultCount: 10,
          languageCode: 'ko',
          rankPreference: 'DISTANCE',
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: parseFloat(radius),
            },
          },
        }),
      },
    );

    const data = await result.json();
    const places: GooglePlace[] = data.places ?? [];
    const documents = places.map((place) => normalizePlace(place, lat, lng));

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
