export const getExistingBetterUsersByEmail = async (client, emails) => {
  if (emails.length === 0) return new Map();

  const { rows } = await client.query(
    `
      select id, lower(email) as email
      from public."user"
      where lower(email) = any($1::text[])
    `,
    [emails.map((email) => email.toLowerCase())],
  );

  return new Map(rows.map((row) => [row.email, row]));
};

export const getExistingGoogleAccounts = async (client, googleAccounts) => {
  if (googleAccounts.length === 0) return new Map();

  const accountIds = googleAccounts.map((account) => account.accountId);
  const { rows } = await client.query(
    `
      select id, "accountId", "providerId", "userId"
      from public.account
      where "providerId" = 'google' and "accountId" = any($1::text[])
    `,
    [accountIds],
  );

  return new Map(
    rows.map((row) => [`${row.providerId}:${row.accountId}`, row]),
  );
};

export const getOwnershipCounts = async (client, userIds) => {
  if (userIds.length === 0) {
    return {
      placesByUserId: new Map(),
      postsByUserId: new Map(),
      profilesByUserId: new Map(),
    };
  }

  const postsResult = await client.query(
    `
      select user_id::text as user_id, count(*)::int as count
      from public.posts
      where user_id::text = any($1::text[])
      group by user_id
    `,
    [userIds],
  );
  const placesResult = await client.query(
    `
      select user_id::text as user_id, count(*)::int as count
      from public.places
      where user_id::text = any($1::text[])
      group by user_id
    `,
    [userIds],
  );
  const profilesResult = await client.query(
    `
      select id::text as user_id, count(*)::int as count
      from public.profiles
      where id::text = any($1::text[])
      group by id
    `,
    [userIds],
  );

  return {
    placesByUserId: new Map(
      placesResult.rows.map((row) => [row.user_id, row.count]),
    ),
    postsByUserId: new Map(
      postsResult.rows.map((row) => [row.user_id, row.count]),
    ),
    profilesByUserId: new Map(
      profilesResult.rows.map((row) => [row.user_id, row.count]),
    ),
  };
};
