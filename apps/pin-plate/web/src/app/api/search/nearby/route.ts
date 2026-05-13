import { calcDistanceMeters } from '@/utils/distance';
import {
  CUISINE_TYPE_MAP,
  VALID_CUISINE_IDS,
  type CuisineId,
} from '@/features/nearby-search/constants/cuisineTypes';
import { checkGooglePlacesRateLimit } from '@/app/api/_utils/rateLimit';

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
        calcDistanceMeters(
          refLat,
          refLng,
          place.location.latitude,
          place.location.longitude,
        ),
      )
    : '',
});

export async function GET(request: Request) {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return Response.json(
      { error: 'server_configuration_error' },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const xParam = searchParams.get('x');
  const yParam = searchParams.get('y');

  if (!xParam || !yParam) {
    return Response.json({ error: 'x_and_y_required' }, { status: 400 });
  }

  const lat = parseFloat(yParam);
  const lng = parseFloat(xParam);

  if (!isFinite(lat) || lat < -90 || lat > 90) {
    return Response.json({ error: 'invalid_latitude' }, { status: 400 });
  }
  if (!isFinite(lng) || lng < -180 || lng > 180) {
    return Response.json({ error: 'invalid_longitude' }, { status: 400 });
  }

  const radiusRaw = parseFloat(searchParams.get('radius') ?? '1000');
  const radiusMeters = isFinite(radiusRaw)
    ? Math.min(Math.max(radiusRaw, 1), 50000)
    : 1000;

  const cuisineParam = searchParams.get('cuisine') ?? 'all';
  const rawIds = cuisineParam.split(',').map((c) => c.trim());
  const cuisineIds = rawIds.filter((c): c is CuisineId =>
    VALID_CUISINE_IDS.includes(c as CuisineId),
  );
  const validIds =
    cuisineIds.length > 0 ? cuisineIds : (['all'] as CuisineId[]);
  const includedTypes = [
    ...new Set(validIds.flatMap((id) => [...CUISINE_TYPE_MAP[id]])),
  ];

  if (!checkGooglePlacesRateLimit(request)) {
    return Response.json({ error: 'too_many_requests' }, { status: 429 });
  }

  try {
    const result = await fetch(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': FIELD_MASK,
        },
        body: JSON.stringify({
          includedTypes,
          maxResultCount: 20,
          languageCode: 'ko',
          rankPreference: 'DISTANCE',
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: radiusMeters,
            },
          },
        }),
      },
    );

    if (!result.ok) {
      return Response.json({ error: 'upstream_error' }, { status: 500 });
    }

    const data: unknown = await result.json();
    const places: GooglePlace[] = Array.isArray(
      (data as { places?: unknown }).places,
    )
      ? (data as { places: GooglePlace[] }).places
      : [];

    const documents = places.map((place) => normalizePlace(place, lat, lng));

    return Response.json({ documents });
  } catch {
    return Response.json({ error: 'upstream_error' }, { status: 500 });
  }
}
