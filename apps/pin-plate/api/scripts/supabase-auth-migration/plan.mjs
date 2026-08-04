import {
  getAuthUsers,
  getExistingBetterUsersByEmail,
  getExistingBetterUsersById,
  getExistingGoogleAccounts,
  getGoogleIdentities,
  getOwnershipCounts,
} from './queries.mjs';

const buildUserPlan = (authUsers, existingUsersById, existingUsersByEmail) => {
  const userConflicts = [];
  const usersToInsert = [];
  const existingUsers = [];

  authUsers.forEach((user) => {
    const existingUserById = existingUsersById.get(user.id);
    const existingUserByEmail = existingUsersByEmail.get(
      user.email.toLowerCase(),
    );

    if (existingUserById) {
      existingUsers.push(user);

      if (existingUserById.email !== user.email) {
        userConflicts.push({
          email: user.email,
          reason: 'same_id_different_email',
          userId: user.id,
        });
      }

      return;
    }

    if (existingUserByEmail && existingUserByEmail.id !== user.id) {
      userConflicts.push({
        email: user.email,
        existingBetterAuthUserId: existingUserByEmail.id,
        reason: 'same_email_different_id',
        userId: user.id,
      });
      return;
    }

    usersToInsert.push(user);
  });

  return {
    existingUsers,
    userConflicts,
    usersToInsert,
  };
};

const buildGoogleAccountPlan = (googleAccounts, existingGoogleAccounts) => {
  const googleAccountConflicts = [];
  const googleAccountsToInsert = [];
  const existingGoogleAccountLinks = [];

  googleAccounts.forEach((account) => {
    const key = `${account.providerId}:${account.accountId}`;
    const existingAccount = existingGoogleAccounts.get(key);

    if (existingAccount) {
      if (existingAccount.userId === account.userId) {
        existingGoogleAccountLinks.push(account);
        return;
      }

      googleAccountConflicts.push({
        accountId: account.accountId,
        existingBetterAuthUserId: existingAccount.userId,
        reason: 'google_account_linked_to_different_user',
        userId: account.userId,
      });
      return;
    }

    googleAccountsToInsert.push(account);
  });

  return {
    existingGoogleAccountLinks,
    googleAccountConflicts,
    googleAccountsToInsert,
  };
};

export const buildPlan = async (client, options) => {
  const authUsers = await getAuthUsers(client, options);
  const userIds = authUsers.map((user) => user.id);
  const emails = authUsers.map((user) => user.email).filter(Boolean);
  const googleAccounts = await getGoogleIdentities(client, userIds, options);
  const existingUsersById = await getExistingBetterUsersById(client, userIds);
  const existingUsersByEmail = await getExistingBetterUsersByEmail(
    client,
    emails,
  );
  const existingGoogleAccounts = await getExistingGoogleAccounts(
    client,
    googleAccounts,
  );
  const ownershipCounts = await getOwnershipCounts(client, userIds);
  const userPlan = buildUserPlan(
    authUsers,
    existingUsersById,
    existingUsersByEmail,
  );
  const googleAccountPlan = buildGoogleAccountPlan(
    googleAccounts,
    existingGoogleAccounts,
  );
  const usersById = new Map(authUsers.map((user) => [user.id, user]));
  const conflictingBetterAuthUserMerges = userPlan.userConflicts
    .filter((conflict) => conflict.reason === 'same_email_different_id')
    .map((conflict) => ({
      betterAuthUserId: conflict.existingBetterAuthUserId,
      supabaseUser: usersById.get(conflict.userId),
      supabaseUserId: conflict.userId,
    }))
    .filter((merge) => merge.supabaseUser);

  return {
    ...userPlan,
    ...googleAccountPlan,
    conflictingBetterAuthUserMerges,
    ownershipCounts,
    sourceUsers: authUsers,
  };
};
