import { mergeConflictingBetterAuthUsers } from './merge.mjs';

const getConflictCount = (plan) =>
  plan.userConflicts.length + plan.googleAccountConflicts.length;

const createMergeLookup = (plan) =>
  new Map(
    plan.conflictingBetterAuthUserMerges.map((merge) => [
      `${merge.betterAuthUserId}:${merge.supabaseUserId}`,
      merge,
    ]),
  );

const isMergeablePlan = (plan) => {
  const mergeLookup = createMergeLookup(plan);
  const hasUnmergeableUserConflict = plan.userConflicts.some(
    (conflict) => conflict.reason !== 'same_email_different_id',
  );
  const hasUnmergeableGoogleConflict = plan.googleAccountConflicts.some(
    (conflict) =>
      !mergeLookup.has(
        `${conflict.existingBetterAuthUserId}:${conflict.userId}`,
      ),
  );

  return !hasUnmergeableUserConflict && !hasUnmergeableGoogleConflict;
};

export const assertPlanIsSafeToApply = (plan, options) => {
  const conflictCount = getConflictCount(plan);

  if (
    conflictCount > 0 &&
    options.shouldMergeConflictingBetterAuthUsers &&
    isMergeablePlan(plan)
  ) {
    return;
  }

  if (conflictCount > 0) {
    const mergeHint = options.shouldMergeConflictingBetterAuthUsers
      ? ''
      : ' Use --merge-conflicting-better-auth-users only after reviewing the dry-run conflicts.';

    throw new Error(
      `Migration has ${conflictCount} conflict(s). Resolve conflicts before --apply.${mergeHint}`,
    );
  }
};

const insertBetterAuthUser = async (client, user) => {
  await client.query(
    `
      insert into public."user"
        (id, name, email, "emailVerified", image, "createdAt", "updatedAt")
      values
        ($1, $2, $3, $4, $5, $6, $7)
      on conflict (id) do nothing
    `,
    [
      user.id,
      user.name,
      user.email,
      user.emailVerified,
      user.image,
      user.createdAt,
      user.updatedAt,
    ],
  );
};

const insertBetterAuthAccount = async (client, account) => {
  await client.query(
    `
      insert into public.account
        (
          id,
          "accountId",
          "providerId",
          "userId",
          "createdAt",
          "updatedAt"
        )
      values
        ($1, $2, $3, $4, $5, $6)
      on conflict (id) do nothing
    `,
    [
      account.id,
      account.accountId,
      account.providerId,
      account.userId,
      account.createdAt,
      account.updatedAt,
    ],
  );
};

export const applyPlan = async (client, plan, options) => {
  const conflictCount =
    plan.userConflicts.length + plan.googleAccountConflicts.length;

  await client.query('begin');

  try {
    await client.query(
      `select pg_advisory_xact_lock(hashtext('pin_plate_supabase_auth_migration'))`,
    );

    for (const user of plan.usersToInsert) {
      await insertBetterAuthUser(client, user);
    }

    if (conflictCount > 0 && options.shouldMergeConflictingBetterAuthUsers) {
      await mergeConflictingBetterAuthUsers(
        client,
        plan.conflictingBetterAuthUserMerges,
        insertBetterAuthUser,
      );
    }

    for (const account of plan.googleAccountsToInsert) {
      await insertBetterAuthAccount(client, account);
    }

    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  }
};
