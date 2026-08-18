const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { connectToMongoDB } = require('../utils/mongoConnect');
const User = require('../schemas/user.schema');
const Profile = require('../schemas/profile.schema');
const Topic = require('../schemas/topic.schema');
const UserInterest = require('../schemas/user-interest.schema');
const Post = require('../schemas/post.schema');
const PostRevision = require('../schemas/post-revision.schema');
const Draft = require('../schemas/draft.schema');
const Like = require('../schemas/like.schema');
const Save = require('../schemas/save.schema');
const Follow = require('../schemas/follow.schema');
const Comment = require('../schemas/comment.schema');
const Question = require('../schemas/question.schema');
const Collection = require('../schemas/collection.schema');
const ShortSeries = require('../schemas/short-series.schema');
const Competition = require('../schemas/competition.schema');
const CompetitionAudit = require('../schemas/competition-audit.schema');
const InteractionEvent = require('../schemas/interaction-event.schema');
const Membership = require('../schemas/membership.schema');
const Entitlement = require('../schemas/entitlement.schema');
const CreatorSupport = require('../schemas/creator-support.schema');
const ProviderEvent = require('../schemas/provider-event.schema');
const PostSummary = require('../schemas/post-summary.schema');
const Workshop = require('../schemas/workshop.schema');
const WorkshopAttendance = require('../schemas/workshop-attendance.schema');
const CreatorUpdate = require('../schemas/creator-update.schema');
const CreatorRequest = require('../schemas/creator-request.schema');
const Notification = require('../schemas/notification.schema');
const Report = require('../schemas/report.schema');
const ModerationAction = require('../schemas/moderation-action.schema');
const AiUsage = require('../schemas/ai-usage.schema');
const { ensureCanonicalTopics } = require('../services/topic.service');
const { normalizeQuestionText } = require('../utils/question');
const { MaleAvatars, FemaleAvatars } = require('../assets/data');

if (process.env.NODE_ENV === 'production') throw new Error('Development seed is disabled in production');

const DAY = 24 * 60 * 60 * 1000;
const now = new Date();
const ago = days => new Date(now.getTime() - days * DAY);
const ahead = days => new Date(now.getTime() + days * DAY);
const monthKey = now.toISOString().slice(0, 7);
const seedPassword = process.env.SEED_PASSWORD || 'InkRiderDemo123!';

const userFixtures = [
  { key: 'maya', email: 'maya@inkrider.local', username: 'Maya Sen', handle: 'maya-sen', bio: 'Essays on cities, memory, and public life.', writerStatus: 'writer', directRequestsEnabled: true, avatarUrl: FemaleAvatars[0] },
  { key: 'arjun', email: 'arjun@inkrider.local', username: 'Arjun Rao', handle: 'arjun-rao', bio: 'Explaining technology through humane stories.', writerStatus: 'writer', directRequestsEnabled: true, avatarUrl: MaleAvatars[0] },
  { key: 'leila', email: 'leila@inkrider.local', username: 'Leila Noor', handle: 'leila-noor', bio: 'Marine science, field notes, and climate solutions.', writerStatus: 'writer', directRequestsEnabled: true, avatarUrl: FemaleAvatars[1] },
  { key: 'noah', email: 'noah@inkrider.local', username: 'Noah Williams', handle: 'noah-williams', bio: 'A curious reader exploring fiction and design.', writerStatus: 'reader', avatarUrl: MaleAvatars[1] },
  { key: 'priya', email: 'member@inkrider.local', username: 'Priya Mehta', handle: 'priya-mehta', bio: 'Member, collector, and workshop regular.', writerStatus: 'reader', avatarUrl: FemaleAvatars[2] },
  { key: 'moderator', email: 'moderator@inkrider.local', username: 'Demo Moderator', handle: 'demo-moderator', bio: 'Reviews community reports.', writerStatus: 'reader', role: 'moderator', avatarUrl: MaleAvatars[2] },
  { key: 'admin', email: 'admin@inkrider.local', username: 'Demo Admin', handle: 'demo-admin', bio: 'Operates competitions and platform settings.', writerStatus: 'reader', role: 'admin', avatarUrl: MaleAvatars[3] },
];

const postFixtures = [
  {
    key: 'walkable-city', author: 'maya', title: 'The Quiet Architecture of a Walkable City', tags: ['design', 'essays'], topicSlugs: ['design', 'essays'], age: 12,
    coverImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1400&q=80',
    blocks: [
      ['h1', 'Streets are invitations'],
      ['text', 'A walkable city is built from thousands of small invitations: a shaded bench, a safe crossing, and a shopfront that meets the street.'],
      ['quote', 'The best public spaces make ordinary movement feel worth noticing.'],
      ['text', 'Design matters, but maintenance and public trust determine whether those invitations remain open.'],
      ['image', 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80', 'People walking through a tree-lined city street.'],
    ],
  },
  {
    key: 'recommendation-systems', author: 'arjun', title: 'What Recommendation Systems Should Optimize For', tags: ['technology', 'design'], topicSlugs: ['technology', 'design'], age: 3, likesCount: 18,
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
    blocks: [
      ['text', 'A useful recommendation system should expand a reader’s world without losing sight of why they arrived.'],
      ['h2', 'Popularity is a signal, not a verdict'],
      ['text', 'Recency, topic affinity, completion, and deliberate diversity all deserve a role in ranking.'],
      ['code', 'score = affinity + freshness + quality + exploration'],
      ['text', 'The product should explain its choices so readers can correct the system instead of being trapped by it.'],
    ],
  },
  {
    key: 'restoring-reefs', author: 'leila', title: 'Can Restored Reefs Protect Coastal Cities?', tags: ['science', 'wellness'], topicSlugs: ['science'], age: 0.2, likesCount: 11,
    coverImage: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=1400&q=80',
    blocks: [
      ['text', 'Coral and oyster reefs can reduce wave energy before it reaches vulnerable shorelines.'],
      ['h2', 'Protection and habitat can reinforce each other'],
      ['text', 'Restoration succeeds when ecology, local livelihoods, and long-term monitoring are planned together.'],
    ],
  },
  {
    key: 'fiction-station', author: 'maya', title: 'The Last Train from Platform Seven', tags: ['fiction', 'travel'], topicSlugs: ['fiction', 'travel'], age: 1, likesCount: 7,
    coverImage: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1400&q=80',
    blocks: [
      ['text', 'At midnight, the station clock lost a minute and everyone pretended not to notice.'],
      ['text', 'Mira held a ticket printed with a destination she had never heard of, while the final train arrived without a sound.'],
      ['quote', 'Some journeys begin only after the map stops helping.'],
    ],
  },
  {
    key: 'attention-one', author: 'maya', title: 'Attention Begins with One Precise Detail', format: 'short', tags: ['essays', 'wellness'], topicSlugs: ['essays', 'wellness'], age: 0.1,
    blocks: [['text', 'Before interpreting a moment, write down one exact detail: the color of the light, the sound behind a conversation, or the object everyone ignored. Precision gives reflection somewhere honest to begin.']],
  },
  {
    key: 'attention-two', author: 'maya', title: 'Return Tomorrow and Notice What Changed', format: 'short', tags: ['essays', 'wellness'], topicSlugs: ['essays', 'wellness'], age: 0.08,
    blocks: [['text', 'Revisit the same place or idea a day later. The difference between your two observations often reveals more than either observation alone.']],
  },
  {
    key: 'ranking-short', author: 'arjun', title: 'A Two-Minute Test for Better Recommendations', format: 'short', tags: ['technology'], topicSlugs: ['technology'], age: 0.04,
    blocks: [['text', 'Ask whether the next recommendation adds a new author, a new angle, or a useful level of depth. If it adds none of these, popularity is probably doing too much work.']],
  },
  {
    key: 'early-access', author: 'leila', title: 'Field Notes from a Living Breakwater', tags: ['science', 'travel'], topicSlugs: ['science', 'travel'], age: 0, publicAt: ahead(5),
    coverImage: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80',
    blocks: [['text', 'These early field notes follow a living-breakwater team through one week of monitoring waves, sediment, and returning wildlife.'], ['text', 'Members can read the draft release now; the same article becomes public automatically in five days.']],
  },
  {
    key: 'unpublished', author: 'arjun', title: 'Unpublished Demo: Notes on Humane Metrics', tags: ['technology'], topicSlugs: ['technology'], age: 2, publicationStatus: 'unpublished',
    blocks: [['text', 'This unpublished fixture appears only in Arjun’s post-management view and direct owner access.']],
  },
];

// Keep enough published, non-short stories in the demo feed to exercise the
// homepage's section insertion points (after stories 4, 8, 12, and 16).
const discoverySeedStories = [
  'The Small Rituals That Make a Room Feel Like Home',
  'Why Good Interfaces Leave Space for Hesitation',
  'A Field Guide to the Sounds of a Changing Coast',
  'The Long Way Around the Neighborhood',
  'What We Lose When Every Day Is Optimized',
  'Designing Better Questions for Better Decisions',
  'A Map of the Places We Return To',
  'The Case for Slower Digital Mornings',
  'How Public Libraries Become Living Rooms',
  'The Weather Inside a Story',
  'Three Ways to Make Research More Human',
  'Notes from the Edge of a Restored Wetland',
  'The Texture of an Unfinished Idea',
  'What a Good Collection Helps Us Notice',
  'A Practical Guide to Productive Curiosity',
  'When Technology Learns to Wait',
  'The People Behind a Reliable City',
  'Reading the Landscape Before Building on It',
  'The Quiet Work of Making Things Clear',
  'How Small Teams Keep Their Creative Range',
  'The Memory Held by an Ordinary Street',
  'Can a Dashboard Teach Better Judgment?',
  'The Science of Paying Attention Together',
  'A Beginner’s Guide to Better Field Notes',
  'Why Constraints Often Improve the Work',
  'The Future of Community-Led Discovery',
  'A Short History of Useful Friction',
  'What the Shoreline Can Teach a Product Team',
  'The Difference Between Busy and Alive',
  'How Writers Build Trust One Detail at a Time',
  'The Everyday Technology of Belonging',
  'A More Generous Way to Measure Progress',
];
const discoveryCoverImages = [
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=80',
];
const discoveryTaxonomies = [
  { author: 'maya', tags: ['design', 'essays'], topicSlugs: ['design', 'essays'] },
  { author: 'arjun', tags: ['technology', 'design'], topicSlugs: ['technology', 'design'] },
  { author: 'leila', tags: ['science', 'travel'], topicSlugs: ['science', 'travel'] },
  { author: 'maya', tags: ['fiction', 'travel'], topicSlugs: ['fiction', 'travel'] },
  { author: 'leila', tags: ['science', 'wellness'], topicSlugs: ['science', 'wellness'] },
];
postFixtures.push(...discoverySeedStories.map((title, index) => {
  const taxonomy = discoveryTaxonomies[index % discoveryTaxonomies.length];
  return {
    key: `discovery-story-${String(index + 1).padStart(2, '0')}`,
    ...taxonomy,
    title,
    age: 0.5 + index * 0.35,
    likesCount: 6 + ((index * 7) % 25),
    coverImage: discoveryCoverImages[index % discoveryCoverImages.length],
    blocks: [
      ['text', `This seeded discovery story gives the ${taxonomy.tags[0]} feed another useful perspective to browse and rank.`],
      ['h2', 'A little more room to explore'],
      ['text', 'Demo content is intentionally varied so infinite scrolling, section placement, and responsive cards can be tested with a realistic stream.'],
    ],
  };
}));

const makeBlocks = fixture => JSON.stringify(fixture.blocks.map(([type, content, alt], index) => ({ id: `seed-${fixture.key}-${index + 1}`, type, content, ...(alt ? { alt } : {}) })));
const upsert = (Model, filter, update) => Model.findOneAndUpdate(filter, update, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true });

async function seedUsers() {
  const password = await bcrypt.hash(seedPassword, 12);
  const users = new Map();
  for (const fixture of userFixtures) {
    const user = await upsert(User, { email: fixture.email }, {
      $set: { username: fixture.username, bio: fixture.bio, picture: fixture.avatarUrl, password, verified: true, role: fixture.role || 'regular', accountStatus: 'active' },
      $setOnInsert: { followers: 0, followersCount: 0, followingCount: 0, following: [] },
    });
    await upsert(Profile, { userId: user._id }, { $set: { handle: fixture.handle, displayName: fixture.username, bio: fixture.bio, avatarUrl: fixture.avatarUrl, writerStatus: fixture.writerStatus, directRequestsEnabled: Boolean(fixture.directRequestsEnabled), membershipEnabled: fixture.writerStatus === 'writer' } });
    users.set(fixture.key, user);
  }
  return users;
}

async function seedPosts(users, topics) {
  const posts = new Map();
  for (const fixture of postFixtures) {
    const body = makeBlocks(fixture);
    const publicAt = fixture.publicAt || ago(fixture.age);
    const post = await upsert(Post, { author: users.get(fixture.author)._id, title: fixture.title }, {
      $set: {
        body, format: fixture.format || 'article', tags: fixture.tags, topics: fixture.topicSlugs.map(slug => topics.get(slug)?._id).filter(Boolean),
        coverImage: fixture.coverImage || null, publicationStatus: fixture.publicationStatus || 'published', publicAt,
        currentRevision: 1, likesCount: fixture.likesCount || 0, commentsCount: 0,
        metadata: { views: fixture.likesCount ? fixture.likesCount * 14 : 5, shares: fixture.likesCount ? Math.ceil(fixture.likesCount / 3) : 0 },
      },
      $setOnInsert: { createdAt: ago(fixture.age) },
    });
    await upsert(PostRevision, { postId: post._id, revision: 1 }, { $set: { authorId: post.author, title: post.title, body: post.body, coverImage: post.coverImage, format: post.format, tags: post.tags, publicAt: post.publicAt } });
    posts.set(fixture.key, post);
  }
  return posts;
}

async function seedRelationships(users, posts, topics) {
  const follows = [['noah', 'maya'], ['noah', 'arjun'], ['priya', 'maya'], ['priya', 'arjun'], ['priya', 'leila'], ['maya', 'leila']];
  for (const [follower, following] of follows) await upsert(Follow, { followerId: users.get(follower)._id, followingId: users.get(following)._id }, { $setOnInsert: { followerId: users.get(follower)._id, followingId: users.get(following)._id } });
  for (const fixture of userFixtures) {
    const followingIds = follows.filter(([key]) => key === fixture.key).map(([, key]) => users.get(key)._id);
    const followersCount = follows.filter(([, key]) => key === fixture.key).length;
    await User.updateOne({ _id: users.get(fixture.key)._id }, { $set: { following: followingIds, followingCount: followingIds.length, followersCount, followers: followersCount } });
  }

  const likes = [['noah', 'recommendation-systems'], ['noah', 'walkable-city'], ['priya', 'recommendation-systems'], ['priya', 'restoring-reefs'], ['maya', 'restoring-reefs'], ['arjun', 'fiction-station']];
  const saves = [['noah', 'walkable-city'], ['noah', 'fiction-station'], ['priya', 'restoring-reefs'], ['priya', 'recommendation-systems']];
  for (const [user, post] of likes) await upsert(Like, { userId: users.get(user)._id, postId: posts.get(post)._id }, { $setOnInsert: { userId: users.get(user)._id, postId: posts.get(post)._id } });
  for (const [user, post] of saves) await upsert(Save, { userId: users.get(user)._id, postId: posts.get(post)._id }, { $setOnInsert: { userId: users.get(user)._id, postId: posts.get(post)._id } });

  const comments = [
    ['noah', 'walkable-city', 'The connection between maintenance and trust is easy to overlook.'],
    ['priya', 'walkable-city', 'I would love a follow-up comparing two neighborhoods over time.'],
    ['maya', 'recommendation-systems', 'Explanations feel essential if readers are expected to shape the system.'],
    ['arjun', 'restoring-reefs', 'This makes the infrastructure and habitat tradeoff unusually clear.'],
  ];
  for (const [user, post, content] of comments) await upsert(Comment, { userId: users.get(user)._id, postId: posts.get(post)._id, content }, { $setOnInsert: { userId: users.get(user)._id, postId: posts.get(post)._id, content, parentCommentId: null } });
  for (const post of posts.values()) {
    const [likesCount, commentsCount] = await Promise.all([Like.countDocuments({ postId: post._id }), Comment.countDocuments({ postId: post._id })]);
    const fixture = postFixtures.find(item => item.key === [...posts.entries()].find(([, value]) => value._id.equals(post._id))?.[0]);
    await Post.updateOne({ _id: post._id }, { $set: { likesCount: Math.max(likesCount, fixture?.likesCount || 0), commentsCount } });
  }

  const interestMap = { noah: [['fiction', 1], ['design', 0.8], ['technology', 0.5]], priya: [['science', 1], ['technology', 0.8], ['essays', 0.7]], maya: [['design', 1], ['essays', 0.9]], arjun: [['technology', 1], ['design', 0.7]] };
  for (const [userKey, interests] of Object.entries(interestMap)) for (const [slug, weight] of interests) await upsert(UserInterest, { userId: users.get(userKey)._id, topicId: topics.get(slug)._id }, { $set: { explicitWeight: weight, inferredWeight: weight / 4 } });
  for (const key of ['noah', 'priya']) await User.updateOne({ _id: users.get(key)._id }, { $set: { onboardingCompletedAt: ago(20) } });
}

async function seedQuestions(users, posts) {
  const fixtures = [
    { key: 'recommendations', author: 'noah', text: 'How can technology help us discover ideas outside our usual interests?', context: 'Looking for practical product and editorial approaches.', tags: ['technology', 'design'], voters: ['noah', 'priya', 'maya'], related: ['recommendation-systems'], status: 'answered' },
    { key: 'cities', author: 'priya', text: 'What makes a neighborhood genuinely pleasant to explore on foot?', context: 'Beyond sidewalks, which social and maintenance choices matter?', tags: ['design', 'essays'], voters: ['priya', 'noah'], related: ['walkable-city'], status: 'answered' },
    { key: 'ocean', author: 'noah', text: 'Can nature-based coastal defenses work at the scale of a large city?', context: 'Interested in evidence, limitations, and real projects.', tags: ['science'], voters: ['noah', 'priya', 'arjun'], related: ['restoring-reefs'], status: 'answered' },
    { key: 'fiction', author: 'priya', text: 'How do fiction writers make an unfamiliar place feel immediately believable?', context: 'Examples involving sensory detail would be useful.', tags: ['fiction', 'travel'], voters: ['priya'], related: [], status: 'open' },
  ];
  const questions = new Map();
  for (const fixture of fixtures) {
    const voters = fixture.voters.map(key => users.get(key)._id);
    const question = await upsert(Question, { normalizedText: normalizeQuestionText(fixture.text) }, { $set: { text: fixture.text, normalizedText: normalizeQuestionText(fixture.text), context: fixture.context, tags: fixture.tags, author: users.get(fixture.author)._id, upvotes: voters, upvotesCount: voters.length, relatedArticles: fixture.related.map(key => posts.get(key)._id), status: fixture.status } });
    questions.set(fixture.key, question);
  }
  await Post.updateOne({ _id: posts.get('recommendation-systems')._id }, { $set: { sourceQuestion: questions.get('recommendations')._id } });
  await Post.updateOne({ _id: posts.get('walkable-city')._id }, { $set: { sourceQuestion: questions.get('cities')._id } });
  return questions;
}

async function seedAuthoring(users, posts, questions) {
  const drafts = [
    { author: 'maya', title: 'Draft: The Social Life of a Public Bench', format: 'article', tags: ['design', 'essays'], blocks: [['h1', 'Who gets to pause?'], ['text', 'A bench is a tiny piece of social infrastructure, shaped by placement, shade, and who feels welcome to use it.']] },
    { author: 'arjun', title: 'Draft: Measuring Curiosity Without Clickbait', format: 'article', tags: ['technology'], blocks: [['text', 'A metric for curiosity should reward exploration without confusing surprise with value.']] },
    { author: 'leila', title: 'Draft Short: Reading a Tide Pool', format: 'short', tags: ['science'], blocks: [['text', 'Start at the waterline, move slowly, and look for changes in texture before looking for animals.']] },
  ];
  for (const fixture of drafts) {
    const body = JSON.stringify(fixture.blocks.map(([type, content], index) => ({ id: `seed-draft-${fixture.author}-${index}`, type, content })));
    await upsert(Draft, { authorId: users.get(fixture.author)._id, title: fixture.title }, { $set: { format: fixture.format, body, tags: fixture.tags, version: 3, sourceQuestion: fixture.author === 'maya' ? questions.get('fiction')._id : null } });
  }
  await Post.updateOne({ _id: posts.get('attention-one')._id }, { $set: { depthParent: posts.get('walkable-city')._id } });
}

async function seedCollectionsAndSeries(users, posts) {
  const collectionFixtures = [
    { title: 'Designing Humane Systems', author: 'priya', visibility: 'public', postKeys: ['recommendation-systems', 'walkable-city', 'restoring-reefs'], saved: ['noah'], followed: ['noah', 'maya'] },
    { title: 'Stories for a Slow Weekend', author: 'noah', visibility: 'unlisted', postKeys: ['fiction-station', 'walkable-city'], saved: ['priya'], followed: ['priya'] },
    { title: 'Private Research Queue', author: 'priya', visibility: 'private', postKeys: ['early-access'], saved: [], followed: [] },
    { title: 'A Field Guide to Paying Attention', author: 'maya', visibility: 'public', postKeys: ['attention-one', 'attention-two', 'fiction-station'], saved: ['noah', 'priya'], followed: ['noah', 'leila'] },
    { title: 'Climate Stories with Practical Edges', author: 'leila', visibility: 'public', postKeys: ['restoring-reefs', 'early-access', 'walkable-city'], saved: ['maya'], followed: ['maya', 'arjun', 'priya'] },
    { title: 'Better Questions for Better Technology', author: 'arjun', visibility: 'public', postKeys: ['recommendation-systems', 'ranking-short', 'attention-one'], saved: ['maya', 'noah'], followed: ['maya'] },
    { title: 'A Small Library of Place and Memory', author: 'noah', visibility: 'public', postKeys: ['fiction-station', 'walkable-city', 'attention-two'], saved: ['priya'], followed: ['maya', 'priya'] },
    { title: 'Short Reads for a Curious Morning', author: 'priya', visibility: 'public', postKeys: ['attention-one', 'ranking-short', 'attention-two'], saved: ['noah', 'leila'], followed: ['noah', 'maya', 'arjun'] },
  ];
  for (const fixture of collectionFixtures) {
    const postIds = fixture.postKeys.map(key => posts.get(key)._id);
    await upsert(Collection, { author: users.get(fixture.author)._id, title: fixture.title }, { $set: { description: `A demo ${fixture.visibility} collection for testing ordering and visibility.`, posts: postIds, items: postIds.map((post, position) => ({ post, position, addedAt: ago(position) })), visibility: fixture.visibility, isPublic: fixture.visibility === 'public', savedBy: fixture.saved.map(key => users.get(key)._id), savedCount: fixture.saved.length, followers: fixture.followed.map(key => users.get(key)._id), followersCount: fixture.followed.length } });
  }
  const shortIds = ['attention-one', 'attention-two'].map(key => posts.get(key)._id);
  await upsert(ShortSeries, { author: users.get('maya')._id, title: 'A Practice of Attention' }, { $set: { description: 'Two short exercises for observing before interpreting.', visibility: 'public', items: shortIds.map((post, position) => ({ post, position })) } });
}

async function seedCompetitions(users, posts) {
  const fixtures = [
    { key: 'open', title: 'Small Details, Big Worlds', status: 'open', openDate: ago(2), closeDate: ahead(5), resultsDate: ahead(8), votingMode: 'readers', competitionType: 'theme', entries: [['maya', 'walkable-city', ['noah', 'priya']], ['arjun', 'recommendation-systems', ['priya']]] },
    { key: 'judging', title: 'Explain Tomorrow', status: 'judging', openDate: ago(12), closeDate: ago(1), resultsDate: ahead(2), votingMode: 'hybrid', competitionType: 'timed', entries: [['leila', 'restoring-reefs', ['noah', 'priya']], ['arjun', 'recommendation-systems', ['maya']]] },
    { key: 'closed', title: 'Journey in 1,000 Words', status: 'closed', openDate: ago(40), closeDate: ago(30), resultsDate: ago(25), votingMode: 'judges', competitionType: 'reader_choice', entries: [['maya', 'fiction-station', ['noah', 'priya']], ['arjun', 'recommendation-systems', ['leila']]], winnerIndex: 0 },
  ];
  const competitions = new Map();
  for (const fixture of fixtures) {
    let competition = await Competition.findOne({ title: fixture.title });
    if (!competition) competition = new Competition({ title: fixture.title, closeDate: fixture.closeDate });
    competition.set({ description: 'A seeded competition exercising entry, voting, judging, and results states.', status: fixture.status, openDate: fixture.openDate, closeDate: fixture.closeDate, resultsDate: fixture.resultsDate, votingMode: fixture.votingMode, competitionType: fixture.competitionType, rules: ['Submit an owned published post.', 'Respect the announced theme.', 'Reader votes must be independent.'], prizes: [{ rank: 'Winner', amount: 'Featured writer placement' }], maxEntries: 50, createdBy: users.get('admin')._id });
    competition.entries = fixture.entries.map(([author, post, voters], index) => ({ author: users.get(author)._id, post: posts.get(post)._id, postRevision: 1, note: index ? 'A contrasting perspective.' : 'Primary demo entry.', likes: voters.map(key => users.get(key)._id), likesCount: voters.length, judgeScores: fixture.votingMode === 'readers' ? [] : [{ judgeId: users.get('moderator')._id, craft: 8 - index, originality: 9 - index, relevance: 8, note: 'Seeded judging note for staff-console testing.' }] }));
    competition.winnerEntryIds = fixture.winnerIndex == null ? [] : [competition.entries[fixture.winnerIndex]._id];
    await competition.save();
    await upsert(CompetitionAudit, { competitionId: competition._id, action: 'created' }, { $setOnInsert: { competitionId: competition._id, actorId: users.get('admin')._id, action: 'created', details: { seeded: true } } });
    if (fixture.status === 'closed') await upsert(CompetitionAudit, { competitionId: competition._id, action: 'results_published' }, { $set: { actorId: users.get('admin')._id, details: { winnerEntryIds: competition.winnerEntryIds, seeded: true } } });
    competitions.set(fixture.key, competition);
  }
  return competitions;
}

async function seedPremium(users, posts) {
  for (const key of ['priya', 'leila']) await upsert(Membership, { userId: users.get(key)._id }, { $set: { plan: 'member', status: 'active', provider: null, providerCustomerId: null, providerSubscriptionId: null, currentPeriodStart: ago(10), currentPeriodEnd: ahead(20), cancelAtPeriodEnd: key === 'leila' } });
  await upsert(Entitlement, { userId: users.get('noah')._id, capability: 'article_summary', source: 'promotion' }, { $set: { startsAt: ago(1), endsAt: ahead(14), revokedAt: null } });
  await upsert(CreatorSupport, { supporterId: users.get('priya')._id, creatorId: users.get('maya')._id }, { $set: { status: 'active', allocationPercent: 60 } });
  await upsert(CreatorSupport, { supporterId: users.get('priya')._id, creatorId: users.get('arjun')._id }, { $set: { status: 'active', allocationPercent: 40 } });

  const workshopOne = await upsert(Workshop, { hostId: users.get('maya')._id, title: 'Observation into Essay' }, { $set: { description: 'Turn field notes into a shaped personal essay through practical exercises.', startsAt: ahead(3), endsAt: new Date(ahead(3).getTime() + 90 * 60 * 1000), capacity: 24, meetingUrl: 'https://meet.example.test/observation-essay', status: 'published' } });
  const workshopTwo = await upsert(Workshop, { hostId: users.get('leila')._id, title: 'Explain Science Without Flattening It' }, { $set: { description: 'A workshop on clarity, uncertainty, evidence, and narrative structure.', startsAt: ahead(7), endsAt: new Date(ahead(7).getTime() + 2 * 60 * 60 * 1000), capacity: 40, meetingUrl: 'https://meet.example.test/science-writing', status: 'published' } });
  await upsert(WorkshopAttendance, { workshopId: workshopOne._id, userId: users.get('priya')._id }, { $set: { status: 'registered' } });
  await upsert(WorkshopAttendance, { workshopId: workshopTwo._id, userId: users.get('priya')._id }, { $set: { status: 'registered' } });

  const updates = [
    ['maya', 'Why the bench scene changed three times', 'I first wrote the scene as description. The final version works because each revision changes who feels welcome in the space.', 'members'],
    ['maya', 'Notebook scan: observing without interpreting', 'Supporters get the rough field-note prompts behind the next essay.', 'supporters'],
    ['leila', 'Behind the reef-restoration reporting', 'A short account of the evidence I removed, the uncertainty I kept, and the experts who challenged the first draft.', 'members'],
  ];
  for (const [creator, title, body, audience] of updates) await upsert(CreatorUpdate, { creatorId: users.get(creator)._id, title }, { $set: { body, audience, status: 'published', publishedAt: ago(0.5) } });

  const requests = [
    ['priya', 'maya', 'How do you structure an essay from field notes?', 'Please show how fragments become a coherent argument.', 'pending', null],
    ['noah', 'maya', 'Could you write about hostile architecture?', 'I am interested in design choices that quietly exclude people.', 'accepted', 'Yes—I am collecting examples now.'],
    ['priya', 'arjun', 'Explain recommendation diversity', 'A practical piece with examples would be ideal.', 'answered', 'The new article on recommendation systems addresses this.'],
  ];
  for (const [requester, creator, subject, details, status, response] of requests) await upsert(CreatorRequest, { requesterId: users.get(requester)._id, creatorId: users.get(creator)._id, subject }, { $set: { details, status, response, periodKey: monthKey } });

  for (const key of ['walkable-city', 'recommendation-systems', 'restoring-reefs']) {
    const post = posts.get(key);
    const points = JSON.parse(post.body).filter(block => ['text', 'h1', 'h2', 'h3', 'quote'].includes(block.type)).map(block => block.content).slice(0, 3);
    await upsert(PostSummary, { postId: post._id }, { $set: { sourceHash: crypto.createHash('sha256').update(post.body).digest('hex'), points, provider: 'extractive-v1', disclosure: 'Automatically generated extractive overview; verify details against the full article.', generatedAt: ago(0.1) } });
  }
  await upsert(ProviderEvent, { provider: 'stripe', eventId: 'evt_ink_rider_seed_processed' }, { $set: { eventType: 'customer.subscription.updated', payloadHash: crypto.createHash('sha256').update('ink-rider-seed-event').digest('hex'), status: 'processed', processedAt: ago(1), failureCode: null } });
  await upsert(AiUsage, { userId: users.get('leila')._id, day: now.toISOString().slice(0, 10) }, { $set: { requests: 7 } });
}

async function seedEvents(users, posts) {
  const fixtures = [
    ['noah', 'walkable-city', 'open', 'home', 0, null, 2], ['noah', 'walkable-city', 'reading_depth', 'article', null, 50, 1.9],
    ['noah', 'fiction-station', 'complete', 'article', null, 100, 1], ['priya', 'restoring-reefs', 'open', 'home', 1, null, 0.4],
    ['priya', 'restoring-reefs', 'complete', 'article', null, 100, 0.3], ['priya', 'recommendation-systems', 'open', 'search', 2, null, 3],
    ['priya', 'recommendation-systems', 'reading_depth', 'article', null, 75, 2.8], ['maya', 'walkable-city', 'open', 'writer', 0, null, 4],
  ];
  for (let index = 0; index < fixtures.length; index += 1) {
    const [actor, post, eventType, surface, position, readingDepth, age] = fixtures[index];
    await upsert(InteractionEvent, { eventId: `ink-rider-seed-event-${index + 1}` }, { $set: { actorId: users.get(actor)._id, anonymousSessionId: null, eventType, postId: posts.get(post)._id, writerId: posts.get(post).author, surface, position, recommendationRequestId: `seed-recommendation-${actor}`, eventAt: ago(age), metadata: { readingDepth } } });
  }
}

async function seedModerationAndNotifications(users, posts, questions, competitions) {
  const comment = await Comment.findOne({ postId: posts.get('walkable-city')._id });
  const reports = [
    { key: 'pending', reporter: 'noah', subjectType: 'post', subjectId: posts.get('recommendation-systems')._id, reason: 'misinformation', details: 'Seeded pending report for queue testing.', status: 'pending' },
    { key: 'reviewing', reporter: 'priya', subjectType: 'comment', subjectId: comment._id, reason: 'toxicity', details: 'Seeded report currently under review.', status: 'reviewing' },
    { key: 'dismissed', reporter: 'maya', subjectType: 'question', subjectId: questions.get('fiction')._id, reason: 'other', details: 'Seeded dismissed report.', status: 'dismissed' },
  ];
  const reportMap = new Map();
  for (const fixture of reports) reportMap.set(fixture.key, await upsert(Report, { reporterId: users.get(fixture.reporter)._id, subjectType: fixture.subjectType, subjectId: fixture.subjectId }, { $set: { reason: fixture.reason, details: fixture.details, status: fixture.status } }));
  await upsert(ModerationAction, { reportId: reportMap.get('reviewing')._id, action: 'begin_review' }, { $set: { moderatorId: users.get('moderator')._id, note: 'Review started from the seeded staff queue.' } });
  await upsert(ModerationAction, { reportId: reportMap.get('dismissed')._id, action: 'dismiss' }, { $set: { moderatorId: users.get('moderator')._id, note: 'No policy violation found in the seeded example.' } });

  const request = await CreatorRequest.findOne({ requesterId: users.get('priya')._id, creatorId: users.get('maya')._id, status: 'pending' });
  const notificationFixtures = [
    ['noah', 'maya', 'question_answered', 'Your question has a new article', 'Arjun answered a reader-demand question.', `/post/${posts.get('recommendation-systems')._id}`, 'post', posts.get('recommendation-systems')._id, null],
    ['maya', 'priya', 'direct_request_received', 'New direct member request', 'A member asked for an article.', '/members', 'creator_request', request._id, null],
    ['maya', 'admin', 'competition_result', 'You placed in Journey in 1,000 Words', 'The results are now public.', `/explore/competitions/${competitions.get('closed')._id}`, 'competition', competitions.get('closed')._id, ago(2)],
    ['noah', 'moderator', 'moderation', 'Report received', 'Your report is waiting for review.', '/notifications', 'report', reportMap.get('pending')._id, ago(1)],
  ];
  for (const [recipient, actor, type, title, body, href, entityType, entityId, readAt] of notificationFixtures) await upsert(Notification, { recipientId: users.get(recipient)._id, type, entityType, entityId }, { $set: { actorId: users.get(actor)._id, title, body, href, readAt } });
}

async function verifySeed() {
  const counts = Object.fromEntries(await Promise.all([
    ['users', User], ['profiles', Profile], ['posts', Post], ['drafts', Draft], ['questions', Question], ['collections', Collection], ['series', ShortSeries],
    ['competitions', Competition], ['memberships', Membership], ['workshops', Workshop], ['creatorUpdates', CreatorUpdate], ['creatorRequests', CreatorRequest],
    ['notifications', Notification], ['reports', Report], ['events', InteractionEvent],
  ].map(async ([key, Model]) => [key, await Model.countDocuments(key === 'users' ? { email: /@inkrider\.local$/ } : {})])));
  const minimums = { users: 7, profiles: 7, posts: 41, drafts: 3, questions: 4, collections: 3, series: 1, competitions: 3, memberships: 2, workshops: 2, creatorUpdates: 3, creatorRequests: 3, notifications: 4, reports: 3, events: 8 };
  for (const [key, minimum] of Object.entries(minimums)) if (counts[key] < minimum) throw new Error(`Seed verification failed: expected at least ${minimum} ${key}, found ${counts[key]}`);
  return counts;
}

async function run() {
  await connectToMongoDB();
  await ensureCanonicalTopics();
  const topics = new Map((await Topic.find({ status: 'active' })).map(topic => [topic.slug, topic]));
  const users = await seedUsers();
  const posts = await seedPosts(users, topics);
  await seedRelationships(users, posts, topics);
  const questions = await seedQuestions(users, posts);
  await seedAuthoring(users, posts, questions);
  await seedCollectionsAndSeries(users, posts);
  const competitions = await seedCompetitions(users, posts);
  await seedPremium(users, posts);
  await seedEvents(users, posts);
  await seedModerationAndNotifications(users, posts, questions, competitions);
  const counts = await verifySeed();
  console.log('Comprehensive development fixtures are ready:', counts);
  console.log('All demo accounts use password:', seedPassword);
}

run().catch(error => { console.error(error); process.exitCode = 1 }).finally(() => mongoose.disconnect());
