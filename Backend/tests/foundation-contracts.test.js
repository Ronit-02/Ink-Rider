const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { EventEmitter } = require('node:events');

const requiredEnvironment = {
  FRONTEND_URL: 'http://localhost:3000',
  MONGO_USERNAME: 'test',
  MONGO_PASSWORD: 'test',
  DB_NAME: 'ink-rider-test',
  JWT_SECRET: crypto.randomBytes(32).toString('hex'),
  CLOUDINARY_CLOUD_NAME: 'test',
  CLOUDINARY_API_KEY: 'test',
  CLOUDINARY_API_SECRET: 'test',
  EMAIL_HOST: 'localhost',
  EMAIL_PORT: '1025',
  EMAIL: 'test@example.com',
  EMAIL_PASSWORD: 'test',
  GOOGLE_CLIENT_ID: 'test',
  GOOGLE_CLIENT_SECRET: 'test',
  GOOGLE_REFRESH_TOKEN: 'test',
};

for (const [key, value] of Object.entries(requiredEnvironment)) {
  process.env[key] ||= value;
}

const { generateToken } = require('../utils/helper');
const { validateToken, optionalAuth } = require('../middlewares/auth.middleware');
const User = require('../schemas/user.schema');
const Post = require('../schemas/post.schema');
const Competition = require('../schemas/competition.schema');
const Question = require('../schemas/question.schema');
const OTP = require('../schemas/otp.schema');
const Profile = require('../schemas/profile.schema');
const Report = require('../schemas/report.schema');
const Topic = require('../schemas/topic.schema');
const UserInterest = require('../schemas/user-interest.schema');
const InteractionEvent = require('../schemas/interaction-event.schema');
const Collection = require('../schemas/collection.schema');
const ShortSeries = require('../schemas/short-series.schema');
const Membership = require('../schemas/membership.schema');
const Entitlement = require('../schemas/entitlement.schema');
const CreatorSupport = require('../schemas/creator-support.schema');
const ProviderEvent = require('../schemas/provider-event.schema');
const PostSummary = require('../schemas/post-summary.schema');
const Workshop = require('../schemas/workshop.schema');
const WorkshopAttendance = require('../schemas/workshop-attendance.schema');
const CreatorUpdate = require('../schemas/creator-update.schema');
const CreatorRequest = require('../schemas/creator-request.schema');
const Draft = require('../schemas/draft.schema');
const PostRevision = require('../schemas/post-revision.schema');
const Notification = require('../schemas/notification.schema');
const NotificationDelivery = require('../schemas/notification-delivery.schema');
const ModerationAction = require('../schemas/moderation-action.schema');
const CompetitionAudit = require('../schemas/competition-audit.schema');
const CompetitionVote = require('../schemas/competition-vote.schema');
const AiUsage = require('../schemas/ai-usage.schema');
const { extractText, summarizeExtractively } = require('../services/summary.service');
const { mapSubscriptionStatus } = require('../controllers/billing.controller');
const { stripeRequest } = require('../services/stripe.service');
const { parseDraftInput } = require('../controllers/draft.controller');
const { extractOutputText } = require('../services/openai.service');
const { normalizeHandle, buildHandleCandidate } = require('../utils/handle');
const { encodeCursor, decodeCursor } = require('../utils/cursor');
const { rankCandidate, rankCandidates } = require('../services/recommendation.service');
const recommendationFixtures = require('../data/recommendation-fixtures');
const { evaluateRecommendationFixtures } = require('../services/recommendation.service');
const { normalizeQuestionText } = require('../utils/question');
const { effectiveStatus, isVotingOpen, canVoteEntry, competitionStatusCandidates, canScoreEntry, canPublishResults, publishResults, disqualifyEntry, decideAppeal } = require('../controllers/competition.controller');
const { createQuestion } = require('../controllers/question.controller');
const { parseCompetitionFraudMinutes } = require('../controllers/moderation.controller');
const { getVoteSignals, getVoteRisk, analyzeVoteSignals, MAX_NETWORK_VOTES_PER_WINDOW, MAX_DEVICE_VOTES_PER_WINDOW, MIN_CROSS_ACCOUNT_VOTES } = require('../services/competition-fraud.service');
const { publicPostClause, canAccessPost } = require('../services/post-access.service');
const { createRateLimiter } = require('../middlewares/rate-limit.middleware');
const { createRequestTimingMiddleware, createMongoQueryDiagnostics, createErrorMonitor, getResponseBudgetMs } = require('../services/observability.service');
const { parsePostBody, isSafeImageUrl } = require('../controllers/post.controller');
const { googleLogin, signup } = require('../controllers/auth.controller');
const { detectImageMime, validateImageFile } = require('../middlewares/multer.middleware');
const { MAX_ATTEMPTS, calculateRetryAt } = require('../services/notification-delivery.service');
const { judgeAverage, rankCompetitionEntries } = require('../services/competition-scoring.service');
const { buildRobotsTxt, buildSitemapXml, publicSitemapEntries } = require('../services/seo.service');
const { providerReadiness, hasConfiguredValue } = require('../services/provider-readiness.service');
const CompetitionAppeal = require('../schemas/competition-appeal.schema');
const app = require('../src/app');

const createResponse = () => ({
  statusCode: 200,
  payload: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.payload = payload;
    return this;
  },
});

test('validateToken exposes one normalized authenticated identity', async () => {
  const token = generateToken({ id: 'user-123' }, '1m');
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createResponse();
  let nextCalled = false;

  await validateToken(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.deepEqual(req.auth, { userId: 'user-123' });
  assert.equal(Object.isFrozen(req.auth), true);
  assert.equal('user' in req, false);
});

test('validateToken rejects requests without a bearer token', async () => {
  const req = { headers: {} };
  const res = createResponse();

  await validateToken(req, res, () => assert.fail('next must not be called'));

  assert.equal(res.statusCode, 401);
  assert.equal(res.payload.success, false);
});

test('optionalAuth represents anonymous requests explicitly', async () => {
  const req = { headers: {} };
  const res = createResponse();
  let nextCalled = false;

  await optionalAuth(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.equal(req.auth, null);
});

test('user schema supports public profile biography and nullable external identity', () => {
  assert.ok(User.schema.path('bio'));

  const googleIndex = User.schema.indexes().find(([fields]) => fields.googleId === 1);
  assert.ok(googleIndex);
  assert.deepEqual(
    googleIndex[1].partialFilterExpression,
    { googleId: { $type: 'string' } }
  );
});

test('Google sign-in rejects an existing password account without linking or creating a session', async () => {
  const originalFetch = global.fetch;
  const originalFindOne = User.findOne;
  const originalSessionCreate = require('../schemas/session.schema').create;
  let saveCalled = false;
  let sessionCreated = false;
  const passwordUser = {
    _id: 'password-user-id',
    email: 'reader@example.com',
    googleId: null,
    save: async () => { saveCalled = true; },
  };

  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      aud: process.env.GOOGLE_CLIENT_ID,
      iss: 'https://accounts.google.com',
      email_verified: 'true',
      sub: 'google-sub',
      email: 'reader@example.com',
    }),
  });
  User.findOne = async query => (query.googleId ? null : passwordUser);
  const Session = require('../schemas/session.schema');
  Session.create = async () => { sessionCreated = true; };

  try {
    const response = createResponse();
    await googleLogin({ body: { credential: 'credential' }, requestId: 'google-collision-test' }, response);

    assert.equal(response.statusCode, 409);
    assert.deepEqual(response.payload, {
      success: false,
      code: 'GOOGLE_ACCOUNT_COLLISION',
      message: 'An account already exists with this email. Sign in with your password instead.',
    });
    assert.equal(saveCalled, false);
    assert.equal(sessionCreated, false);
  } finally {
    global.fetch = originalFetch;
    User.findOne = originalFindOne;
    Session.create = originalSessionCreate;
  }
});

test('signup identifies an existing Google-linked email clearly', async () => {
  const originalFindOne = User.findOne;
  User.findOne = query => query.email
    ? { select: async () => ({ googleId: 'google-sub' }) }
    : null;
  try {
    const response = createResponse();
    await signup({ body: { username: 'reader', email: 'reader@example.com', password: 'password123' } }, response);
    assert.equal(response.statusCode, 409);
    assert.equal(response.payload.message, 'Email linked with Google account');
  } finally {
    User.findOne = originalFindOne;
  }
});

test('post engagement counters match controller contracts', () => {
  assert.ok(Post.schema.path('likesCount'));
  assert.ok(Post.schema.path('commentsCount'));
  assert.ok(Post.schema.path('topics'));
  assert.deepEqual(Post.schema.path('format').enumValues, ['article', 'short']);
  assert.ok(Post.schema.path('depthParent'));
});

test('question popularity uses a sortable derived counter', () => {
  assert.ok(Question.schema.path('upvotesCount'));
  const popularityIndex = Question.schema.indexes()
    .find(([fields]) => fields.upvotesCount === -1 && fields.createdAt === -1);
  assert.ok(popularityIndex);
  const normalizedIndex = Question.schema.indexes().find(([fields, options]) => fields.normalizedText === 1 && options.unique);
  assert.ok(normalizedIndex);
  assert.equal(normalizeQuestionText('  How do I write? '), 'how do i write');
});

test('expired OTP records have a TTL index', () => {
  const ttlIndex = OTP.schema.indexes().find(([fields]) => fields.expiresAt === 1);
  assert.ok(ttlIndex);
  assert.equal(ttlIndex[1].expireAfterSeconds, 0);
});

test('writer handles normalize into durable URL identifiers', () => {
  assert.equal(normalizeHandle("Élodie O'Connor"), 'elodie-o-connor');
  assert.equal(normalizeHandle('  '), 'writer');
  assert.equal(buildHandleCandidate('elodie-o-connor', 1), 'elodie-o-connor-2');
  assert.ok(buildHandleCandidate('a'.repeat(30), 99).length <= 30);
});

test('profile schema owns unique user and handle identities', () => {
  const indexes = Profile.schema.indexes();
  assert.ok(indexes.some(([fields, options]) => fields.userId === 1 && options.unique));
  assert.ok(indexes.some(([fields, options]) => fields.handle === 1 && options.unique));
});

test('reports use bounded reasons and prevent duplicate subjects per reporter', () => {
  assert.ok(Report.reportReasons.includes('spam'));
  assert.ok(Report.reportReasons.includes('toxicity'));
  const dedupeIndex = Report.schema.indexes().find(([fields, options]) => (
    fields.reporterId === 1
    && fields.subjectType === 1
    && fields.subjectId === 1
    && options.unique
  ));
  assert.ok(dedupeIndex);
  assert.ok(Report.schema.path('subjectType').enumValues.includes('answer'));
});

test('discovery cursors round-trip structured pagination state', () => {
  const state = {
    createdAt: '2026-08-18T12:00:00.000Z',
    id: '507f1f77bcf86cd799439011',
  };
  assert.deepEqual(decodeCursor(encodeCursor(state)), state);
  assert.equal(decodeCursor('not-valid-json'), null);
});

test('personalization models preserve canonical and append-only source records', () => {
  assert.ok(Topic.schema.indexes().some(([fields, options]) => fields.slug === 1 && options.unique));
  assert.ok(UserInterest.schema.indexes().some(([fields, options]) => (
    fields.userId === 1 && fields.topicId === 1 && options.unique
  )));
  assert.ok(InteractionEvent.eventTypes.includes('impression'));
  assert.ok(InteractionEvent.eventTypes.includes('complete'));
  assert.ok(InteractionEvent.schema.indexes().some(([fields, options]) => fields.eventId === 1 && options.unique));
});

test('collections preserve explicit item order, visibility, and repairable save counts', () => {
  assert.ok(Collection.schema.path('items'));
  assert.ok(Collection.schema.path('visibility'));
  assert.ok(Collection.schema.path('savedCount'));
  assert.ok(Collection.schema.path('followersCount'));
  assert.ok(Collection.schema.indexes().some(([fields]) => fields.visibility === 1 && fields.createdAt === -1));
});

test('short series enforce ordered progression and single-series membership', () => {
  assert.ok(ShortSeries.schema.path('items'));
  assert.ok(ShortSeries.schema.path('visibility'));
  assert.ok(ShortSeries.schema.indexes().some(([fields, options]) => fields['items.post'] === 1 && options.unique));
});

test('deterministic recommendations prioritize explicit affinity and expose reasons', () => {
  const asOf = new Date('2026-08-18T12:00:00.000Z');
  const context = {
    asOf,
    interestTopicIds: new Set(['topic-technology']),
    followedWriterIds: new Set(['writer-followed']),
  };
  const followed = rankCandidate({
    _id: 'post-followed', author: { _id: 'writer-followed', username: 'Asha' },
    topics: [], createdAt: asOf, likesCount: 0,
  }, context);
  const unrelated = rankCandidate({
    _id: 'post-other', author: { _id: 'writer-other', username: 'Ben' },
    topics: [], createdAt: asOf, likesCount: 0,
  }, context);
  assert.ok(followed.score > unrelated.score);
  assert.equal(followed.reason, 'Because you follow Asha');
});

test('recommendation diversity avoids consecutive author repetition when alternatives exist', () => {
  const asOf = new Date('2026-08-18T12:00:00.000Z');
  const posts = [
    { _id: '1', author: { _id: 'same' }, topics: [], createdAt: asOf, likesCount: 100 },
    { _id: '2', author: { _id: 'same' }, topics: [], createdAt: asOf, likesCount: 90 },
    { _id: '3', author: { _id: 'different' }, topics: [], createdAt: asOf, likesCount: 1 },
  ];
  const ranked = rankCandidates(posts, { asOf, interestTopicIds: new Set(), followedWriterIds: new Set() });
  assert.notEqual(ranked[0].authorId, ranked[1].authorId);
});

test('offline recommendation fixtures report relevance and diversity metrics', () => {
  const results = evaluateRecommendationFixtures(recommendationFixtures);
  assert.equal(results.length, 2);
  assert.ok(results.every(result => result.metrics.precisionAtLimit >= 0.5));
  assert.ok(results.every(result => result.metrics.authorDiversity >= 0.75));
  assert.ok(results.every(result => result.metrics.topicDiversity >= 0.75));
  assert.ok(results.every(result => result.metrics.maxConsecutiveAuthor <= 2));
});

test('competition lifecycle derives deadline states without trusting stale labels', () => {
  const now = new Date('2026-08-18T12:00:00.000Z');
  assert.equal(effectiveStatus({ status: 'open', openDate: new Date('2026-08-19'), closeDate: new Date('2026-08-20') }, now), 'draft');
  assert.equal(effectiveStatus({ status: 'open', openDate: new Date('2026-08-01'), closeDate: new Date('2026-08-18') }, now), 'judging');
  assert.equal(effectiveStatus({ status: 'judging', openDate: new Date('2026-08-01'), closeDate: new Date('2026-08-20') }, now), 'open');
  assert.equal(effectiveStatus({ status: 'draft', openDate: new Date('2026-08-01'), closeDate: new Date('2026-08-20') }, now), 'open');
  assert.equal(effectiveStatus({ status: 'judging', resultsDate: new Date('2026-08-17') }, now), 'closed');
  assert.deepEqual(competitionStatusCandidates('judging'), ['open', 'judging']);
  assert.deepEqual(competitionStatusCandidates('closed'), ['judging', 'closed']);
  const closed = { status: 'judging', resultsDate: new Date('2026-08-17') };
  assert.deepEqual(canScoreEntry(closed, { status: 'submitted' }, now), { allowed: false, reason: 'COMPETITION_CLOSED' });
  const openCompetition = { status: 'open', openDate: new Date('2026-08-01'), closeDate: new Date('2026-08-20'), resultsDate: null };
  assert.deepEqual(canScoreEntry(openCompetition, { status: 'disqualified' }, now), { allowed: false, reason: 'ENTRY_DISQUALIFIED' });
  assert.equal(canPublishResults(openCompetition, now), false);
  assert.equal(canPublishResults({ ...openCompetition, closeDate: new Date('2026-08-17') }, now), true);
  assert.equal(canPublishResults({ ...openCompetition, status: 'judging', closeDate: new Date('2026-08-17'), resultsDate: new Date('2026-08-19') }, now), true);
});

test('competition voting rejects self-votes, closed contests, duplicate votes, and disqualified entries', () => {
  const now = new Date('2026-08-18T12:00:00.000Z');
  const openCompetition = { status: 'open', openDate: new Date('2026-08-01'), closeDate: new Date('2026-08-20'), resultsDate: null };
  const entry = { author: 'writer-a', likes: ['reader-b'] };
  assert.equal(isVotingOpen(openCompetition, now), true);
  assert.deepEqual(canVoteEntry(openCompetition, { ...entry, likes: [] }, 'writer-a', now), { allowed: false, reason: 'SELF_VOTE' });
  assert.deepEqual(canVoteEntry(openCompetition, entry, 'reader-b', now), { allowed: false, reason: 'ALREADY_VOTED' });
  assert.deepEqual(canVoteEntry(openCompetition, { ...entry, status: 'disqualified', likes: [] }, 'reader-c', now), { allowed: false, reason: 'ENTRY_DISQUALIFIED' });
  assert.deepEqual(canVoteEntry({ ...openCompetition, resultsDate: new Date('2026-08-18T11:00:00.000Z') }, { ...entry, likes: [] }, 'reader-c', now), { allowed: false, reason: 'VOTING_CLOSED' });
  assert.deepEqual(canVoteEntry({ ...openCompetition, votingMode: 'judges' }, { ...entry, likes: [] }, 'reader-c', now), { allowed: false, reason: 'VOTING_CLOSED' });
});

test('competition judging and disqualification operations respect lifecycle phases', async () => {
  const now = new Date('2026-08-18T12:00:00.000Z');
  const openCompetition = { status: 'open', openDate: new Date('2026-08-01'), closeDate: new Date('2026-08-20'), resultsDate: null };
  assert.deepEqual(canScoreEntry(openCompetition, { status: 'submitted' }, now), { allowed: false, reason: 'COMPETITION_NOT_JUDGING' });
  assert.deepEqual(canScoreEntry({ ...openCompetition, closeDate: new Date('2026-08-17') }, { status: 'submitted' }, now), { allowed: true, reason: null });

  const originalFindById = Competition.findById;
  const originalAuditCreate = CompetitionAudit.create;
  const entry = { _id: '507f1f77bcf86cd799439012', status: 'submitted', author: '507f1f77bcf86cd799439013' };
  const competition = {
    status: 'open',
    openDate: new Date('2026-08-01'),
    closeDate: new Date('2026-08-20'),
    resultsDate: null,
    winnerEntryIds: [],
    entries: { id: id => id === entry._id ? entry : null },
    save: async () => {},
  };
  Competition.findById = async () => competition;
  CompetitionAudit.create = async () => {};
  try {
    const response = createResponse();
    await disqualifyEntry({ params: { id: '507f1f77bcf86cd799439011', entryId: entry._id }, body: { reason: 'Policy violation' }, auth: { userId: '507f1f77bcf86cd799439014' } }, response);
    assert.equal(response.statusCode, 200);
    assert.equal(response.payload.data.status, 'disqualified');

    const duplicate = createResponse();
    await disqualifyEntry({ params: { id: '507f1f77bcf86cd799439011', entryId: entry._id }, body: { reason: 'Another reason' }, auth: { userId: '507f1f77bcf86cd799439014' } }, duplicate);
    assert.equal(duplicate.statusCode, 409);
  } finally {
    Competition.findById = originalFindById;
    CompetitionAudit.create = originalAuditCreate;
  }
});

test('accepted competition appeals cannot change published results and require a decision note', async () => {
  const originalAppealFindOne = CompetitionAppeal.findOne;
  const originalCompetitionFindById = Competition.findById;
  const appeal = { status: 'pending', entryId: '507f1f77bcf86cd799439012' };
  const competition = {
    status: 'closed',
    openDate: new Date('2026-08-01'),
    closeDate: new Date('2026-08-17'),
    resultsDate: new Date('2026-08-18'),
    entries: { id: () => ({ author: '507f1f77bcf86cd799439013', status: 'disqualified' }) },
  };
  CompetitionAppeal.findOne = async () => appeal;
  Competition.findById = async () => competition;
  try {
    const missingNote = createResponse();
    await decideAppeal({ params: { id: '507f1f77bcf86cd799439011', appealId: '507f1f77bcf86cd799439015' }, body: { decision: 'accepted' }, auth: { userId: '507f1f77bcf86cd799439014' } }, missingNote);
    assert.equal(missingNote.statusCode, 400);

    const closedResults = createResponse();
    await decideAppeal({ params: { id: '507f1f77bcf86cd799439011', appealId: '507f1f77bcf86cd799439015' }, body: { decision: 'accepted', note: 'Evidence reviewed' }, auth: { userId: '507f1f77bcf86cd799439014' } }, closedResults);
    assert.equal(closedResults.statusCode, 409);
    assert.equal(closedResults.payload.message, 'Published competition results cannot be changed by an appeal');
  } finally {
    CompetitionAppeal.findOne = originalAppealFindOne;
    Competition.findById = originalCompetitionFindById;
  }
});

test('competition results endpoint refuses to publish before judging begins', async () => {
  const originalFindById = Competition.findById;
  Competition.findById = async () => ({
    status: 'open',
    openDate: new Date('2026-08-01'),
    closeDate: new Date('2099-08-20'),
    resultsDate: null,
  });
  try {
    const response = createResponse();
    await publishResults({
      params: { id: '507f1f77bcf86cd799439011' },
      body: { winnerEntryIds: ['507f1f77bcf86cd799439012'] },
    }, response);
    assert.equal(response.statusCode, 409);
    assert.equal(response.payload.message, 'Results can only be published after voting closes');
  } finally {
    Competition.findById = originalFindById;
  }
});

test('rate limiters can isolate authenticated accounts sharing one network address', () => {
  const limiter = createRateLimiter({
    windowMs: 60_000,
    max: 1,
    keyPrefix: 'test-account-limit',
    keyResolver: req => req.auth.userId,
  });
  const call = userId => {
    let nextCalled = false;
    let statusCode = 200;
    const response = {
      setHeader: () => {},
      status: code => { statusCode = code; return response; },
      json: () => response,
    };
    limiter({ ip: 'shared-network', auth: { userId } }, response, () => { nextCalled = true; });
    return { nextCalled, statusCode };
  };

  assert.deepEqual(call('user-a'), { nextCalled: true, statusCode: 200 });
  assert.deepEqual(call('user-b'), { nextCalled: true, statusCode: 200 });
  assert.deepEqual(call('user-a'), { nextCalled: false, statusCode: 429 });
});

test('competition ranking is deterministic and preserves tied ranks', () => {
  const entries = [
    { _id: 'entry-b', likesCount: 4, createdAt: new Date('2026-08-01'), judgeScores: [] },
    { _id: 'entry-a', likesCount: 4, createdAt: new Date('2026-08-02'), judgeScores: [] },
    { _id: 'entry-c', likesCount: 1, createdAt: new Date('2026-08-03'), judgeScores: [] },
  ];
  const ranking = rankCompetitionEntries(entries, 'readers');
  assert.deepEqual(ranking.map(item => [item.id, item.rank]), [['entry-b', 1], ['entry-a', 1], ['entry-c', 3]]);
  assert.equal(judgeAverage({ judgeScores: [{ craft: 8, originality: 7, relevance: 9 }] }), 8);
});

test('competition disqualification and appeals are durable and auditable', () => {
  assert.ok(Competition.schema.path('entries.status').enumValues.includes('disqualified'));
  assert.ok(CompetitionAppeal.schema.indexes().some(([fields, options]) => fields.competitionId === 1 && fields.entryId === 1 && fields.appellantId === 1 && options.unique));
  assert.ok(CompetitionAudit.schema.path('action').enumValues.includes('entry_disqualified'));
  assert.ok(CompetitionAudit.schema.path('action').enumValues.includes('appeal_decided'));
  assert.ok(CompetitionAudit.schema.path('action').enumValues.includes('fraud_reviewed'));
});

test('competition vote fraud signals are durable without storing raw network identity', () => {
  assert.ok(CompetitionVote.schema.path('ipHash'));
  assert.ok(CompetitionVote.schema.path('userAgentHash'));
  assert.equal(CompetitionVote.schema.path('ipHash').options.select, undefined);
  assert.ok(CompetitionVote.schema.indexes().some(([fields, options]) => fields.competitionId === 1 && fields.voterId === 1 && fields.entryId === 1 && options.unique));
  assert.equal(MAX_NETWORK_VOTES_PER_WINDOW, 10);
  assert.equal(MAX_DEVICE_VOTES_PER_WINDOW, 8);
  const signals = getVoteSignals({ ip: '203.0.113.10', get: () => 'browser-a' });
  assert.equal(signals.ipHash.length, 64);
  assert.equal(signals.userAgentHash.length, 64);
  assert.notEqual(signals.ipHash, '203.0.113.10');
});

test('competition vote risk blocks a device burst even when the network threshold is not reached', async () => {
  const originalCountDocuments = CompetitionVote.countDocuments;
  CompetitionVote.countDocuments = async query => query.ipHash ? 2 : 8;
  try {
    const risk = await getVoteRisk({ competitionId: 'competition-1', ipHash: 'ip-hash', userAgentHash: 'device-hash' });
    assert.equal(risk.blocked, true);
    assert.equal(risk.reason, 'DEVICE_BURST');
    assert.equal(risk.count, 2);
    assert.equal(risk.deviceCount, 8);
  } finally {
    CompetitionVote.countDocuments = originalCountDocuments;
  }
});

test('competition fraud analysis exposes cross-account concentration without raw identifiers', () => {
  const now = new Date('2026-08-24T12:00:00.000Z');
  const votes = [1, 2, 3, 4].map(index => ({
    competitionId: 'competition-1',
    voterId: `voter-${index}`,
    ipHash: 'network-hash',
    userAgentHash: `device-${index}`,
    createdAt: new Date(now.getTime() - index * 1000),
  }));
  votes.push({
    competitionId: 'competition-1',
    voterId: 'old-voter',
    ipHash: 'network-hash',
    userAgentHash: 'old-device',
    createdAt: new Date(now.getTime() - 11 * 60 * 1000),
  });

  const signals = analyzeVoteSignals({ votes, now });
  assert.equal(MIN_CROSS_ACCOUNT_VOTES, 4);
  assert.deepEqual(signals, [{
    competitionId: 'competition-1',
    signalType: 'NETWORK',
    distinctVoterCount: 4,
    voteCount: 4,
    windowMs: 10 * 60 * 1000,
    reason: 'CROSS_ACCOUNT_SIGNAL',
  }]);
  assert.equal(JSON.stringify(signals).includes('network-hash'), false);
  assert.equal(JSON.stringify(signals).includes('voter-1'), false);
});

test('competition fraud review windows enforce bounded integer minutes', () => {
  assert.equal(parseCompetitionFraudMinutes(undefined), 10);
  assert.equal(parseCompetitionFraudMinutes('1'), 1);
  assert.equal(parseCompetitionFraudMinutes('60'), 60);
  assert.equal(parseCompetitionFraudMinutes('0'), null);
  assert.equal(parseCompetitionFraudMinutes('61'), null);
  assert.equal(parseCompetitionFraudMinutes('10.5'), null);
});

test('SEO discovery artifacts expose only public routes and escape XML values', () => {
  const robots = buildRobotsTxt('https://inkrider.example/');
  assert.match(robots, /Disallow: \/api\//);
  assert.match(robots, /Disallow: \/staff/);
  assert.match(robots, /Sitemap: https:\/\/inkrider\.example\/sitemap\.xml/);

  const entries = publicSitemapEntries({
    posts: [{ _id: 'post-1', publicAt: '2026-08-25T00:00:00.000Z' }],
    profiles: [{ handle: 'maya & sen', updatedAt: '2026-08-25T00:00:00.000Z' }],
  });
  const sitemap = buildSitemapXml({ siteUrl: 'https://inkrider.example', entries });
  assert.match(sitemap, /<loc>https:\/\/inkrider\.example\/post\/post-1<\/loc>/);
  assert.match(sitemap, /maya%20%26%20sen/);
  assert.equal(sitemap.includes('<script>'), false);
});

test('provider readiness reports capability booleans without exposing credential values', () => {
  const readiness = providerReadiness({
    CLOUDINARY_CLOUD_NAME: 'cloud', CLOUDINARY_API_KEY: 'key', CLOUDINARY_API_SECRET: 'secret',
    EMAIL_HOST: 'smtp.example', EMAIL_PORT: '587', EMAIL: 'writer@example.test', EMAIL_PASSWORD: 'password',
    GOOGLE_CLIENT_ID: 'google-client', STRIPE_SECRET_KEY: 'stripe-key', STRIPE_MEMBERSHIP_PRICE_ID: 'price',
    STRIPE_WEBHOOK_SECRET: 'webhook', OPENAI_API_KEY: 'openai-key', ERROR_MONITOR_URL: 'https://monitor.example', PUSH_PROVIDER_URL: 'https://push.example',
  });
  assert.equal(readiness.configured, readiness.total);
  assert.deepEqual(readiness.missing, []);
  assert.equal(JSON.stringify(readiness).includes('stripe-key'), false);
  assert.equal(JSON.stringify(readiness).includes('openai-key'), false);
  assert.equal(JSON.stringify(readiness).includes('password'), false);
});

test('provider readiness recognizes Gmail OAuth as an email delivery alternative to SMTP', () => {
  const readiness = providerReadiness({
    EMAIL_HOST: 'smtp.gmail.com',
    EMAIL_PORT: '465',
    EMAIL: 'writer@example.test',
    GOOGLE_CLIENT_ID: 'google-client',
    GOOGLE_CLIENT_SECRET: 'google-secret',
    GOOGLE_REFRESH_TOKEN: 'refresh-token',
  });
  assert.equal(readiness.checks.email, true);
  assert.equal(readiness.checks.googleSignIn, true);

  const incomplete = providerReadiness({
    GOOGLE_CLIENT_ID: 'google-client',
    GOOGLE_CLIENT_SECRET: 'google-secret',
  });
  assert.equal(incomplete.checks.email, false);

  const invalidPort = providerReadiness({
    EMAIL_HOST: 'smtp.gmail.com',
    EMAIL_PORT: 'not-a-port',
    EMAIL: 'writer@example.test',
    GOOGLE_CLIENT_ID: 'google-client',
    GOOGLE_CLIENT_SECRET: 'google-secret',
    GOOGLE_REFRESH_TOKEN: 'refresh-token',
  });
  assert.equal(invalidPort.checks.email, false);

  assert.equal(providerReadiness({ ERROR_MONITOR_URL: 'https://monitor.example.test/ingest' }).checks.errorMonitor, true);
  assert.equal(providerReadiness({ ERROR_MONITOR_URL: 'monitor.example.test/ingest' }).checks.errorMonitor, false);
  assert.equal(hasConfiguredValue('   '), false);
  assert.equal(providerReadiness({ OPENAI_API_KEY: '   ', STRIPE_SECRET_KEY: ' ', STRIPE_MEMBERSHIP_PRICE_ID: 'price' }).checks.openAiWritingAssistant, false);
  assert.equal(providerReadiness({ GOOGLE_CLIENT_ID: '   ' }).checks.googleSignIn, false);
});

test('Stripe provider requests abort at the bounded provider timeout', async () => {
  await assert.rejects(
    stripeRequest('checkout/sessions', {}, {
      secretKey: 'test-stripe-key',
      timeoutMs: 1,
      fetchImpl: (_url, options) => new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
      }),
    }),
    error => error.code === 'PROVIDER_TIMEOUT' && error.message === 'Stripe request timed out',
  );
});

test('question targeting accepts only writer profiles', async () => {
  const originalCountDocuments = Profile.countDocuments;
  Profile.countDocuments = async () => 0;
  try {
    const response = createResponse();
    await createQuestion({
      auth: { userId: '507f1f77bcf86cd799439011' },
      body: {
        text: 'How can a reader build a better writing habit?',
        targetWriterIds: ['507f1f77bcf86cd799439012'],
      },
    }, response);
    assert.equal(response.statusCode, 400);
    assert.equal(response.payload.message, 'One or more target writers could not be found');
  } finally {
    Profile.countDocuments = originalCountDocuments;
  }
});

test('unknown routes return a normalized error and request id', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));

  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/missing`);
  const body = await response.json();
  const robotsResponse = await fetch(`http://127.0.0.1:${address.port}/robots.txt`);
  const robots = await robotsResponse.text();

  assert.equal(response.status, 404);
  assert.equal(body.error.code, 'ROUTE_NOT_FOUND');
  assert.equal(body.error.requestId, response.headers.get('x-request-id'));
  assert.equal(robotsResponse.status, 200);
  const expectedSitemapUrl = new URL('/sitemap.xml', process.env.FRONTEND_URL).toString();
  assert.ok(robots.includes(`Sitemap: ${expectedSitemapUrl}`));
});

test('health and readiness endpoints separate liveness from database availability', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));

  const address = server.address();
  const healthResponse = await fetch(`http://127.0.0.1:${address.port}/health`);
  const readinessResponse = await fetch(`http://127.0.0.1:${address.port}/readiness`);
  const readiness = await readinessResponse.json();

  assert.equal(healthResponse.status, 200);
  assert.deepEqual(await healthResponse.json(), { status: 'ok' });
  assert.equal(readinessResponse.status, 503);
  assert.deepEqual(readiness, {
    status: 'error',
    checks: { database: 'error' },
    message: 'MongoDB connection failed',
  });
});

test('invalid JSON receives a safe client error', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));

  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{invalid',
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error.code, 'INVALID_JSON');
});

test('comment listing validates post identifiers before database access', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));

  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/post/not-a-post/comments`);
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.message, 'Invalid post id');
});

test('idempotent engagement routes authenticate before mutation', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));

  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/post/not-a-post/bookmark`, {
    method: 'PUT',
  });
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.success, false);
});

test('writer profile routes reject malformed handles without database access', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));

  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/writer/--`);
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.message, 'Invalid writer handle');
});

test('question routes validate sort and identifiers before database access', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));
  const address = server.address();

  const sortResponse = await fetch(`http://127.0.0.1:${address.port}/api/question?sort=unknown`);
  assert.equal(sortResponse.status, 400);
  const opportunitiesResponse = await fetch(`http://127.0.0.1:${address.port}/api/question/opportunities`);
  assert.equal(opportunitiesResponse.status, 401);
  const token = generateToken({ id: 'user-123' }, '1m');
  const invalidTarget = await fetch(`http://127.0.0.1:${address.port}/api/question`, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ text: 'How can writers explain this clearly?', targetWriterIds: ['not-an-id'] }),
  });
  assert.equal(invalidTarget.status, 400);
  const voteResponse = await fetch(`http://127.0.0.1:${address.port}/api/question/not-an-id/upvote`, {
    method: 'PUT', headers: { authorization: `Bearer ${token}` },
  });
  assert.equal(voteResponse.status, 400);
  const detailResponse = await fetch(`http://127.0.0.1:${address.port}/api/question/not-an-id`);
  assert.equal(detailResponse.status, 400);
  const answerResponse = await fetch(`http://127.0.0.1:${address.port}/api/question/not-an-id/answers`, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ text: 'A valid-looking answer' }),
  });
  assert.equal(answerResponse.status, 400);
  const reportResponse = await fetch(`http://127.0.0.1:${address.port}/api/question/not-an-id/reports`, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ reason: 'spam' }),
  });
  assert.equal(reportResponse.status, 400);
  const answerReportResponse = await fetch(`http://127.0.0.1:${address.port}/api/question/not-an-id/answers/not-an-id/reports`, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ reason: 'spam' }),
  });
  assert.equal(answerReportResponse.status, 400);
  const claimResponse = await fetch(`http://127.0.0.1:${address.port}/api/question/not-an-id/claim`, {
    method: 'PUT', headers: { authorization: `Bearer ${token}` },
  });
  assert.equal(claimResponse.status, 400);
  const declineResponse = await fetch(`http://127.0.0.1:${address.port}/api/question/not-an-id/decline`, {
    method: 'POST', headers: { authorization: `Bearer ${token}` },
  });
  assert.equal(declineResponse.status, 400);
});

test('slow request diagnostics are thresholded and redact request data', () => {
  const warnings = [];
  const request = { requestId: 'timing-test', method: 'GET', path: '/database-status' };
  const response = new EventEmitter();
  response.statusCode = 503;
  createRequestTimingMiddleware({ thresholdMs: 0.001, warn: message => warnings.push(JSON.parse(message)) })(request, response, () => {});
  response.emit('finish');
  assert.equal(warnings.length, 1);
  assert.deepEqual(Object.keys(warnings[0]).sort(), ['level', 'method', 'path', 'requestId', 'responseTimeMs', 'status'].sort());
  assert.equal(warnings[0].requestId, 'timing-test');
  assert.equal(warnings[0].path, '/database-status');
  assert.equal(warnings[0].status, 503);
});

test('response budget diagnostics identify budget breaches without exposing request data', () => {
  const warnings = [];
  const request = { requestId: 'budget-test', method: 'GET', path: '/database-status' };
  const response = new EventEmitter();
  response.statusCode = 200;
  createRequestTimingMiddleware({ thresholdMs: 0.001, budgetMs: 0.001, warn: message => warnings.push(JSON.parse(message)) })(request, response, () => {});
  response.emit('finish');

  assert.equal(warnings.length, 1);
  assert.deepEqual(Object.keys(warnings[0]).sort(), ['budgetMs', 'level', 'method', 'path', 'requestId', 'responseTimeMs', 'status'].sort());
  assert.equal(warnings[0].level, 'response_budget_exceeded');
  assert.equal(warnings[0].budgetMs, 0.001);
  assert.equal(warnings[0].requestId, 'budget-test');
});

test('response budget breaches route redacted performance alerts to the monitor', async () => {
  const warnings = [];
  const alerts = [];
  const request = { requestId: 'budget-monitor-test', method: 'GET', path: '/database-status' };
  const response = new EventEmitter();
  response.statusCode = 200;
  const monitor = { report: async payload => alerts.push(payload) };
  createRequestTimingMiddleware({ thresholdMs: 0.001, budgetMs: 0.001, monitor, warn: message => warnings.push(JSON.parse(message)) })(request, response, () => {});
  response.emit('finish');
  await new Promise(resolve => setImmediate(resolve));

  assert.equal(warnings[0].level, 'response_budget_exceeded');
  assert.equal(alerts.length, 1);
  assert.deepEqual(alerts[0], {
    event: 'response_budget_exceeded',
    requestId: 'budget-monitor-test',
    method: 'GET',
    path: '/database-status',
    status: 200,
    responseTimeMs: alerts[0].responseTimeMs,
    budgetMs: 0.001,
  });
});

test('monitor delivery failures never interrupt response timing middleware', async () => {
  const request = { requestId: 'monitor-failure-test', method: 'GET', path: '/database-status' };
  const response = new EventEmitter();
  response.statusCode = 200;
  const monitor = { report: () => { throw new Error('monitor unavailable'); } };

  assert.doesNotThrow(() => {
    createRequestTimingMiddleware({ thresholdMs: 0.001, budgetMs: 0.001, monitor, warn: () => {} })(request, response, () => {});
    response.emit('finish');
  });
  await new Promise(resolve => setImmediate(resolve));
});

test('response budgets classify discovery reads, events, mutations, and fallback routes', () => {
  assert.equal(getResponseBudgetMs({ method: 'GET', path: '/api/post/feed' }), 750);
  assert.equal(getResponseBudgetMs({ method: 'GET', path: '/api/search?q=city' }), 750);
  assert.equal(getResponseBudgetMs({ method: 'POST', path: '/api/v1/events' }), 500);
  assert.equal(getResponseBudgetMs({ method: 'POST', path: '/api/post' }), 1500);
  assert.equal(getResponseBudgetMs({ method: 'GET', path: '/database-status' }), 1000);
});

test('slow MongoDB query diagnostics are thresholded and redact command data', async () => {
  const client = new EventEmitter();
  const warnings = [];
  const stop = createMongoQueryDiagnostics({ client, thresholdMs: 0.001, warn: message => warnings.push(JSON.parse(message)) });

  client.emit('commandStarted', {
    requestId: 42,
    commandName: 'find',
    command: { find: 'posts', filter: { privateText: 'must-not-be-logged' } },
  });
  await new Promise(resolve => setImmediate(resolve));
  client.emit('commandSucceeded', { requestId: 42, commandName: 'find', command: { find: 'posts' } });

  assert.equal(warnings.length, 1);
  assert.deepEqual(Object.keys(warnings[0]).sort(), ['collection', 'commandName', 'durationMs', 'level', 'status'].sort());
  assert.deepEqual(warnings[0].collection, 'posts');
  assert.equal(warnings[0].commandName, 'find');
  assert.equal(warnings[0].status, 'succeeded');
  assert.equal(JSON.stringify(warnings).includes('privateText'), false);
  stop();
});

test('error monitor routes redacted 5xx metadata and omits secrets and error text', async () => {
  const requests = [];
  const monitor = createErrorMonitor({
    url: 'https://monitor.example.test/ingest',
    fetchImpl: async (url, options) => {
      requests.push({ url, options, payload: JSON.parse(options.body) });
      return { ok: true, status: 202 };
    },
  });

  await monitor.report({
    requestId: 'error-test',
    method: 'POST',
    path: '/api/private-resource',
    status: 500,
    responseTimeMs: 123.45,
    error: { name: 'DatabaseError', code: 'DB_TIMEOUT', message: 'password=do-not-send', stack: 'private stack' },
  });

  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://monitor.example.test/ingest');
  assert.equal(requests[0].options.method, 'POST');
  assert.equal(requests[0].payload.event, 'api_error');
  assert.equal(requests[0].payload.requestId, 'error-test');
  assert.equal(requests[0].payload.errorCode, 'DB_TIMEOUT');
  assert.equal(JSON.stringify(requests[0].payload).includes('password'), false);
  assert.equal(JSON.stringify(requests[0].payload).includes('private stack'), false);
  assert.equal(JSON.stringify(requests[0].payload).includes('do-not-send'), false);
});

test('error monitor preserves redacted response-budget alert metadata', async () => {
  const requests = [];
  const monitor = createErrorMonitor({
    url: 'https://monitor.example.test/ingest',
    fetchImpl: async (url, options) => {
      requests.push({ url, payload: JSON.parse(options.body) });
      return { ok: true, status: 202 };
    },
  });

  await monitor.report({
    event: 'response_budget_exceeded',
    requestId: 'budget-alert-test',
    method: 'GET',
    path: '/api/post/feed',
    status: 200,
    responseTimeMs: 812.34,
    budgetMs: 750,
  });

  assert.equal(requests[0].payload.event, 'response_budget_exceeded');
  assert.equal(requests[0].payload.budgetMs, 750);
  assert.equal(requests[0].payload.errorName, 'Error');
});

test('error monitor treats non-success delivery responses as failed without logging response bodies', async () => {
  const warnings = [];
  const monitor = createErrorMonitor({
    url: 'https://monitor.example.test/ingest',
    fetchImpl: async () => ({ ok: false, status: 503, text: async () => 'private response body' }),
    warn: message => warnings.push(JSON.parse(message)),
  });

  await monitor.report({ requestId: 'delivery-status-test', status: 500 });

  assert.deepEqual(warnings, [{
    level: 'error_monitor_delivery_failed',
    errorName: 'MonitorHttpError',
    status: 503,
  }]);
  assert.equal(JSON.stringify(warnings).includes('private response body'), false);
});

test('competition routes validate filters and entry identifiers before database access', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));
  const address = server.address();
  const invalidStatus = await fetch(`http://127.0.0.1:${address.port}/api/competition?status=unknown`);
  assert.equal(invalidStatus.status, 400);
  const token = generateToken({ id: 'user-123' }, '1m');
  const voteUrl = `http://127.0.0.1:${address.port}/api/competition/no/entries/no/vote`;
  const invalidVote = await fetch(voteUrl, { method: 'PUT', headers: { authorization: `Bearer ${token}` } });
  assert.equal(invalidVote.status, 400);
  for (let attempt = 0; attempt < 29; attempt += 1) {
    const response = await fetch(voteUrl, { method: 'PUT', headers: { authorization: `Bearer ${token}` } });
    assert.equal(response.status, 400);
  }
  const rateLimitedVote = await fetch(voteUrl, { method: 'PUT', headers: { authorization: `Bearer ${token}` } });
  assert.equal(rateLimitedVote.status, 429);
});

test('collection routes validate public identifiers and authenticate mutations before database access', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));
  const address = server.address();
  const detail = await fetch(`http://127.0.0.1:${address.port}/api/collection/not-an-id`);
  assert.equal(detail.status, 400);
  const invalidSort = await fetch(`http://127.0.0.1:${address.port}/api/collection?sort=unknown`);
  assert.equal(invalidSort.status, 400);
  assert.equal((await invalidSort.json()).message, 'Invalid collection sort');
  const create = await fetch(`http://127.0.0.1:${address.port}/api/collection`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}',
  });
  assert.equal(create.status, 401);
});

test('writer follow routes validate target identifiers after authentication', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));

  const token = generateToken({ id: 'user-123' }, '1m');
  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/writer/not-an-id/follow`, {
    method: 'PUT',
    headers: { authorization: `Bearer ${token}` },
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.message, 'Invalid writer id');
});

test('article report routes reject unsupported reasons before database access', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));

  const token = generateToken({ id: 'user-123' }, '1m');
  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/post/507f1f77bcf86cd799439011/reports`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ reason: 'not-a-reason' }),
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.message, 'Select a valid report reason');
});

test('discovery feed rejects invalid modes before database access', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));

  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/post/feed?mode=unknown`);
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.message, 'Invalid feed mode');
  const invalidSort = await fetch(`http://127.0.0.1:${address.port}/api/post/feed?sort=unknown`);
  assert.equal(invalidSort.status, 400);
  assert.equal((await invalidSort.json()).message, 'Invalid feed sort');
});

test('discovery feed rejects malformed cursors before database access', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));

  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/post/feed?cursor=bad`);
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.message, 'Invalid feed cursor');
});

test('short feed rejects malformed cursors before database access', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));
  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/post/shorts?cursor=bad`);
  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, 'Invalid short feed cursor');
  const invalidSort = await fetch(`http://127.0.0.1:${address.port}/api/post/shorts?sort=unknown`);
  assert.equal(invalidSort.status, 400);
  assert.equal((await invalidSort.json()).message, 'Invalid short feed sort');
});

test('short series validates identifiers and protects creation before database access', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));
  const address = server.address();
  const detail = await fetch(`http://127.0.0.1:${address.port}/api/short-series/not-an-id`);
  assert.equal(detail.status, 400);
  const create = await fetch(`http://127.0.0.1:${address.port}/api/short-series`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}',
  });
  assert.equal(create.status, 401);
});

test('personalized feed requires an authenticated reader before database access', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));

  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/post/feed?mode=for-you`);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).message, 'Sign in to use the For You feed');
});

test('unified search validates query and type before database access', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));

  const address = server.address();
  const emptyQuery = await fetch(`http://127.0.0.1:${address.port}/api/search?q=`);
  const invalidType = await fetch(`http://127.0.0.1:${address.port}/api/search?q=a&type=videos`);

  assert.equal(emptyQuery.status, 400);
  assert.equal((await emptyQuery.json()).message, 'Search query must be between 1 and 100 characters');
  assert.equal(invalidType.status, 400);
  assert.equal((await invalidType.json()).message, 'Invalid search type');
});

test('onboarding writes require authentication before validation', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));

  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/onboarding`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ topicSlugs: [], writerIds: [], completed: true }),
  });
  assert.equal(response.status, 401);

  const resetResponse = await fetch(`http://127.0.0.1:${address.port}/api/v1/interests/inferred`, {
    method: 'DELETE',
  });
  assert.equal(resetResponse.status, 401);
});

test('event intake rejects malformed batches before database access', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));

  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/events`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ events: [], anonymousSessionId: 'invalid' }),
  });
  const body = await response.json();
  assert.equal(response.status, 400);
  assert.equal(body.message, 'Events must contain between 1 and 50 items');

  const invalidEvent = await fetch(`http://127.0.0.1:${address.port}/api/v1/events`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      anonymousSessionId: '2f1c995d-7db7-4d7d-813d-1a8a229bdede',
      events: [{
        eventId: '9caa3af1-133a-486f-ae0c-0599493e32d2',
        eventType: 'open',
        surface: 'article',
        eventAt: new Date().toISOString(),
      }],
    }),
  });
  assert.equal(invalidEvent.status, 400);
  assert.equal((await invalidEvent.json()).message, 'One or more events are invalid');
});

test('reading history is private to the authenticated reader', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));
  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/reading-history`);
  assert.equal(response.status, 401);
});

test('premium domain models keep platform membership separate from creator support', () => {
  assert.equal(Membership.schema.path('userId').options.unique, true);
  assert.deepEqual(Entitlement.capabilities, [
    'article_summary', 'read_aloud', 'writer_analytics', 'ai_writing_assistant', 'early_access',
    'workshops', 'behind_scenes', 'direct_creator_requests',
  ]);
  assert.ok(CreatorSupport.schema.path('supporterId'));
  assert.ok(CreatorSupport.schema.path('creatorId'));
  assert.ok(ProviderEvent.schema.indexes().some(([fields]) => fields.provider === 1 && fields.eventId === 1));
  assert.equal(PostSummary.schema.path('postId').options.unique, true);
  assert.equal(Post.schema.path('publicAt').instance, 'Date');
  assert.ok(Workshop.schema.indexes().some(([fields]) => fields.status === 1 && fields.startsAt === 1));
  assert.ok(WorkshopAttendance.schema.indexes().some(([fields]) => fields.workshopId === 1 && fields.userId === 1));
  assert.ok(CreatorUpdate.schema.path('audience').enumValues.includes('supporters'));
  assert.equal(CreatorRequest.schema.path('periodKey').instance, 'String');
});

test('extractive summaries use article content and remain deterministic', () => {
  const body = JSON.stringify([
    { type: 'paragraph', content: '<p>Coastal communities adapt to rising tides through restored wetlands and elevated homes.</p>' },
    { type: 'paragraph', content: 'Wetlands absorb storm energy while offering important habitat for native wildlife.' },
    { type: 'paragraph', content: 'Local planning and long-term maintenance determine whether these projects succeed.' },
  ]);
  const text = extractText(body);
  const first = summarizeExtractively(text);
  assert.match(text, /Coastal communities/);
  assert.deepEqual(first, summarizeExtractively(text));
  assert.ok(first.length >= 1 && first.length <= 4);
  assert.ok(first.every(point => text.includes(point)));
});

test('billing state maps provider subscription statuses conservatively', () => {
  assert.equal(mapSubscriptionStatus('active'), 'active');
  assert.equal(mapSubscriptionStatus('trialing'), 'trialing');
  assert.equal(mapSubscriptionStatus('past_due'), 'past_due');
  assert.equal(mapSubscriptionStatus('unpaid'), 'past_due');
  assert.equal(mapSubscriptionStatus('canceled'), 'canceled');
  assert.equal(mapSubscriptionStatus('incomplete'), 'inactive');
});

test('durable authoring models preserve draft conflicts and immutable revisions', () => {
  assert.equal(Draft.schema.path('version').instance, 'Number');
  assert.ok(PostRevision.schema.indexes().some(([fields]) => fields.postId === 1 && fields.revision === 1));
  const input = parseDraftInput({ title: '  Working title  ', format: 'article', blocks: [{ id: 'block-1', type: 'text', content: 'Draft body' }], tags: [' Writing ', 'writing'] });
  assert.equal(input.title, 'Working title');
  assert.deepEqual(input.tags, ['writing']);
  assert.equal(parseDraftInput({ format: 'video', blocks: [] }), null);
  assert.equal(parseDraftInput({ format: 'article', blocks: [{ id: 'x', type: 'embed', content: '' }] }), null);
});

test('notifications and staff decisions are durable append-only domain records', () => {
  assert.ok(Notification.schema.indexes().some(([fields]) => fields.recipientId === 1 && fields.createdAt === -1));
  assert.ok(NotificationDelivery.schema.indexes().some(([fields]) => fields.idempotencyKey === 1));
  assert.ok(ModerationAction.schema.path('action').enumValues.includes('recommend_remove'));
  assert.ok(!ModerationAction.schema.path('action').enumValues.includes('remove'));
  assert.ok(CompetitionAudit.schema.path('action').enumValues.includes('results_published'));
  assert.ok(Notification.schema.path('type').enumValues.includes('question_targeted'));
});

test('writing assistance extracts all response message text without persisting drafts', () => {
  const response = { output: [{ type: 'reasoning' }, { type: 'message', content: [{ type: 'output_text', text: 'First suggestion.' }] }, { type: 'message', content: [{ type: 'output_text', text: 'Second suggestion.' }] }] };
  assert.equal(extractOutputText(response), 'First suggestion.\nSecond suggestion.');
  assert.ok(AiUsage.schema.indexes().some(([fields]) => fields.userId === 1 && fields.day === 1));
});

test('post visibility is consistent for public, scheduled, unpublished, and owner access', () => {
  const author = '507f1f77bcf86cd799439011';
  const stranger = { userId: '507f191e810c19729de860ea', canUseEarlyAccess: false };
  const member = { ...stranger, canUseEarlyAccess: true };
  const owner = { userId: author, canUseEarlyAccess: false };
  const future = new Date(Date.now() + 60_000);
  assert.equal(canAccessPost({ author, publicationStatus: 'published', publicAt: new Date(0) }, stranger), true);
  assert.equal(canAccessPost({ author, publicationStatus: 'published', publicAt: future }, stranger), false);
  assert.equal(canAccessPost({ author, publicationStatus: 'published', publicAt: future }, member), true);
  assert.equal(canAccessPost({ author, publicationStatus: 'unpublished', publicAt: future }, member), false);
  assert.equal(canAccessPost({ author, publicationStatus: 'unpublished', publicAt: future }, owner), true);
  assert.ok(publicPostClause().$or.length >= 2);
  assert.equal(Post.schema.indexes().filter(([fields]) => fields.publicAt === 1 && fields.createdAt === -1).length, 1);
});

test('published block validation bounds content and rejects unsafe image URLs', () => {
  assert.ok(parsePostBody(JSON.stringify([{ id: 'safe-1', type: 'text', content: '<script>is rendered as text</script>' }])));
  assert.ok(parsePostBody(JSON.stringify([{ id: 'image-1', type: 'image', content: 'https://images.example.test/photo.webp' }])));
  assert.equal(parsePostBody(JSON.stringify([{ id: 'image-1', type: 'image', content: 'javascript:alert(1)' }])), null);
  assert.equal(parsePostBody(JSON.stringify([{ id: 'image-1', type: 'image', content: 'https://' }])), null);
  assert.equal(parsePostBody(JSON.stringify([{ id: 'image-1', type: 'image', content: 'https://user:pass@images.example.test/photo.webp' }])), null);
  assert.equal(parsePostBody(JSON.stringify([{ id: 'image-1', type: 'image', content: 'data:image/svg+xml,<svg onload=alert(1) />' }])), null);
  assert.equal(parsePostBody(JSON.stringify([{ id: 'same', type: 'text', content: 'one' }, { id: 'same', type: 'text', content: 'two' }])), null);
  assert.equal(parsePostBody(JSON.stringify([{ id: 'divider-1', type: 'divider', content: 'hidden text' }])), null);
  assert.equal(parsePostBody(JSON.stringify([{ id: 'text-1', type: 'text', content: 'x'.repeat(10_001) }])), null);
  assert.equal(parsePostBody(JSON.stringify([{ id: 'text-1', type: 'text', content: { html: '<script>' } }])), null);
  assert.equal(parsePostBody(JSON.stringify([{ id: 'bad id', type: 'text', content: 'unsafe identifier' }])), null);
  assert.equal(parsePostBody(JSON.stringify([{ id: 'image-1', type: 'image', content: 'https://images.example.test/photo.webp', alt: 'x'.repeat(301) }])), null);
  assert.equal(parsePostBody(JSON.stringify([{ id: 'code-1', type: 'code', content: 'x'.repeat(50_001) }])), null);
  assert.equal(parsePostBody(JSON.stringify(Array.from({ length: 501 }, (_, index) => ({ id: `text-${index}`, type: 'text', content: 'bounded' })))), null);
  assert.equal(isSafeImageUrl('http://images.example.test/photo.jpg'), true);
  assert.equal(isSafeImageUrl('https://images.example.test/photo.jpg'), true);
  assert.equal(isSafeImageUrl('javascript:alert(1)'), false);
  assert.equal(isSafeImageUrl('https://'), false);
});

test('notification delivery retries use bounded exponential backoff', () => {
  const now = new Date('2026-08-24T12:00:00.000Z');
  assert.equal(MAX_ATTEMPTS, 5);
  assert.equal(calculateRetryAt(1, now).toISOString(), '2026-08-24T12:15:00.000Z');
  assert.equal(calculateRetryAt(3, now).toISOString(), '2026-08-24T13:00:00.000Z');
});

test('upload validation checks image signatures and removes spoofed temporary files', async () => {
  assert.equal(detectImageMime(Buffer.from([0xff, 0xd8, 0xff, 0xe0])), 'image/jpeg');
  assert.equal(detectImageMime(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'image/png');
  assert.equal(detectImageMime(Buffer.from('RIFFxxxxWEBP')), 'image/webp');
  assert.equal(detectImageMime(Buffer.from('GIF89a')), 'image/gif');
  assert.equal(detectImageMime(Buffer.from('<script>alert(1)</script>')), null);

  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'ink-rider-upload-'));
  const filePath = path.join(directory, 'spoofed.jpg');
  await fs.writeFile(filePath, '<script>alert(1)</script>');
  const response = createResponse();
  let nextCalled = false;

  try {
    await validateImageFile({ file: { path: filePath, mimetype: 'image/jpeg' } }, response, () => { nextCalled = true; });
    assert.equal(response.statusCode, 400);
    assert.deepEqual(response.payload, {
      success: false,
      code: 'INVALID_IMAGE_FILE',
      message: 'Uploaded cover image content is invalid',
    });
    assert.equal(nextCalled, false);
    await assert.rejects(fs.access(filePath));
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }

  const mismatchDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'ink-rider-upload-mismatch-'));
  const mismatchPath = path.join(mismatchDirectory, 'mismatch.png');
  await fs.writeFile(mismatchPath, Buffer.from([0xff, 0xd8, 0xff, 0xe0]));
  const mismatchResponse = createResponse();

  try {
    await validateImageFile({ file: { path: mismatchPath, mimetype: 'image/png' } }, mismatchResponse, () => assert.fail('MIME mismatch must not continue'));
    assert.equal(mismatchResponse.statusCode, 400);
    assert.equal(mismatchResponse.payload.code, 'INVALID_IMAGE_FILE');
    await assert.rejects(fs.access(mismatchPath));
  } finally {
    await fs.rm(mismatchDirectory, { recursive: true, force: true });
  }

  let noFileNextCalled = false;
  await validateImageFile({}, createResponse(), () => { noFileNextCalled = true; });
  assert.equal(noFileNextCalled, true);
});

test('premium endpoints require authentication before entitlement lookup', async t => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise(resolve => server.once('listening', resolve));
  const address = server.address();
  const entitlements = await fetch(`http://127.0.0.1:${address.port}/api/v1/me/entitlements`);
  const summary = await fetch(`http://127.0.0.1:${address.port}/api/v1/posts/507f1f77bcf86cd799439011/summary`);
  assert.equal(entitlements.status, 401);
  assert.equal(summary.status, 401);
  const earlyAccess = await fetch(`http://127.0.0.1:${address.port}/api/post/early-access`);
  const register = await fetch(`http://127.0.0.1:${address.port}/api/v1/workshops/507f1f77bcf86cd799439011/registration`, { method: 'PUT' });
  const update = await fetch(`http://127.0.0.1:${address.port}/api/v1/creator-updates`, { method: 'POST' });
  const directRequest = await fetch(`http://127.0.0.1:${address.port}/api/v1/creators/507f1f77bcf86cd799439011/requests`, { method: 'POST' });
  assert.equal(earlyAccess.status, 401);
  assert.equal(register.status, 401);
  assert.equal(update.status, 401);
  assert.equal(directRequest.status, 401);
  const checkout = await fetch(`http://127.0.0.1:${address.port}/api/v1/billing/checkout`, { method: 'POST' });
  const invalidWebhook = await fetch(`http://127.0.0.1:${address.port}/api/v1/billing/webhook`, { method: 'POST', headers: { 'content-type': 'application/json', 'stripe-signature': 't=1,v1=bad' }, body: '{}' });
  assert.equal(checkout.status, 401);
  assert.equal(invalidWebhook.status, 400);
  const drafts = await fetch(`http://127.0.0.1:${address.port}/api/drafts`);
  const editPost = await fetch(`http://127.0.0.1:${address.port}/api/post/507f1f77bcf86cd799439011`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: '{}' });
  const staffReports = await fetch(`http://127.0.0.1:${address.port}/api/staff/reports`);
  const staffFraudSignals = await fetch(`http://127.0.0.1:${address.port}/api/staff/competition-fraud`);
  const staffFraudReview = await fetch(`http://127.0.0.1:${address.port}/api/staff/competition-fraud/reviews`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  const createCompetition = await fetch(`http://127.0.0.1:${address.port}/api/competition`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  assert.equal(drafts.status, 401);
  assert.equal(editPost.status, 401);
  assert.equal(staffReports.status, 401);
  assert.equal(staffFraudSignals.status, 401);
  assert.equal(staffFraudReview.status, 401);
  assert.equal(createCompetition.status, 401);
  const writingAssistant = await fetch(`http://127.0.0.1:${address.port}/api/v1/writing-assistant`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  assert.equal(writingAssistant.status, 401);
});
