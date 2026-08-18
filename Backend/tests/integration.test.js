const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const mongoose = require('mongoose');

const integrationEnabled = process.env.RUN_DB_INTEGRATION === 'true';

if (!integrationEnabled) {
  test('database integration suite is enabled only with RUN_DB_INTEGRATION=true', { skip: 'MongoDB integration service is not enabled' }, () => {});
} else {
  process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'integration-webhook-secret';
  const app = require('../src/app');
  const User = require('../schemas/user.schema');
  const Post = require('../schemas/post.schema');
  const Save = require('../schemas/save.schema');
  const Like = require('../schemas/like.schema');
  const PostRevision = require('../schemas/post-revision.schema');
  const Membership = require('../schemas/membership.schema');
  const ProviderEvent = require('../schemas/provider-event.schema');
  const Profile = require('../schemas/profile.schema');
  const Topic = require('../schemas/topic.schema');
  const Question = require('../schemas/question.schema');
  const Collection = require('../schemas/collection.schema');
  const Competition = require('../schemas/competition.schema');
  const ShortSeries = require('../schemas/short-series.schema');
  const Notification = require('../schemas/notification.schema');
  const InteractionEvent = require('../schemas/interaction-event.schema');
  const Draft = require('../schemas/draft.schema');
  const Follow = require('../schemas/follow.schema');
  const Comment = require('../schemas/comment.schema');
  const Report = require('../schemas/report.schema');
  const ModerationAction = require('../schemas/moderation-action.schema');
  const { generateToken } = require('../utils/helper');

  let server;
  let baseUrl;
  let owner;
  let otherUser;
  let post;
  let shortPost;
  let shortPost2;
  let shortPost3;
  let shortPost4;
  let topic;
  let question;
  let collection;
  let competition;
  let series;
  let notification;
  // Keep the shared fixture prefix unique without exceeding the User schema's
  // 30-character username limit once `-owner` or `-other` is appended.
  const prefix = `i${Date.now().toString(36)}${process.pid.toString(36)}`;

  const authHeaders = user => ({
    authorization: `Bearer ${generateToken({ id: user._id.toString() }, '10m')}`,
    'content-type': 'application/json',
  });

  const validBody = title => JSON.stringify([
    { id: 'block-1', type: 'text', content: `${title} body` },
  ]);

  test.before(async () => {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5_000 });
    owner = await User.create({
      username: `${prefix}-owner`,
      email: `${prefix}-owner@example.test`,
      password: 'IntegrationPassword123!',
      verified: true,
      role: 'admin',
    });
    otherUser = await User.create({
      username: `${prefix}-other`,
      email: `${prefix}-other@example.test`,
      password: 'IntegrationPassword123!',
      verified: true,
    });
    await Profile.create([
      { userId: owner._id, handle: `${prefix}-owner`, displayName: `${prefix} owner`, writerStatus: 'writer', directRequestsEnabled: true },
      { userId: otherUser._id, handle: `${prefix}-other`, displayName: `${prefix} other`, writerStatus: 'writer', directRequestsEnabled: true },
    ]);
    topic = await Topic.create({ slug: `${prefix}-topic`, displayName: `${prefix} topic`, status: 'active', order: 1 });
    post = await Post.create({
      title: `${prefix} post`,
      format: 'article',
      body: validBody(`${prefix} initial`),
      author: owner._id,
      tags: ['integration'],
      publicAt: new Date(),
      currentRevision: 1,
    });
    await PostRevision.create({
      postId: post._id,
      revision: 1,
      authorId: owner._id,
      title: post.title,
      body: post.body,
      format: post.format,
      tags: post.tags,
      publicAt: post.publicAt,
    });
    shortPost = await Post.create({
      title: `${prefix} short`, format: 'short', body: validBody(`${prefix} short`), author: owner._id,
      tags: ['integration'], publicAt: new Date(), currentRevision: 1,
    });
    shortPost2 = await Post.create({
      title: `${prefix} short two`, format: 'short', body: validBody(`${prefix} short two`), author: owner._id,
      tags: ['integration'], publicAt: new Date(), currentRevision: 1,
    });
    shortPost3 = await Post.create({
      title: `${prefix} short three`, format: 'short', body: validBody(`${prefix} short three`), author: owner._id,
      tags: ['integration'], publicAt: new Date(), currentRevision: 1,
    });
    shortPost4 = await Post.create({
      title: `${prefix} short four`, format: 'short', body: validBody(`${prefix} short four`), author: owner._id,
      tags: ['integration'], publicAt: new Date(), currentRevision: 1,
    });
    question = await Question.create({
      text: `${prefix} integration question?`, normalizedText: `${prefix} integration question`,
      context: 'integration', author: otherUser._id, tags: [topic.slug],
    });
    collection = await Collection.create({
      title: `${prefix} collection`, description: 'integration', author: owner._id,
      posts: [post._id], items: [{ post: post._id, position: 0 }],
    });
    competition = await Competition.create({
      title: `${prefix} competition`, description: 'integration', createdBy: owner._id,
      status: 'open', openDate: new Date(Date.now() - 60_000), closeDate: new Date(Date.now() + 86_400_000),
    });
    series = await ShortSeries.create({ title: `${prefix} series`, author: owner._id, items: [{ post: shortPost._id, position: 0 }] });
    notification = await Notification.create({
      recipientId: owner._id, actorId: otherUser._id, type: 'question_answered', title: 'Integration notification',
      body: 'Integration', href: `/explore/questions/${question._id}`, entityType: 'question', entityId: question._id,
    });
    server = app.listen(0);
    await new Promise(resolve => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  test.after(async () => {
    if (server) await new Promise(resolve => server.close(resolve));
    const userIds = [owner?._id, otherUser?._id].filter(Boolean);
    if (userIds.length) {
      await Promise.all([
        Save.deleteMany({ userId: { $in: userIds } }),
        Like.deleteMany({ userId: { $in: userIds } }),
        PostRevision.deleteMany({ authorId: { $in: userIds } }),
        Post.deleteMany({ author: { $in: userIds } }),
        Membership.deleteMany({ userId: { $in: userIds } }),
        User.deleteMany({ _id: { $in: userIds } }),
        Profile.deleteMany({ userId: { $in: userIds } }),
        Topic.deleteMany({ _id: topic?._id }),
        Question.deleteMany({ _id: question?._id }),
        Collection.deleteMany({ _id: collection?._id }),
        Competition.deleteMany({ _id: competition?._id }),
        ShortSeries.deleteMany({ _id: series?._id }),
        Notification.deleteMany({ _id: notification?._id }),
        InteractionEvent.deleteMany({ actorId: { $in: userIds } }),
        Draft.deleteMany({ authorId: { $in: userIds } }),
        Follow.deleteMany({ followerId: { $in: userIds } }),
        Comment.deleteMany({ author: { $in: userIds } }),
        Report.deleteMany({ reporterId: { $in: userIds } }),
        ModerationAction.deleteMany({ moderatorId: { $in: userIds } }),
        Post.deleteMany({ author: { $in: userIds } }),
      ]);
    }
    await ProviderEvent.deleteMany({ eventId: { $regex: `^${prefix}` } });
    await mongoose.disconnect();
  });

  test('write authorization rejects another user without changing the post', async () => {
    const response = await fetch(`${baseUrl}/api/post/${post._id}`, {
      method: 'PUT',
      headers: authHeaders(otherUser),
      body: JSON.stringify({
        expectedRevision: 1,
        title: 'Unauthorized edit',
        body: validBody('Unauthorized edit'),
        tags: ['integration'],
      }),
    });

    assert.equal(response.status, 404);
    const current = await Post.findById(post._id).select('title currentRevision');
    assert.equal(current.title, post.title);
    assert.equal(current.currentRevision, 1);
  });

  test('concurrent owner edits allow one revision and reject the stale revision', async () => {
    const requests = ['First concurrent edit', 'Second concurrent edit'].map(title => fetch(`${baseUrl}/api/post/${post._id}`, {
      method: 'PUT',
      headers: authHeaders(owner),
      body: JSON.stringify({
        expectedRevision: 1,
        title,
        body: validBody(title),
        tags: ['integration'],
      }),
    }));
    const responses = await Promise.all(requests);
    assert.deepEqual(responses.map(response => response.status).sort(), [200, 409]);

    const current = await Post.findById(post._id).select('currentRevision');
    assert.equal(current.currentRevision, 2);
    assert.equal(await PostRevision.countDocuments({ postId: post._id }), 2);
  });

  test('duplicate saves and likes remain idempotent and counters match source records', async () => {
    const saveUrl = `${baseUrl}/api/post/${post._id}/bookmark`;
    const likeUrl = `${baseUrl}/api/post/${post._id}/like`;
    const ownerHeaders = authHeaders(owner);
    const otherHeaders = authHeaders(otherUser);

    assert.equal((await fetch(saveUrl, { method: 'PUT', headers: ownerHeaders })).status, 200);
    assert.equal((await fetch(saveUrl, { method: 'PUT', headers: ownerHeaders })).status, 200);
    assert.equal((await fetch(likeUrl, { method: 'PUT', headers: ownerHeaders })).status, 200);
    assert.equal((await fetch(likeUrl, { method: 'PUT', headers: ownerHeaders })).status, 200);
    assert.equal((await fetch(likeUrl, { method: 'PUT', headers: otherHeaders })).status, 200);

    const current = await Post.findById(post._id).select('likesCount');
    assert.equal(await Save.countDocuments({ userId: owner._id, postId: post._id }), 1);
    assert.equal(await Like.countDocuments({ postId: post._id }), 2);
    assert.equal(current.likesCount, 2);
  });

  test('signed provider webhooks process once when delivered more than once', async () => {
    const event = {
      id: `${prefix}-checkout-event`,
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { userId: owner._id.toString() },
          client_reference_id: owner._id.toString(),
          customer: `${prefix}-customer`,
          subscription: `${prefix}-subscription`,
          payment_status: 'paid',
        },
      },
    };
    const rawBody = Buffer.from(JSON.stringify(event));
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto.createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET)
      .update(`${timestamp}.${rawBody.toString('utf8')}`)
      .digest('hex');
    const headers = {
      'content-type': 'application/json',
      'stripe-signature': `t=${timestamp},v1=${signature}`,
    };

    const first = await fetch(`${baseUrl}/api/v1/billing/webhook`, { method: 'POST', headers, body: rawBody });
    const second = await fetch(`${baseUrl}/api/v1/billing/webhook`, { method: 'POST', headers, body: rawBody });
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal((await first.json()).received, true);
    assert.equal((await second.json()).duplicate, true);

    assert.equal(await ProviderEvent.countDocuments({ provider: 'stripe', eventId: event.id }), 1);
    const membership = await Membership.findOne({ userId: owner._id }).select('status providerSubscriptionId');
    assert.equal(membership.status, 'active');
    assert.equal(membership.providerSubscriptionId, `${prefix}-subscription`);
  });

  test('route-wide database reads reach every persisted route family', async () => {
    const ownerHeaders = authHeaders(owner);
    const routes = [
      ['api root', 'GET', '/api', 200],
      ['health', 'GET', '/health', 200],
      ['readiness', 'GET', '/readiness', 200],
      ['database status', 'GET', '/database-status', 200],
      ['robots', 'GET', '/robots.txt', 200],
      ['sitemap', 'GET', '/sitemap.xml', 200],
      ['posts', 'GET', '/api/post', 200],
      ['post detail', 'GET', `/api/post/${post._id}`, 200],
      ['post comments', 'GET', `/api/post/${post._id}/comments`, 200],
      ['post search', 'GET', '/api/post/search?query=integration', 200],
      ['category search', 'GET', '/api/post/search-cat?query=integration', 200],
      ['discovery feed', 'GET', '/api/post/feed?mode=latest', 200],
      ['short feed', 'GET', '/api/post/shorts', 200],
      ['depth options', 'GET', `/api/post/depth-options?postId=${post._id}`, 200],
      ['early access', 'GET', '/api/post/early-access', 200],
      ['user lookup', 'GET', `/api/user?username=${owner.username}`, 200],
      ['me', 'GET', '/api/user/me', 200],
      ['my posts', 'GET', '/api/user/me/posts', 200],
      ['bookmarks', 'GET', '/api/user/bookmarks', 200],
      ['analytics', 'GET', '/api/user/analytics', 200],
      ['collection list', 'GET', '/api/collection', 200],
      ['collection detail', 'GET', `/api/collection/${collection._id}`, 200],
      ['eligible collection posts', 'GET', '/api/collection/eligible-posts', 200],
      ['question list', 'GET', '/api/question', 200],
      ['question detail', 'GET', `/api/question/${question._id}`, 200],
      ['question suggest', 'GET', '/api/question/suggest?q=integration', 200],
      ['question opportunities', 'GET', '/api/question/opportunities', 200],
      ['competition list', 'GET', '/api/competition', 200],
      ['competition detail', 'GET', `/api/competition/${competition._id}`, 200],
      ['eligible competition posts', 'GET', `/api/competition/${competition._id}/eligible-posts`, 200],
      ['writer profile', 'GET', `/api/writer/${prefix}-owner`, 200],
      ['unified search', 'GET', '/api/search?q=integration', 200],
      ['onboarding', 'GET', '/api/v1/onboarding', 200],
      ['reading history', 'GET', '/api/v1/reading-history', 200],
      ['entitlements', 'GET', '/api/v1/me/entitlements', 200],
      ['summary', 'GET', `/api/v1/posts/${post._id}/summary`, 200],
      ['workshops', 'GET', '/api/v1/workshops', 200],
      ['creator updates', 'GET', '/api/v1/creator-updates', 200],
      ['received requests', 'GET', '/api/v1/creator-requests/received', 200],
      ['creator support', 'GET', '/api/v1/me/creator-support', 200],
      ['notifications', 'GET', '/api/v1/notifications', 200],
      ['short series list', 'GET', '/api/short-series', 200],
      ['short series detail', 'GET', `/api/short-series/${series._id}`, 200],
      ['eligible shorts', 'GET', '/api/short-series/eligible-shorts', 200],
      ['draft list', 'GET', '/api/drafts', 200],
      ['staff reports', 'GET', '/api/staff/reports', 200],
      ['staff fraud signals', 'GET', `/api/staff/competition-fraud?competitionId=${competition._id}`, 200],
    ];

    for (const [name, method, path, expected] of routes) {
      const response = await fetch(`${baseUrl}${path}`, { method, headers: ownerHeaders });
      assert.equal(response.status, expected, `${name} returned ${response.status}`);
    }
  });

  test('route-wide database mutations persist and can be reloaded', async () => {
    const ownerHeaders = authHeaders(owner);
    const otherHeaders = authHeaders(otherUser);
    const json = async response => ({ status: response.status, body: await response.json().catch(() => null) });

    const draft = await json(await fetch(`${baseUrl}/api/drafts`, {
      method: 'POST', headers: ownerHeaders,
      body: JSON.stringify({ title: `${prefix} draft`, blocks: [{ id: 'draft-1', type: 'text', content: 'draft body' }], tags: ['integration'] }),
    }));
    assert.equal(draft.status, 201);
    const draftId = draft.body.data.id;
    assert.equal((await json(await fetch(`${baseUrl}/api/drafts/${draftId}`, { headers: ownerHeaders }))).status, 200);
    assert.equal((await json(await fetch(`${baseUrl}/api/drafts/${draftId}`, {
      method: 'PUT', headers: ownerHeaders,
      body: JSON.stringify({ expectedVersion: 1, title: `${prefix} draft updated`, blocks: [{ id: 'draft-1', type: 'text', content: 'updated' }] }),
    }))).status, 200);
    assert.equal((await Draft.findById(draftId)).version, 2);

    const onboarding = await json(await fetch(`${baseUrl}/api/v1/onboarding`, {
      method: 'PUT', headers: ownerHeaders,
      body: JSON.stringify({ topicSlugs: [topic.slug], writerIds: [otherUser._id.toString()], completed: true }),
    }));
    assert.equal(onboarding.status, 200);
    assert.equal((await User.findById(owner._id)).onboardingCompletedAt instanceof Date, true);
    assert.equal((await Follow.countDocuments({ followerId: owner._id, followingId: otherUser._id })), 1);
    assert.equal((await json(await fetch(`${baseUrl}/api/v1/interests/inferred`, { method: 'DELETE', headers: ownerHeaders }))).status, 200);

    const createdQuestion = await json(await fetch(`${baseUrl}/api/question`, {
      method: 'POST', headers: ownerHeaders,
      body: JSON.stringify({ text: `${prefix} created question?`, context: 'integration', tags: [topic.slug] }),
    }));
    assert.equal(createdQuestion.status, 201);
    const questionId = createdQuestion.body.data.questionId;
    assert.equal((await json(await fetch(`${baseUrl}/api/question/${questionId}/upvote`, { method: 'PUT', headers: otherHeaders }))).status, 200);
    const answer = await json(await fetch(`${baseUrl}/api/question/${questionId}/answers`, {
      method: 'POST', headers: ownerHeaders, body: JSON.stringify({ text: 'An integration answer.' }),
    }));
    assert.equal(answer.status, 201);
    const answerId = answer.body.data.answer.id;
    assert.equal((await json(await fetch(`${baseUrl}/api/question/${questionId}/answers/${answerId}/upvote`, { method: 'PUT', headers: otherHeaders }))).status, 200);
    assert.equal((await json(await fetch(`${baseUrl}/api/question/${questionId}/follow`, { method: 'PUT', headers: otherHeaders }))).status, 200);
    assert.equal((await Question.findById(questionId)).answers.length, 1);

    const createdCollection = await json(await fetch(`${baseUrl}/api/collection`, {
      method: 'POST', headers: ownerHeaders,
      body: JSON.stringify({ title: `${prefix} created collection`, description: 'integration', postIds: [post._id.toString()], visibility: 'public' }),
    }));
    assert.equal(createdCollection.status, 201);
    const collectionId = createdCollection.body.data.collectionId;
    assert.equal((await json(await fetch(`${baseUrl}/api/collection/${collectionId}/save`, { method: 'PUT', headers: otherHeaders }))).status, 200);
    assert.equal((await json(await fetch(`${baseUrl}/api/collection/${collectionId}/follow`, { method: 'PUT', headers: otherHeaders }))).status, 200);
    assert.equal((await Collection.findById(collectionId)).savedCount, 1);

    assert.equal((await json(await fetch(`${baseUrl}/api/writer/${otherUser._id}/follow`, { method: 'PUT', headers: ownerHeaders }))).status, 200);
    assert.equal((await json(await fetch(`${baseUrl}/api/writer/${otherUser._id}/follow`, { method: 'DELETE', headers: ownerHeaders }))).status, 200);
    assert.equal((await json(await fetch(`${baseUrl}/api/post/${post._id}/comments`, {
      method: 'POST', headers: ownerHeaders, body: JSON.stringify({ text: 'Integration comment.' }),
    }))).status, 201);
    assert.equal((await json(await fetch(`${baseUrl}/api/post/${post._id}/reports`, {
      method: 'POST', headers: otherHeaders, body: JSON.stringify({ reason: 'spam', details: 'Integration report.' }),
    }))).status, 201);

    const eventId = crypto.randomUUID();
    assert.equal((await json(await fetch(`${baseUrl}/api/v1/events`, {
      method: 'POST', headers: otherHeaders,
      body: JSON.stringify({ events: [{ eventId, eventType: 'open', eventAt: new Date().toISOString(), postId: post._id.toString(), surface: 'article', position: 1 }] }),
    }))).status, 202);
    assert.equal(await InteractionEvent.countDocuments({ eventId }), 1);
    assert.equal((await json(await fetch(`${baseUrl}/api/v1/notifications/${notification._id}/read`, { method: 'PUT', headers: ownerHeaders }))).status, 200);
    assert.equal((await Notification.findById(notification._id)).readAt instanceof Date, true);

    const entry = await json(await fetch(`${baseUrl}/api/competition/${competition._id}/entries`, {
      method: 'POST', headers: ownerHeaders, body: JSON.stringify({ postId: post._id.toString(), note: 'Integration entry' }),
    }));
    assert.equal(entry.status, 201);
    const currentCompetition = await Competition.findById(competition._id);
    assert.equal(currentCompetition.entries.length, 1);
    const entryId = currentCompetition.entries[0]._id;
    assert.equal((await json(await fetch(`${baseUrl}/api/competition/${competition._id}/entries/${entryId}/vote`, { method: 'PUT', headers: otherHeaders }))).status, 200);
    assert.equal((await Competition.findById(competition._id)).entries[0].likesCount, 1);

    const newSeries = await json(await fetch(`${baseUrl}/api/short-series`, {
      method: 'POST', headers: ownerHeaders,
      body: JSON.stringify({ title: `${prefix} created series`, description: 'integration', postIds: [shortPost3._id.toString(), shortPost4._id.toString()] }),
    }));
    assert.equal(newSeries.status, 201);
    assert.equal((await json(await fetch(`${baseUrl}/api/short-series/${newSeries.body.data.seriesId}`, {
      method: 'PUT', headers: ownerHeaders,
      body: JSON.stringify({ title: `${prefix} updated series`, description: 'updated', postIds: [shortPost3._id.toString(), shortPost4._id.toString()] }),
    }))).status, 200);

    assert.equal((await json(await fetch(`${baseUrl}/api/v1/creator-support/${otherUser._id}`, {
      method: 'PUT', headers: ownerHeaders, body: JSON.stringify({ allocation: 10 }),
    }))).status, 404);
    assert.equal((await json(await fetch(`${baseUrl}/api/v1/billing/checkout`, {
      method: 'POST', headers: ownerHeaders, body: JSON.stringify({}),
    }))).status, 409);
    assert.equal((await json(await fetch(`${baseUrl}/api/v1/writing-assistant`, {
      method: 'POST', headers: ownerHeaders, body: JSON.stringify({ action: 'tighten', text: 'Integration writing assistant input.' }),
    }))).status, 503);

    assert.equal((await json(await fetch(`${baseUrl}/api/staff/reports`, { headers: ownerHeaders }))).status, 200);
    const report = await Report.findOne({ reporterId: otherUser._id, subjectId: post._id });
    assert.ok(report);
    assert.equal((await json(await fetch(`${baseUrl}/api/staff/reports/${report._id}/reviews`, {
      method: 'POST', headers: ownerHeaders, body: JSON.stringify({ action: 'dismiss', note: 'Integration review' }),
    }))).status, 200);
    assert.equal(await ModerationAction.countDocuments({ reportId: report._id }), 1);

    assert.equal((await json(await fetch(`${baseUrl}/api/drafts/${draftId}`, { method: 'DELETE', headers: ownerHeaders }))).status, 204);
  });
}
