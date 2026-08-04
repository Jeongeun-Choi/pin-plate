const REQUIRED_PUBLIC_TABLES = ['user', 'account'];
const REQUIRED_AUTH_TABLES = ['users', 'identities'];

export {
  getExistingBetterUsersByEmail,
  getExistingGoogleAccounts,
  getOwnershipCounts,
} from './query-lookups.mjs';

const normalizeString = (value) =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

const pickName = (authUser, profile) => {
  const metadata = authUser.raw_user_meta_data ?? {};
  const name =
    normalizeString(profile?.nickname) ??
    normalizeString(metadata.full_name) ??
    normalizeString(metadata.name) ??
    normalizeString(metadata.user_name) ??
    normalizeString(authUser.email?.split('@')[0]);

  return name ?? 'Pin Plate User';
};

const pickImage = (authUser, profile) => {
  const metadata = authUser.raw_user_meta_data ?? {};

  return (
    normalizeString(profile?.avatar_url) ??
    normalizeString(metadata.avatar_url) ??
    normalizeString(metadata.picture)
  );
};

export const assertTablesExist = async (client) => {
  const { rows } = await client.query(
    `
      select table_schema, table_name
      from information_schema.tables
      where
        (table_schema = 'auth' and table_name = any($1::text[]))
        or
        (table_schema = 'public' and table_name = any($2::text[]))
    `,
    [REQUIRED_AUTH_TABLES, REQUIRED_PUBLIC_TABLES],
  );
  const tableKeys = new Set(
    rows.map((row) => `${row.table_schema}.${row.table_name}`),
  );
  const missingTables = [
    ...REQUIRED_AUTH_TABLES.map((table) => `auth.${table}`),
    ...REQUIRED_PUBLIC_TABLES.map((table) => `public.${table}`),
  ].filter((table) => !tableKeys.has(table));

  if (missingTables.length > 0) {
    throw new Error(`Missing required tables: ${missingTables.join(', ')}`);
  }
};

export const getAuthUsers = async (client, options) => {
  const params = [];
  const conditions = ['u.email is not null'];

  if (!options.shouldIncludeDeletedUsers) {
    conditions.push('u.deleted_at is null');
  }

  let limitClause = '';

  if (options.limit) {
    params.push(options.limit);
    limitClause = `limit $${params.length}`;
  }

  const { rows } = await client.query(
    `
      select
        u.id::text as id,
        u.email,
        u.email_confirmed_at,
        u.confirmed_at,
        u.raw_user_meta_data,
        u.created_at,
        u.updated_at,
        p.nickname,
        p.avatar_url
      from auth.users u
      left join public.profiles p on p.id = u.id
      where ${conditions.join(' and ')}
      order by u.created_at asc, u.id asc
      ${limitClause}
    `,
    params,
  );

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    emailVerified: Boolean(row.email_confirmed_at ?? row.confirmed_at),
    image: pickImage(row, row),
    name: pickName(row, row),
    createdAt: row.created_at ?? new Date(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date(),
  }));
};

export const getGoogleIdentities = async (client, userIds, options) => {
  if (options.shouldSkipGoogleAccounts || userIds.length === 0) return [];

  const { rows } = await client.query(
    `
      select
        i.id::text as identity_id,
        i.user_id::text as user_id,
        i.provider_id,
        i.created_at,
        i.updated_at
      from auth.identities i
      where i.provider = 'google' and i.user_id::text = any($1::text[])
      order by i.created_at asc, i.id asc
    `,
    [userIds],
  );

  return rows.map((row) => ({
    accountId: row.provider_id,
    createdAt: row.created_at ?? new Date(),
    id: `supabase-google-${row.identity_id}`,
    providerId: 'google',
    updatedAt: row.updated_at ?? row.created_at ?? new Date(),
    userId: row.user_id,
  }));
};

export const getExistingBetterUsersById = async (client, userIds) => {
  if (userIds.length === 0) return new Map();

  const { rows } = await client.query(
    `
      select id, email
      from public."user"
      where id = any($1::text[])
    `,
    [userIds],
  );

  return new Map(rows.map((row) => [row.id, row]));
};
