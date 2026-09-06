module.exports = [
  ['fiction', 'Fiction'], ['poetry', 'Poetry'], ['essays', 'Essays'],
  ['technology', 'Technology'], ['science', 'Science'], ['arts-culture', 'Arts & Culture'],
  ['history', 'History'], ['travel', 'Travel'], ['food', 'Food'],
  ['philosophy', 'Philosophy'], ['comedy', 'Comedy'], ['politics', 'Politics'],
  ['design', 'Design'], ['music', 'Music'], ['wellness', 'Wellness'], ['finance', 'Finance'],
].map(([slug, displayName], order) => ({
  slug,
  displayName,
  description: `Writing and ideas about ${displayName.toLowerCase()}.`,
  aliases: [],
  status: 'active',
  order,
}));
