const quoteIdent = (identifier) => `"${identifier.replaceAll('"', '""')}"`;

const getUserReferenceColumns = async (client) => {
  const { rows } = await client.query(
    `
      select
        kcu.table_schema,
        kcu.table_name,
        kcu.column_name
      from information_schema.table_constraints tc
      join information_schema.key_column_usage kcu
        on tc.constraint_name = kcu.constraint_name
        and tc.constraint_schema = kcu.constraint_schema
      join information_schema.constraint_column_usage ccu
        on ccu.constraint_name = tc.constraint_name
        and ccu.constraint_schema = tc.constraint_schema
      where
        tc.constraint_type = 'FOREIGN KEY'
        and ccu.table_schema = 'public'
        and ccu.table_name = 'user'
        and ccu.column_name = 'id'
    `,
  );

  return rows;
};

const getQualifiedColumn = (referenceColumn) => ({
  qualifiedTable: `${quoteIdent(referenceColumn.table_schema)}.${quoteIdent(
    referenceColumn.table_name,
  )}`,
  quotedColumn: quoteIdent(referenceColumn.column_name),
});

const countRemainingReferences = async (client, referenceColumns, userId) => {
  let remainingReferences = 0;

  for (const referenceColumn of referenceColumns) {
    const { qualifiedTable, quotedColumn } =
      getQualifiedColumn(referenceColumn);
    const { rows } = await client.query(
      `
        select count(*)::int as count
        from ${qualifiedTable}
        where ${quotedColumn} = $1
      `,
      [userId],
    );

    remainingReferences += rows[0]?.count ?? 0;
  }

  return remainingReferences;
};

const moveUserReferences = async (client, referenceColumns, merge) => {
  for (const referenceColumn of referenceColumns) {
    const { qualifiedTable, quotedColumn } =
      getQualifiedColumn(referenceColumn);

    await client.query(
      `
        update ${qualifiedTable}
        set ${quotedColumn} = $1
        where ${quotedColumn} = $2
      `,
      [merge.supabaseUserId, merge.betterAuthUserId],
    );
  }
};

const releaseConflictingEmail = async (client, merge) => {
  await client.query(
    `
      update public."user"
      set
        email = concat('merged+', id, '@pinonplate.local'),
        "updatedAt" = now()
      where id = $1 and lower(email) = lower($2)
    `,
    [merge.betterAuthUserId, merge.supabaseUser.email],
  );
};

export const mergeConflictingBetterAuthUsers = async (
  client,
  merges,
  insertBetterAuthUser,
) => {
  const referenceColumns = await getUserReferenceColumns(client);

  for (const merge of merges) {
    await releaseConflictingEmail(client, merge);
    await insertBetterAuthUser(client, merge.supabaseUser);
    await moveUserReferences(client, referenceColumns, merge);

    const remainingReferences = await countRemainingReferences(
      client,
      referenceColumns,
      merge.betterAuthUserId,
    );

    if (remainingReferences > 0) {
      throw new Error(
        `Cannot delete Better Auth user ${merge.betterAuthUserId}; ${remainingReferences} reference(s) remain.`,
      );
    }

    await client.query('delete from public."user" where id = $1', [
      merge.betterAuthUserId,
    ]);
  }
};
