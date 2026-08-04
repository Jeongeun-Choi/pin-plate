const sumMapValues = (valuesByKey) =>
  [...valuesByKey.values()].reduce((sum, value) => sum + value, 0);

export const createSummary = (plan, options) => ({
  affectedExistingPlaces: sumMapValues(plan.ownershipCounts.placesByUserId),
  affectedExistingPosts: sumMapValues(plan.ownershipCounts.postsByUserId),
  affectedExistingProfiles: sumMapValues(plan.ownershipCounts.profilesByUserId),
  applyMode: options.shouldApply ? 'apply' : 'dry-run',
  betterAuthUsersToMerge: options.shouldMergeConflictingBetterAuthUsers
    ? plan.conflictingBetterAuthUserMerges.length
    : 0,
  existingGoogleAccountLinks: plan.existingGoogleAccountLinks.length,
  existingUsers: plan.existingUsers.length,
  googleAccountConflicts: plan.googleAccountConflicts.length,
  googleAccountsToInsert: plan.googleAccountsToInsert.length,
  sourceUsers: plan.sourceUsers.length,
  userConflicts: plan.userConflicts.length,
  usersToInsert: plan.usersToInsert.length,
});

export const printJsonSummary = (summary) => {
  console.log(JSON.stringify(summary, null, 2));
};

export const printSummary = (summary, plan) => {
  console.log(`Mode: ${summary.applyMode}`);
  console.log(`Supabase Auth users scanned: ${summary.sourceUsers}`);
  console.log(`Better Auth users to insert: ${summary.usersToInsert}`);
  console.log(`Better Auth users to merge: ${summary.betterAuthUsersToMerge}`);
  console.log(`Better Auth users already present: ${summary.existingUsers}`);
  console.log(`Google accounts to link: ${summary.googleAccountsToInsert}`);
  console.log(
    `Google accounts already linked: ${summary.existingGoogleAccountLinks}`,
  );
  console.log(
    `Existing posts kept by user id: ${summary.affectedExistingPosts}`,
  );
  console.log(
    `Existing places kept by user id: ${summary.affectedExistingPlaces}`,
  );
  console.log(
    `Existing profiles kept by user id: ${summary.affectedExistingProfiles}`,
  );
  console.log(`User conflicts: ${summary.userConflicts}`);
  console.log(`Google account conflicts: ${summary.googleAccountConflicts}`);

  if (plan.userConflicts.length > 0) {
    console.log('\nUser conflicts:');
    console.table(plan.userConflicts);
  }

  if (plan.googleAccountConflicts.length > 0) {
    console.log('\nGoogle account conflicts:');
    console.table(plan.googleAccountConflicts);
  }

  if (summary.applyMode === 'dry-run') {
    console.log('\nDry-run only. Re-run with --apply to write changes.');
  }
};
